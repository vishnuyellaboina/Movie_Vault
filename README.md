# MovieVault

MovieVault is a production-minded Expo mobile app scaffold for movie discovery across TMDb and OMDb. It is structured for fast search, normalized data, cache-first UX, and future expansion into watchlists, recommendations, and offline support.

## What is included

- Expo Router navigation shell
- TanStack Query data layer
- Local and in-memory caching helpers
- TMDb and OMDb service clients
- Unified movie and actor data normalization
- Debounced search with prefetch hooks
- Skeleton-first loading patterns
- Themed UI foundation for dark and light mode
- Search history persistence
- Category, detail, actor, and watchlist screens

## Setup

1. Install dependencies:

```powershell
npm.cmd install
```

2. Add your API keys in `app.json` under `expo.extra`:

- `tmdbApiKey`
- `omdbApiKey`

3. Start Expo:

```powershell
npm.cmd run start
```

4. Open the project in Expo Go on Android.

## Next production steps

1. Move API access behind a Node + Redis aggregator.
2. Persist React Query cache for stronger offline behavior.
3. Add auth and a synced watchlist.
4. Instrument search latency, cache hit rate, and screen transition timing.

## Backend scaffold

A production backend scaffold now lives in [backend](./backend). It is designed to:

- aggregate TMDb and OMDb responses
- cache hot responses in Redis
- reduce cold-start latency on the mobile app
- protect API keys from the public client

Primary planned endpoints:

- `GET /home`
- `GET /search`
- `GET /category/:industry`
- `GET /movie/:id`
- `GET /actor/:id`

## Public deployment note

For the app to work on other phones and other networks, the backend must be deployed publicly and the app must be built with a public backend URL.

Build-time example:

```powershell
$env:EXPO_PUBLIC_BACKEND_BASE_URL="https://your-public-backend-url"
cd "F:\Movie_Vault"
$env:EAS_NO_VCS="1"
npx.cmd eas-cli build --platform android --profile preview
```

Detailed backend deployment notes are in [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md).
