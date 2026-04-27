import Constants from "expo-constants";

type ExtraConfig = {
  tmdbApiKey: string;
  omdbApiKey: string;
  tmdbBaseUrl: string;
  omdbBaseUrl: string;
  backendBaseUrl: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<ExtraConfig>;

const defaults = {
  tmdbBaseUrl: "https://api.themoviedb.org/3",
  omdbBaseUrl: "https://www.omdbapi.com",
  backendBaseUrl: "",
};

export const env = {
  tmdbApiKey: extra.tmdbApiKey?.trim() ?? "",
  omdbApiKey: extra.omdbApiKey?.trim() ?? "",
  tmdbBaseUrl: extra.tmdbBaseUrl?.trim() || defaults.tmdbBaseUrl,
  omdbBaseUrl: extra.omdbBaseUrl?.trim() || defaults.omdbBaseUrl,
  backendBaseUrl: extra.backendBaseUrl?.trim() || defaults.backendBaseUrl,
};

export function hasMovieApiKeys() {
  return Boolean(env.tmdbApiKey && env.omdbApiKey);
}

export function hasBackendBaseUrl() {
  return Boolean(env.backendBaseUrl);
}

export function hasHomeFeedSource() {
  return hasBackendBaseUrl() || hasMovieApiKeys();
}

export function hasMovieDetailSource() {
  return hasBackendBaseUrl() || hasMovieApiKeys();
}

export function hasActorDetailSource() {
  return hasBackendBaseUrl() || hasMovieApiKeys();
}

export function hasSearchSource() {
  return hasBackendBaseUrl() || hasMovieApiKeys();
}

export function hasCategorySource() {
  return hasBackendBaseUrl() || hasMovieApiKeys();
}

export function getMissingMovieApiConfigMessage() {
  return "Add backendBaseUrl or tmdbApiKey and omdbApiKey in app.json under expo.extra to load live movie data.";
}

export function requireMovieEnv() {
  if (!hasMovieApiKeys()) {
    throw new Error(getMissingMovieApiConfigMessage());
  }

  return env;
}
