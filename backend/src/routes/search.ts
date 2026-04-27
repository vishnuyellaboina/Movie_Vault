import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { CacheService } from "../lib/cache.js";
import { searchMovies } from "../services/movie-catalog.js";

export async function searchRoutes(app: FastifyInstance) {
  app.get("/search", async (request) => {
    const querySchema = z.object({
      q: z.string().min(1),
      page: z.coerce.number().min(1).default(1),
    });

    const { q, page } = querySchema.parse(request.query);
    const cache = new CacheService(app.redis);
    return searchMovies(cache, q, page);
  });
}
