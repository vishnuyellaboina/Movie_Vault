import type { CacheService } from "../lib/cache.js";
import type { FastifyInstance } from "fastify";
import { tmdbService } from "./tmdb.js";
import { omdbService } from "./omdb.js";
import {
  buildMoviePage,
  normalizeActorDetail,
  normalizeActorFilmographyItem,
  normalizeMovieDetail,
  normalizeMovieSummary,
} from "./normalizers.js";
import type { HomeFeed, IndustryKey, MovieDetail, MoviePage, PersonDetail } from "../types/domain.js";

const DAY_SECONDS = 60 * 60 * 24;
const HOUR_SECONDS = 60 * 60;

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function matchesIndustryMovie(movie: any, industry: IndustryKey) {
  const languageMap: Record<IndustryKey, string | undefined> = {
    hollywood: "en",
    bollywood: "hi",
    tollywood: "te",
    kollywood: "ta",
    mollywood: "ml",
  };
  const expectedLanguage = languageMap[industry];

  if (!expectedLanguage) {
    return true;
  }

  return movie.original_language === expectedLanguage;
}

function matchesMovieQuery(movie: any, compactQuery: string) {
  const title = normalizeSearchText(typeof movie.title === "string" ? movie.title : "");
  const originalTitle = normalizeSearchText(
    typeof movie.original_title === "string" ? movie.original_title : "",
  );

  return !compactQuery || title.includes(compactQuery) || originalTitle.includes(compactQuery);
}

export async function getHomeFeed(cache: CacheService): Promise<HomeFeed> {
  return cache.getOrSet("home:v1", { ttlSeconds: 15 * 60 }, async () => {
    const takeFour = (results: any[] = []) => results.slice(0, 4).map(normalizeMovieSummary);

    const safeLoad = async <T>(producer: () => Promise<T>, fallback: T) => {
      try {
        return await producer();
      } catch {
        return fallback;
      }
    };

    const trending = await safeLoad(() => tmdbService.getTrending(), { results: [] as any[] });
    const bollywood = await safeLoad(
      () => tmdbService.discoverByIndustry("bollywood", 1),
      { results: [] as any[] },
    );
    const tollywood = await safeLoad(
      () => tmdbService.discoverByIndustry("tollywood", 1),
      { results: [] as any[] },
    );
    const hollywood = await safeLoad(
      () => tmdbService.discoverByIndustry("hollywood", 1),
      { results: [] as any[] },
    );
    const kollywood = await safeLoad(
      () => tmdbService.discoverByIndustry("kollywood", 1),
      { results: [] as any[] },
    );
    const mollywood = await safeLoad(
      () => tmdbService.discoverByIndustry("mollywood", 1),
      { results: [] as any[] },
    );

    return {
      trending: takeFour(trending.results),
      bollywood: takeFour(bollywood.results),
      tollywood: takeFour(tollywood.results),
      hollywood: takeFour(hollywood.results),
      kollywood: takeFour(kollywood.results),
      mollywood: takeFour(mollywood.results),
    };
  });
}

export async function searchMovies(cache: CacheService, query: string, page: number): Promise<MoviePage> {
  return cache.getOrSet(`search:v1:${query}:${page}`, { ttlSeconds: 10 * 60 }, async () => {
    const payload = await tmdbService.searchMovies(query, page);
    return buildMoviePage(payload);
  });
}

export async function getCategoryMovies(
  cache: CacheService,
  industry: IndustryKey,
  page: number,
): Promise<MoviePage> {
  return cache.getOrSet(`category:v1:${industry}:${page}`, { ttlSeconds: 15 * 60 }, async () => {
    const payload = await tmdbService.discoverByIndustry(industry, page);
    return buildMoviePage(payload);
  });
}

export async function getMovieDetail(cache: CacheService, movieId: number): Promise<MovieDetail> {
  return cache.getOrSet(`movie:v1:${movieId}`, { ttlSeconds: DAY_SECONDS }, async () => {
    const [movie, credits, providers] = await Promise.all([
      tmdbService.getMovieDetails(movieId),
      tmdbService.getMovieCredits(movieId),
      tmdbService.getMovieProviders(movieId),
    ]);

    const omdb = movie.imdb_id ? await omdbService.getByImdbId(movie.imdb_id) : undefined;
    return normalizeMovieDetail(movie, credits, providers, omdb);
  });
}

export async function getActorDetail(cache: CacheService, actorId: number): Promise<PersonDetail> {
  return cache.getOrSet(`actor:v1:${actorId}`, { ttlSeconds: DAY_SECONDS }, async () => {
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
}

export async function searchCategoryMovies(
  cache: CacheService,
  industry: IndustryKey,
  query: string,
): Promise<MoviePage> {
  return cache.getOrSet(`category-search:v1:${industry}:${query}`, { ttlSeconds: HOUR_SECONDS }, async () => {
    const normalizedQuery = query.trim();
    const searchPageNumbers = Array.from({ length: 5 }, (_, index) => index + 1);
    const catalogPageNumbers = Array.from({ length: 20 }, (_, index) => index + 1);

    const [searchPayloads, catalogPayloads] = await Promise.all([
      Promise.all(searchPageNumbers.map((page) => tmdbService.searchMovies(normalizedQuery, page))),
      Promise.all(catalogPageNumbers.map((page) => tmdbService.discoverByIndustry(industry, page))),
    ]);

    const compactQuery = normalizeSearchText(normalizedQuery);
    const deduped = new Map<number, any>();

    const addMovie = (movie: any) => {
      if (!matchesIndustryMovie(movie, industry) || !matchesMovieQuery(movie, compactQuery)) {
        return;
      }

      if (!deduped.has(movie.id)) {
        deduped.set(movie.id, movie);
      }
    };

    searchPayloads.forEach((payload) => payload.results.forEach(addMovie));
    catalogPayloads.forEach((payload) => payload.results.forEach(addMovie));

    const results = Array.from(deduped.values()).map(normalizeMovieSummary);
    return {
      page: 1,
      totalPages: 1,
      results,
    };
  });
}
