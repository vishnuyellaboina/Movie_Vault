import { useState } from "react";

export function useHomeState() {
  const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>();
  const [query, setQuery] = useState("");

  return {
    selectedGenreId,
    setSelectedGenreId,
    query,
    setQuery,
  };
}
