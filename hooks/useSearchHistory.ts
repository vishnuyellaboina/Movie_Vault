import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "movievault:search-history";

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) {
        setHistory(JSON.parse(value));
      }
    });
  }, []);

  const addHistoryEntry = useCallback((query: string) => {
    const normalized = query.trim();
    if (!normalized) {
      return;
    }

    setHistory((current) => {
      if (current[0] === normalized) {
        return current;
      }

      const next = [normalized, ...current.filter((item) => item !== normalized)].slice(0, 8);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    addHistoryEntry,
    clearHistory,
  };
}
