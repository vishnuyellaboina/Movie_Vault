import { useQuery } from "@tanstack/react-query";

import { hasActorDetailSource } from "@/lib/env";
import { movieService } from "@/services/movieService";

export function useActorDetail(actorId: number) {
  return useQuery({
    queryKey: ["actorDetail", actorId],
    queryFn: () => movieService.getActorDetail(actorId),
    enabled: hasActorDetailSource() && Number.isFinite(actorId),
  });
}
