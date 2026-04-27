import { env, hasBackendBaseUrl } from "@/lib/env";
import { getCachedValue, setCachedValue } from "@/lib/cache";
import { INDUSTRY_CONFIG } from "@/lib/industries";
import { fetchJson } from "@/services/http";
import { tmdbService } from "@/services/tmdbService";
import { omdbService } from "@/services/omdbService";
import {
  normalizeActorDetail,
  normalizeActorFilmographyItem,
  normalizeGenres,
  normalizeMovieDetail,
  normalizeMovieSummary,
} from "@/services/normalizers";
import { Genre, HomeFeed, IndustryKey, MovieDetail, MoviePage } from "@/types/movie";
import { PersonDetail } from "@/types/person";

const DAY = 1000 * 60 * 60 * 24;
const HOUR = 1000 * 60 * 60;
const HOME_FEED_CACHE_VERSION = "v2";
const MOVIE_DETAIL_CACHE_VERSION = "v7";
const ACTOR_DETAIL_CACHE_VERSION = "v5";

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function matchesIndustryMovie(movie: any, industry: IndustryKey) {
  const config = INDUSTRY_CONFIG[industry];
  if (!config.language) {
    return true;
  }

  return movie.original_language === config.language;
}

function matchesMovieQuery(movie: any, compactQuery: string) {
  const normalizedTitle = normalizeSearchText(
    typeof movie.title === "string" ? movie.title : "",
  );
  const normalizedOriginalTitle = normalizeSearchText(
    typeof movie.original_title === "string" ? movie.original_title : "",
  );

  return (
    !compactQuery ||
    normalizedTitle.includes(compactQuery) ||
    normalizedOriginalTitle.includes(compactQuery)
  );
}

function scoreMovieQuery(movie: any, compactQuery: string) {
  if (!compactQuery) {
    return 0;
  }

  const normalizedTitle = normalizeSearchText(
    typeof movie.title === "string" ? movie.title : "",
  );
  const normalizedOriginalTitle = normalizeSearchText(
    typeof movie.original_title === "string" ? movie.original_title : "",
  );
  const normalizedOverview = normalizeSearchText(
    typeof movie.overview === "string" ? movie.overview : "",
  );

  if (normalizedTitle === compactQuery || normalizedOriginalTitle === compactQuery) {
    return 400;
  }

  if (
    normalizedTitle.startsWith(compactQuery) ||
    normalizedOriginalTitle.startsWith(compactQuery)
  ) {
    return 300;
  }

  if (
    normalizedTitle.includes(compactQuery) ||
    normalizedOriginalTitle.includes(compactQuery)
  ) {
    return 200;
  }

  if (normalizedOverview.includes(compactQuery)) {
    return 100;
  }

  return 0;
}

async function getOrSet<T>(key: string, ttlMs: number, producer: () => Promise<T>) {
  const cached = await getCachedValue<T>(key);
  if (cached) {
    return cached;
  }

  const fresh = await producer();
  await setCachedValue(key, fresh, ttlMs);
  return fresh;
}

