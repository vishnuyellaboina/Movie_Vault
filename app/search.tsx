import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { MovieGrid } from "@/components/lists/MovieGrid";
import { SearchBar } from "@/components/search/SearchBar";
import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { Screen } from "@/components/ui/Screen";
import { AppText } from "@/components/ui/AppText";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMovieSearch } from "@/hooks/useMovieSearch";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { getMissingMovieApiConfigMessage, hasSearchSource } from "@/lib/env";
import { useSearchState } from "@/store/useSearchState";
import { useTheme } from "@/theme/ThemeProvider";

export default function SearchScreen() {
  const { theme } = useTheme();
  const { query, setQuery } = useSearchState();
  const debouncedQuery = useDebouncedValue(query, 350);
  const { data, isLoading, fetchNextPage, hasNextPage } = useMovieSearch(debouncedQuery);
  const { history, addHistoryEntry, clearHistory } = useSearchHistory();

  const movies = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  );

  useEffect(() => {
    if (debouncedQuery.trim()) {
      addHistoryEntry(debouncedQuery);
    }
  }, [addHistoryEntry, debouncedQuery]);

  return (
    <Screen>
      <View style={styles.content}>
        <AppText style={[styles.title, { color: theme.colors.text }]} weight="bold">
          Search
        </AppText>
        <SearchBar value={query} onChangeText={setQuery} />

        {!hasSearchSource() ? (
          <ConfigNotice message={getMissingMovieApiConfigMessage()} />
        ) : !debouncedQuery.trim() ? (
          <View style={styles.history}>
            <View style={styles.historyHeader}>
              <AppText weight="semibold">Recent searches</AppText>
              {history.length ? (
                <Pressable onPress={clearHistory}>
                  <AppText style={[styles.clearText, { color: theme.colors.accent }]} weight="medium">
                    Clear
                  </AppText>
                </Pressable>
              ) : null}
            </View>
            {history.length ? (
              history.map((item) => (
                <Pressable key={item} onPress={() => setQuery(item)}>
                  <AppText tone="muted" style={styles.historyItem}>
                    {item}
                  </AppText>
                </Pressable>
              ))
            ) : (
              <AppText tone="muted">Your search history will appear here.</AppText>
            )}
          </View>
        ) : isLoading ? (
          <View style={styles.loading}>
            <Skeleton height={220} />
            <Skeleton height={220} />
          </View>
        ) : (
          <MovieGrid
            movies={movies}
            onEndReached={hasNextPage ? () => fetchNextPage() : undefined}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 12,
  },
  title: {
    fontSize: 28,
  },
  history: {
    gap: 10,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyItem: {
    fontSize: 15,
  },
  clearText: {
    fontSize: 11,
    lineHeight: 14,
  },
  loading: {
    gap: 14,
  },
});
