import { useCallback } from "react";

import { queryClient } from "@/lib/queryClient";
import { movieService } from "@/services/movieService";

export function useMoviePrefetch() {
  return useCallback((movieId: number) => {
    queryClient.prefetchQuery({
      queryKey: ["movieDetail", movieId],
      queryFn: () => movieService.getMovieDetail(movieId),
      staleTime: 1000 * 60 * 60,
    });
  }, []);
}
