import { useQuery } from "@tanstack/react-query";

import { hasMovieDetailSource } from "@/lib/env";
import { movieService } from "@/services/movieService";

export function useMovieDetail(movieId: number) {
  return useQuery({
    queryKey: ["movieDetail", movieId],
    queryFn: () => movieService.getMovieDetail(movieId),
    enabled: hasMovieDetailSource() && Number.isFinite(movieId),
  });
}
