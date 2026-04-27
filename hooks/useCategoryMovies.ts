import { useQuery } from "@tanstack/react-query";

import { hasCategorySource } from "@/lib/env";
import { movieService } from "@/services/movieService";
import { IndustryKey } from "@/types/movie";

export function useCategoryMovies(industry: IndustryKey) {
  return useQuery({
    queryKey: ["categoryMovies", industry],
    queryFn: () => movieService.getCategoryMovies(industry, 1),
    enabled: hasCategorySource(),
    staleTime: 1000 * 60 * 30,
  });
}

export function useCategorySearchPool(industry: IndustryKey, enabled: boolean) {
  return useQuery({
    queryKey: ["categorySearchPool", industry],
    queryFn: () => movieService.getCategoryMoviesBatch(industry, 5),
    enabled: hasCategorySource() && enabled,
    staleTime: 1000 * 60 * 30,
  });
}

export function useCategorySearchMovies(industry: IndustryKey, query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["categorySearchMovies", industry, normalizedQuery],
    queryFn: () => movieService.searchCategoryMovies(industry, normalizedQuery, 6),
    enabled: hasCategorySource() && normalizedQuery.length > 0,
    staleTime: 1000 * 60 * 15,
  });
}
