import { useQuery } from "@tanstack/react-query";

import { hasMovieApiKeys } from "@/lib/env";
import { movieService } from "@/services/movieService";

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => movieService.getGenres(),
    enabled: hasMovieApiKeys(),
    staleTime: 1000 * 60 * 60 * 24 * 7,
  });
}
