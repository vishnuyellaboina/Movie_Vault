import { env } from "../config/env.js";
import { fetchJson } from "../lib/http.js";

function buildOmdbUrl(params: Record<string, string | number | undefined>) {
  const url = new URL(env.OMDB_BASE_URL);
  url.searchParams.set("apikey", env.OMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export const omdbService = {
  getByImdbId(imdbId: string) {
    return fetchJson<any>(buildOmdbUrl({ i: imdbId, plot: "short" }));
  },
};
