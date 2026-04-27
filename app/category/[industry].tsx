import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { Screen } from "@/components/ui/Screen";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCategoryMovies, useCategorySearchMovies } from "@/hooks/useCategoryMovies";
import { useMoviePrefetch } from "@/hooks/useMoviePrefetch";
import { getMissingMovieApiConfigMessage, hasCategorySource } from "@/lib/env";
import { INDUSTRY_CONFIG } from "@/lib/industries";
import { useTheme } from "@/theme/ThemeProvider";
import { IndustryKey, MovieSummary } from "@/types/movie";

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function WoodGridCard({
  movie,
  onPress,
}: {
  movie: MovieSummary;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.gridItem}>
      <View
        style={[
          styles.posterCard,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.cardInset,
          },
        ]}
      >
        <Image
          source={movie.posterUrl ? { uri: movie.posterUrl } : undefined}
          style={styles.poster}
          contentFit="cover"
          transition={120}
        />
      </View>
      <AppText style={[styles.cardTitle, { color: theme.colors.text }]} weight="medium" numberOfLines={1}>
        {movie.title}
      </AppText>
      <AppText
        style={[styles.cardMeta, { color: theme.colors.textMuted }]}
        tone="muted"
        numberOfLines={1}
      >
        {movie.runtimeLabel
          ? `${movie.releaseYear || "TBA"} · ${movie.runtimeLabel}`
          : movie.releaseYear || movie.primaryGenre || ""}
      </AppText>
    </Pressable>
  );
}

export default function CategoryScreen() {
  const router = useRouter();
  const prefetchMovie = useMoviePrefetch();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ industry: IndustryKey }>();
  const industry = params.industry || "hollywood";
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const { data, isLoading } = useCategoryMovies(industry);
  const { data: searchedMovies, isLoading: isSearchLoading } = useCategorySearchMovies(
    industry,
    query,
  );

  const label = INDUSTRY_CONFIG[industry]?.label || industry;
  const movies = useMemo(() => data?.results?.slice(0, 20) ?? [], [data]);
  const filteredMovies = useMemo(() => {
    if (!normalizedQuery) {
      return movies;
    }

    const compactQuery = normalizeSearchText(normalizedQuery);
    const searchableMovies = searchedMovies ?? [];
    return searchableMovies.filter((movie) =>
      normalizeSearchText(movie.title).includes(compactQuery) ||
      normalizeSearchText(movie.originalTitle).includes(compactQuery),
    );
  }, [movies, normalizedQuery, searchedMovies]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            style={[
              styles.backButton,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <AppText style={[styles.title, { color: theme.colors.text }]} weight="bold">
              {label}
            </AppText>
            <AppText tone="muted" style={styles.subtitle}>
              {normalizedQuery
                ? `Searching the full ${label.toLowerCase()} catalog`
                : "Showing up to 20 movies for faster loading"}
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.searchBar,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceElevated,
            },
          ]}
        >
          <Ionicons name="search-outline" size={16} color={theme.colors.accent} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${label} movies`}
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.text }]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.trim().length ? (
            <Pressable onPress={() => setQuery("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {!hasCategorySource() ? (
          <ConfigNotice message={getMissingMovieApiConfigMessage()} />
        ) : isLoading || (normalizedQuery ? isSearchLoading : false) ? (
          <View style={styles.loading}>
            <Skeleton height={150} radius={14} />
            <Skeleton height={150} radius={14} />
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredMovies.map((movie) => (
              <WoodGridCard
                key={movie.id}
                movie={movie}
                onPress={() => {
                  prefetchMovie(movie.id);
                  router.push(`/movie/${movie.id}`);
                }}
              />
            ))}
            {normalizedQuery && filteredMovies.length === 0 ? (
              <View style={styles.emptyState}>
                <AppText style={[styles.emptyTitle, { color: theme.colors.text }]} weight="medium">
                  No matches found
                </AppText>
                <AppText style={styles.emptyCopy} tone="muted">
                  Try another title in {label}.
                </AppText>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 24,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  searchBar: {
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    paddingVertical: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loading: {
    gap: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  gridItem: {
    width: "31.5%",
  },
  emptyState: {
    width: "100%",
    paddingTop: 24,
    paddingBottom: 12,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  emptyCopy: {
    fontSize: 10,
    lineHeight: 14,
  },
  posterCard: {
    width: "100%",
    aspectRatio: 0.68,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 5,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  cardTitle: {
    fontSize: 10,
    lineHeight: 13,
    marginBottom: 1,
  },
  cardMeta: {
    fontSize: 9,
    lineHeight: 12,
  },
});
