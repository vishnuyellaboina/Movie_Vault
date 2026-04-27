import { env } from "../config/env.js";
import { INDUSTRY_CONFIG } from "../lib/industry.js";
import { fetchJson } from "../lib/http.js";
import type { IndustryKey } from "../types/domain.js";

function buildTmdbUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(`${env.TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", env.TMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export const tmdbService = {
  getTrending() {
    return fetchJson<any>(buildTmdbUrl("/trending/movie/week"));
  },

  searchMovies(query: string, page = 1) {
    return fetchJson<any>(
      buildTmdbUrl("/search/movie", {
        query,
        page,
        include_adult: "false",
      }),
    );
  },

  discoverByIndustry(industry: IndustryKey, page = 1, genreId?: number) {
    const config = INDUSTRY_CONFIG[industry];
    return fetchJson<any>(
      buildTmdbUrl("/discover/movie", {
        page,
        with_original_language: config.language,
        with_origin_country: config.withOriginCountry,
        region: config.region,
        with_genres: genreId,
        sort_by: "popularity.desc",
      }),
    );
  },

  getMovieDetails(movieId: number) {
    return fetchJson<any>(buildTmdbUrl(`/movie/${movieId}`));
  },

  getMovieCredits(movieId: number) {
    return fetchJson<any>(buildTmdbUrl(`/movie/${movieId}/credits`));
  },

  getMovieProviders(movieId: number) {
    return fetchJson<any>(buildTmdbUrl(`/movie/${movieId}/watch/providers`));
  },

  getActorDetails(personId: number) {
    return fetchJson<any>(buildTmdbUrl(`/person/${personId}`));
  },

  getActorMovieCredits(personId: number) {
    return fetchJson<any>(buildTmdbUrl(`/person/${personId}/movie_credits`));
  },
};
