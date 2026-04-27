import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { CacheService } from "../lib/cache.js";
import { getActorDetail } from "../services/movie-catalog.js";

export async function actorRoutes(app: FastifyInstance) {
  app.get("/actor/:id", async (request) => {
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive(),
    });

    const { id } = paramsSchema.parse(request.params);
    const cache = new CacheService(app.redis);
    return getActorDetail(cache, id);
  });
}
