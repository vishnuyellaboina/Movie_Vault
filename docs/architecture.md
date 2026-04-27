# MovieVault Architecture

## Frontend principles

- TMDb drives discovery, lists, credits, providers, and images.
- OMDb is used only for high-value enrichment such as IMDb rating and box office.
- Search is debounced to reduce wasted API traffic.
- Detail pages fetch in parallel and render from cached data when available.
- Local storage backs recent searches and TTL-based response caching.

## Near-term backend

Move production traffic to a Node service with Redis caching:

- `/search`
- `/movie/:id`
- `/movie/:id/providers`
- `/person/:id`
- `/recommendations`

Benefits:

- API key protection
- shared cache across users
- normalized responses
- better rate-limit protection
- server-side prewarming for popular rails

## Recommendation starter

Start with heuristic recommendations:

- shared genres
- same cast or director
- same language or region
- boosted by recent popularity and user watch history

Later add:

- collaborative filtering
- session-based ranking
- watchlist similarity

## Offline roadmap

1. Persist React Query cache.
2. Cache last viewed movie details and posters.
3. Support local watchlist mutations while offline.
4. Add sync queue when backend auth is introduced.
