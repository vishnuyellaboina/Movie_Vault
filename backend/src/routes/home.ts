import type { FastifyInstance } from "fastify";

import { CacheService } from "../lib/cache.js";
import { getHomeFeed } from "../services/movie-catalog.js";

export async function homeRoutes(app: FastifyInstance) {
  app.get("/home", async () => {
    const cache = new CacheService(app.redis);
    return getHomeFeed(cache);
  });
}
