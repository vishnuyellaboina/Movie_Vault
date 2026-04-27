import { useInfiniteQuery } from "@tanstack/react-query";

import { hasSearchSource } from "@/lib/env";
import { movieService } from "@/services/movieService";

export function useMovieSearch(query: string) {
  return useInfiniteQuery({
    queryKey: ["movieSearch", query],
    queryFn: ({ pageParam = 1 }) => movieService.searchMovies(query, pageParam),
    initialPageParam: 1,
    enabled: hasSearchSource() && query.trim().length > 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 15,
  });
}
