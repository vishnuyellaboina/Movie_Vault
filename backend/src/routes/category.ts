import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { CacheService } from "../lib/cache.js";
import { getCategoryMovies, searchCategoryMovies } from "../services/movie-catalog.js";

const industrySchema = z.enum(["hollywood", "bollywood", "tollywood", "kollywood", "mollywood"]);

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/category/:industry", async (request) => {
    const paramsSchema = z.object({
      industry: industrySchema,
    });
    const querySchema = z.object({
      page: z.coerce.number().min(1).default(1),
      q: z.string().optional(),
    });

    const { industry } = paramsSchema.parse(request.params);
    const { page, q } = querySchema.parse(request.query);
    const cache = new CacheService(app.redis);

    if (q && q.trim().length > 0) {
      return searchCategoryMovies(cache, industry, q);
    }

    return getCategoryMovies(cache, industry, page);
  });
}
