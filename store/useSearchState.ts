import { useState } from "react";

export function useSearchState() {
  const [query, setQuery] = useState("");

  return {
    query,
    setQuery,
  };
}
