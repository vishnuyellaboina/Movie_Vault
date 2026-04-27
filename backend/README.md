# MovieVault Backend

This backend is the production-facing API layer for MovieVault. Its job is to:

- protect TMDb and OMDb keys
- combine and normalize upstream responses
- cache hot responses in Redis
- reduce mobile startup latency by collapsing many client-side API calls into a few backend calls

## Proposed role in the architecture

Current mobile app flow:

- phone calls TMDb and OMDb directly
- home screen triggers multiple discovery requests and many follow-up detail requests

Target backend flow:

- mobile app calls `GET /home`
- backend composes the home payload from TMDb and cache
- Redis returns hot data quickly when available

This reduces cold-start pressure on the mobile app and gives us one place to evolve recommendations, watchlist APIs, analytics, and rate-limit protection later.

## Endpoints

- `GET /health`
- `GET /home`
- `GET /search?q=...&page=1`
- `GET /category/:industry?page=1`
- `GET /movie/:id`
- `GET /actor/:id`

## Caching approach

- home rails: 15 minutes
- search: 10 minutes
- category pages: 15 minutes
- movie detail: 24 hours
- actor detail: 24 hours

## Suggested mobile integration path

1. Replace `movieService.getHomeFeed()` mobile-side TMDb orchestration with a single backend `GET /home`.
2. Replace movie detail direct upstream calls with `GET /movie/:id`.
3. Replace actor detail direct upstream calls with `GET /actor/:id`.
4. Keep React Query in the app, but let the backend own aggregation and Redis caching.

## Local setup

```powershell
cd F:\Movie_Vault\backend
copy .env.example .env
npm.cmd install
npm.cmd run dev
```

Expected local server:

- `http://127.0.0.1:4000`

## Notes

- This scaffold is intentionally aligned to the current MovieVault mobile data model.
- It is ready for implementation and extension, but package installation still needs to be run locally.

