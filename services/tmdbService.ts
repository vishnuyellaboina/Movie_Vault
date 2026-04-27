import { requireMovieEnv } from "@/lib/env";
import { INDUSTRY_CONFIG } from "@/lib/industries";
import { fetchJson } from "@/services/http";
import { IndustryKey } from "@/types/movie";

function buildTmdbUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const env = requireMovieEnv();
  const url = new URL(`${env.tmdbBaseUrl}${path}`);
  url.searchParams.set("api_key", env.tmdbApiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

export const tmdbService = {
  searchMovies(query: string, page = 1) {
    return fetchJson<any>(
      buildTmdbUrl("/search/movie", {
        query,
        page,
        include_adult: "false",
      }),
    );
  },

  getTrending() {
    return fetchJson<any>(buildTmdbUrl("/trending/movie/week"));
  },

  getGenres() {
    return fetchJson<any>(buildTmdbUrl("/genre/movie/list"));
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
