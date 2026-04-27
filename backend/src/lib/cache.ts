import type { Redis } from "ioredis";

type CacheOptions = {
  ttlSeconds: number;
};

type MemoryEntry = {
  expiresAt: number;
  value: unknown;
};

const memoryCache = new Map<string, MemoryEntry>();

export class CacheService {
  constructor(private readonly redis?: Redis | null) {}

  async getOrSet<T>(key: string, options: CacheOptions, producer: () => Promise<T>): Promise<T> {
    const memoryEntry = memoryCache.get(key);
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.value as T;
    }

    if (this.redis?.status === "ready") {
      try {
        const cached = await this.redis.get(key);
        if (cached) {
          const parsed = JSON.parse(cached) as T;
          memoryCache.set(key, {
            value: parsed,
            expiresAt: Date.now() + options.ttlSeconds * 1000,
          });
          return parsed;
        }
      } catch {
        // Fall back to memory cache only.
      }
    }

    const fresh = await producer();
    memoryCache.set(key, {
      value: fresh,
      expiresAt: Date.now() + options.ttlSeconds * 1000,
    });

    if (this.redis?.status === "ready") {
      try {
        await this.redis.set(key, JSON.stringify(fresh), "EX", options.ttlSeconds);
      } catch {
        // Fall back to memory cache only.
      }
    }

    return fresh;
  }
}
