# MovieVault Backend Deployment

This backend is now ready to be deployed publicly so the mobile app can work on other phones and other networks.

## What must be deployed

Deploy the backend in the [backend](./) folder, not the Expo app.

The backend needs these environment variables:

- `PORT`
- `HOST`
- `TMDB_API_KEY`
- `TMDB_BASE_URL`
- `OMDB_API_KEY`
- `OMDB_BASE_URL`
- `REDIS_URL`
- `DEFAULT_REGION`
- `CORS_ORIGIN` optional

## Public deployment outcome

After deployment, you will get a public backend URL such as:

```text
https://movievault-api.example.com
```

That public URL must be used when building the Expo app.

## Build-time app configuration

Before building the mobile app, set:

```powershell
$env:EXPO_PUBLIC_BACKEND_BASE_URL="https://your-public-backend-url"
```

Then build the app from the project root:

```powershell
cd "F:\Movie_Vault"
$env:EAS_NO_VCS="1"
npx.cmd eas-cli build --platform android --profile preview
```

## Backend runtime check

After deployment, confirm:

```text
GET /health
```

returns:

```json
{"ok":true,"service":"movievault-backend","timestamp":"..."}
```

## Recommended rollout order

1. Deploy backend publicly
2. Confirm `/health` and `/home`
3. Set `EXPO_PUBLIC_BACKEND_BASE_URL`
4. Rebuild APK
5. Install on another phone and test over a different network

## Notes

- Local IPs like `http://192.168.x.x:4000` are for same-network testing only.
- Public sharing requires a public backend URL.
- Redis should also be public or provider-managed in production.
