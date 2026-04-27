import { useQuery } from "@tanstack/react-query";

import { hasHomeFeedSource } from "@/lib/env";
import { movieService } from "@/services/movieService";

export function useHomeFeed(genreId?: number) {
  return useQuery({
    queryKey: ["homeFeed", genreId ?? "all"],
    queryFn: () => movieService.getHomeFeed(genreId),
    enabled: hasHomeFeedSource(),
  });
}
