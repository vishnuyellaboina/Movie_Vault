import { createRequire } from "node:module";

import fp from "fastify-plugin";
import type { Redis } from "ioredis";

import { env } from "../config/env.js";

const require = createRequire(import.meta.url);
const RedisCtor = require("ioredis") as new (
  url: string,
  options?: Record<string, unknown>,
) => Redis;

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}

export const redisPlugin = fp(async (app) => {
  const redis = new RedisCtor(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: () => null,
  });

  redis.on("error", (error: Error) => {
    app.log.warn({ err: error }, "Redis unavailable, falling back to in-memory cache");
  });

  try {
    await redis.connect();
    app.log.info("Redis connected");
  } catch (error: unknown) {
    app.log.warn({ err: error }, "Redis connection failed, backend will continue with in-memory cache");
  }

  app.decorate("redis", redis);

  app.addHook("onClose", async () => {
    if (redis.status === "ready") {
      await redis.quit();
    }
  });
});
