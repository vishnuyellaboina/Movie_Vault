const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function getPosterUrl(path?: string | null, size: "w342" | "w500" = "w342") {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : undefined;
}

export function getBackdropUrl(path?: string | null, size: "w780" | "w1280" = "w780") {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : undefined;
}

export function getProfileUrl(path?: string | null, size: "w185" | "h632" = "w185") {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : undefined;
}