export const movieService = {
  async getGenres(): Promise<Genre[]> {
    return getOrSet("genres", DAY * 7, async () => {
      const payload = await tmdbService.getGenres();
      return normalizeGenres(payload);
    });
  },

  async getHomeFeed(genreId?: number): Promise<HomeFeed> {
    return getOrSet(`home:${HOME_FEED_CACHE_VERSION}:${genreId ?? "all"}`, HOUR, async () => {
      if (hasBackendBaseUrl()) {
        try {
          const url = new URL("/home", env.backendBaseUrl).toString();
          return await fetchJson<HomeFeed>(url);
        } catch {
          // Fall back to direct TMDb loading when the backend is unreachable.
        }
      }

      const [trending, bollywood, tollywood, hollywood, kollywood, mollywood] = await Promise.all([
        tmdbService.getTrending(),
        tmdbService.discoverByIndustry("bollywood", 1, genreId),
        tmdbService.discoverByIndustry("tollywood", 1, genreId),
        tmdbService.discoverByIndustry("hollywood", 1, genreId),
        tmdbService.discoverByIndustry("kollywood", 1, genreId),
        tmdbService.discoverByIndustry("mollywood", 1, genreId),
      ]);

      const enrichSummaries = async (results: any[]) => {
        const topResults = results.slice(0, 10);
        const detailed = await Promise.all(
          topResults.map(async (movie) => {
            try {
              const detail = await tmdbService.getMovieDetails(movie.id);
              return normalizeMovieSummary(detail);
            } catch {
              return normalizeMovieSummary(movie);
            }
          }),
        );

        return detailed;
      };

      return {
        trending: await enrichSummaries(trending.results),
        bollywood: await enrichSummaries(bollywood.results),
        tollywood: await enrichSummaries(tollywood.results),
        hollywood: await enrichSummaries(hollywood.results),
        kollywood: await enrichSummaries(kollywood.results),
        mollywood: await enrichSummaries(mollywood.results),
      };
    });
  },

  async searchMovies(query: string, page = 1): Promise<MoviePage> {
    if (hasBackendBaseUrl()) {
      try {
        const url = new URL("/search", env.backendBaseUrl);
        url.searchParams.set("q", query.trim());
        url.searchParams.set("page", String(page));
        return await fetchJson<MoviePage>(url.toString());
      } catch {
        // Fall back to direct TMDb loading when the backend is unreachable.
      }
    }

    const normalizedQuery = query.trim();
    const batchSize = 3;
    const startPage = (page - 1) * batchSize + 1;
    const pageNumbers = Array.from({ length: batchSize }, (_, index) => startPage + index);
    const payloads = await Promise.all(
      pageNumbers.map((pageNumber) => tmdbService.searchMovies(normalizedQuery, pageNumber)),
    );
    const firstPayload = payloads[0];
    const compactQuery = normalizeSearchText(normalizedQuery);
    const deduped = new Map<number, any>();

    payloads.forEach((payload) => {
      payload.results.forEach((movie: any) => {
        if (!deduped.has(movie.id)) {
          deduped.set(movie.id, movie);
        }
      });
    });

    const sorted = Array.from(deduped.values()).sort((left, right) => {
      const scoreDiff = scoreMovieQuery(right, compactQuery) - scoreMovieQuery(left, compactQuery);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return (right.vote_average ?? 0) - (left.vote_average ?? 0);
    });

    return {
      page,
      totalPages: Math.ceil((firstPayload.total_pages ?? 1) / batchSize),
      results: sorted.map(normalizeMovieSummary),
    };
  },

  async getCategoryMovies(industry: IndustryKey, page = 1): Promise<MoviePage> {
    if (hasBackendBaseUrl()) {
      try {
        const url = new URL(`/category/${industry}`, env.backendBaseUrl);
        url.searchParams.set("page", String(page));
        return await fetchJson<MoviePage>(url.toString());
      } catch {
        // Fall back to direct TMDb loading when the backend is unreachable.
      }
    }

    const payload = await tmdbService.discoverByIndustry(industry, page);
    return {
      page: payload.page,
      totalPages: payload.total_pages,
      results: payload.results.map(normalizeMovieSummary),
    };
  },

  async getCategoryMoviesBatch(industry: IndustryKey, pages = 5) {
    if (hasBackendBaseUrl()) {
      try {
        const payloads = await Promise.all(
          Array.from({ length: pages }, (_, index) => {
            const url = new URL(`/category/${industry}`, env.backendBaseUrl);
            url.searchParams.set("page", String(index + 1));
            return fetchJson<MoviePage>(url.toString());
          }),
        );

        const deduped = new Map<number, ReturnType<typeof normalizeMovieSummary>>();
        payloads.forEach((payload) => {
          payload.results.forEach((movie) => {
            if (!deduped.has(movie.id)) {
              deduped.set(movie.id, movie);
            }
          });
        });

        return Array.from(deduped.values());
      } catch {
        // Fall back to direct TMDb loading when the backend is unreachable.
      }
    }

    const pageNumbers = Array.from({ length: pages }, (_, index) => index + 1);
    const payloads = await Promise.all(
      pageNumbers.map((page) => tmdbService.discoverByIndustry(industry, page)),
    );

    const deduped = new Map<number, ReturnType<typeof normalizeMovieSummary>>();
    payloads.forEach((payload) => {
      payload.results.forEach((movie: any) => {
        if (!deduped.has(movie.id)) {
          deduped.set(movie.id, normalizeMovieSummary(movie));
        }
      });
    });

    return Array.from(deduped.values());
  },

  async searchCategoryMovies(industry: IndustryKey, query: string, pages = 5) {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return [];
    }

    if (hasBackendBaseUrl()) {
      try {
        const url = new URL(`/category/${industry}`, env.backendBaseUrl);
        url.searchParams.set("q", normalizedQuery);
        const payload = await fetchJson<MoviePage>(url.toString());
        return payload.results;
      } catch {
        // Fall back to direct TMDb loading when the backend is unreachable.
      }
    }

    const searchPageNumbers = Array.from({ length: pages }, (_, index) => index + 1);
    const catalogPageNumbers = Array.from({ length: 20 }, (_, index) => index + 1);
    const [searchPayloads, catalogPayloads] = await Promise.all([
      Promise.all(searchPageNumbers.map((page) => tmdbService.searchMovies(normalizedQuery, page))),
      Promise.all(
        catalogPageNumbers.map((page) => tmdbService.discoverByIndustry(industry, page)),
      ),
    ]);
    const compactQuery = normalizeSearchText(normalizedQuery);
    const deduped = new Map<number, ReturnType<typeof normalizeMovieSummary>>();

    const addMovie = (movie: any) => {
      if (!matchesIndustryMovie(movie, industry) || !matchesMovieQuery(movie, compactQuery)) {
        return;
      }

      if (!deduped.has(movie.id)) {
        deduped.set(movie.id, normalizeMovieSummary(movie));
      }
    };

    searchPayloads.forEach((payload) => {
      payload.results.forEach((movie: any) => {
        addMovie(movie);
      });
    });

    catalogPayloads.forEach((payload) => {
      payload.results.forEach((movie: any) => {
        addMovie(movie);
      });
    });

    if (deduped.size > 0) {
      return Array.from(deduped.values());
    }

    const fallbackCatalogPageNumbers = Array.from({ length: 20 }, (_, index) => index + 21);
    const fallbackCatalogPayloads = await Promise.all(
      fallbackCatalogPageNumbers.map((page) => tmdbService.discoverByIndustry(industry, page)),
    );
    const fallbackMatches = new Map<number, ReturnType<typeof normalizeMovieSummary>>();
    fallbackCatalogPayloads.forEach((payload) => {
      payload.results.forEach((movie: any) => {
        if (
          matchesIndustryMovie(movie, industry) &&
          matchesMovieQuery(movie, compactQuery) &&
          !fallbackMatches.has(movie.id)
        ) {
          fallbackMatches.set(movie.id, normalizeMovieSummary(movie));
        }
      });
    });

    return Array.from(fallbackMatches.values());
  },

  async getMovieDetail(movieId: number): Promise<MovieDetail> {
    return getOrSet(`movie:${MOVIE_DETAIL_CACHE_VERSION}:${movieId}`, DAY, async () => {
      if (hasBackendBaseUrl()) {
        try {
          const url = new URL(`/movie/${movieId}`, env.backendBaseUrl).toString();
          return await fetchJson<MovieDetail>(url);
        } catch {
          // Fall back to direct provider calls when the backend is unreachable.
        }
      }

      const [movie, credits, providers] = await Promise.all([
        tmdbService.getMovieDetails(movieId),
        tmdbService.getMovieCredits(movieId),
        tmdbService.getMovieProviders(movieId),
      ]);

      const omdb = movie.imdb_id ? await omdbService.getByImdbId(movie.imdb_id) : undefined;
      return normalizeMovieDetail(movie, credits, providers, omdb);
    });
  },

  async getActorDetail(actorId: number): Promise<PersonDetail> {
    return getOrSet(`actor:${ACTOR_DETAIL_CACHE_VERSION}:${actorId}`, DAY, async () => {
      if (hasBackendBaseUrl()) {
        try {
          const url = new URL(`/actor/${actorId}`, env.backendBaseUrl).toString();
          return await fetchJson<PersonDetail>(url);
        } catch {
          // Fall back to direct provider calls when the backend is unreachable.
        }
      }

      const [person, credits] = await Promise.all([
        tmdbService.getActorDetails(actorId),
        tmdbService.getActorMovieCredits(actorId),
      ]);

      const combinedCredits = [...(credits?.cast ?? []), ...(credits?.crew ?? [])]
        .filter((movie: any) => movie && movie.id && movie.release_date);
      const dedupedCredits = new Map<number, any>();
      combinedCredits.forEach((movie: any) => {
        if (!dedupedCredits.has(movie.id)) {
          dedupedCredits.set(movie.id, movie);
        }
      });

      const releasedCredits = Array.from(dedupedCredits.values()).sort((left: any, right: any) => {
        const leftDate = left.release_date || "";
        const rightDate = right.release_date || "";
        return rightDate.localeCompare(leftDate);
      });
      const displayCredits = releasedCredits.slice(0, 30);
      const detailedDisplayCredits = await Promise.all(
        displayCredits.map(async (movie: any) => {
          try {
            const detail = await tmdbService.getMovieDetails(movie.id);
            return { ...movie, revenue: detail.revenue };
          } catch {
            return movie;
          }
        }),
      );

      const debutSource = [...releasedCredits].sort((left: any, right: any) =>
        (left.release_date || "").localeCompare(right.release_date || ""),
      )[0];

      const topBoxOfficeSource = [...detailedDisplayCredits]
        .filter((movie: any) => typeof movie.revenue === "number" && movie.revenue > 0)
        .sort((left: any, right: any) => (right.revenue ?? 0) - (left.revenue ?? 0))[0];

      return {
        ...normalizeActorDetail(person),
        debutMovie: debutSource ? normalizeActorFilmographyItem(debutSource) : undefined,
        topBoxOfficeMovie: topBoxOfficeSource
          ? normalizeActorFilmographyItem(topBoxOfficeSource)
          : undefined,
        filmography: detailedDisplayCredits.map(normalizeActorFilmographyItem),
        totalFilmographyCount: releasedCredits.length,
      };
    });
  },
};
