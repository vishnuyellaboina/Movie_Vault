import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.string().default("development"),
  CORS_ORIGIN: z.string().optional(),
  TMDB_API_KEY: z.string().min(1),
  TMDB_BASE_URL: z.string().url().default("https://api.themoviedb.org/3"),
  OMDB_API_KEY: z.string().min(1),
  OMDB_BASE_URL: z.string().url().default("https://www.omdbapi.com"),
  REDIS_URL: z.string().min(1).default("redis://127.0.0.1:6379"),
  DEFAULT_REGION: z.string().default("IN"),
});

export const env = envSchema.parse(process.env);
