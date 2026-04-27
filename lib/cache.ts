import AsyncStorage from "@react-native-async-storage/async-storage";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function getCachedValue<T>(key: string): Promise<T | null> {
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
    return memoryEntry.value as T;
  }

  const stored = await AsyncStorage.getItem(key);
  if (!stored) {
    return null;
  }

  const parsed = JSON.parse(stored) as CacheEntry<T>;
  if (parsed.expiresAt <= Date.now()) {
    await AsyncStorage.removeItem(key);
    return null;
  }

  memoryCache.set(key, parsed);
  return parsed.value;
}

export async function setCachedValue<T>(key: string, value: T, ttlMs: number) {
  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };

  memoryCache.set(key, entry);
  await AsyncStorage.setItem(key, JSON.stringify(entry));
}
