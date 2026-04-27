import type { ExpoConfig } from "expo/config";

const backendBaseUrl =
  process.env.EXPO_PUBLIC_BACKEND_BASE_URL?.trim() || "http://192.168.1.8:4000";
const tmdbApiKey =
  process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim() || "bda590df198a6ce269a4652ea6c47aca";
const omdbApiKey =
  process.env.EXPO_PUBLIC_OMDB_API_KEY?.trim() || "db662c39";

const config: ExpoConfig = {
  name: "MovieVault",
  slug: "movievault",
  scheme: "movievault",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/movievault-logo.png",
  splash: {
    image: "./assets/movievault-logo.png",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  assetBundlePatterns: ["**/*"],
  experiments: {
    typedRoutes: true,
  },
  android: {
    package: "com.movievault.app",
    adaptiveIcon: {
      foregroundImage: "./assets/movievault-logo.png",
      backgroundColor: "#0B1020",
    },
  },
  plugins: ["expo-router"],
  extra: {
    backendBaseUrl,
    tmdbApiKey,
    omdbApiKey,
    tmdbBaseUrl: "https://api.themoviedb.org/3",
    omdbBaseUrl: "https://www.omdbapi.com",
    router: {},
    eas: {
      projectId: "4f3e34f2-fff6-4937-9fef-2d40216dc15f",
    },
  },
};

export default config;
