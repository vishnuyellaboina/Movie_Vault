import Fastify from "fastify";
import cors from "@fastify/cors";

import { env } from "./config/env.js";
import { redisPlugin } from "./plugins/redis.js";
import { actorRoutes } from "./routes/actor.js";
import { categoryRoutes } from "./routes/category.js";
import { healthRoutes } from "./routes/health.js";
import { homeRoutes } from "./routes/home.js";
import { movieRoutes } from "./routes/movie.js";
import { searchRoutes } from "./routes/search.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN : true,
  });
  app.register(redisPlugin);

  app.register(healthRoutes);
  app.register(homeRoutes);
  app.register(searchRoutes);
  app.register(categoryRoutes);
  app.register(movieRoutes);
  app.register(actorRoutes);

  return app;
}
