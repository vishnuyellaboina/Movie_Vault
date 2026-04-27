import { requireMovieEnv } from "@/lib/env";
import { fetchJson } from "@/services/http";

function buildOmdbUrl(imdbId: string) {
  const env = requireMovieEnv();
  const url = new URL(env.omdbBaseUrl);
  url.searchParams.set("apikey", env.omdbApiKey);
  url.searchParams.set("i", imdbId);
  return url.toString();
}

export const omdbService = {
  getByImdbId(imdbId: string) {
    return fetchJson<any>(buildOmdbUrl(imdbId));
  },
};
