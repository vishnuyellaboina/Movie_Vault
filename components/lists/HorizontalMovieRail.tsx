import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { MovieCard } from "@/components/cards/MovieCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppText } from "@/components/ui/AppText";
import { MovieSummary } from "@/types/movie";
import { useMoviePrefetch } from "@/hooks/useMoviePrefetch";
import { useTheme } from "@/theme/ThemeProvider";

type HorizontalMovieRailProps = {
  title: string;
  subtitle?: string;
  movies: MovieSummary[];
};

export function HorizontalMovieRail({
  title,
  subtitle,
  movies,
}: HorizontalMovieRailProps) {
  const router = useRouter();
  const prefetchMovie = useMoviePrefetch();
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.panel,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <SectionHeader title={title} subtitle={subtitle} />
        <AppText style={styles.arrow} tone="accent" weight="bold">
          →
        </AppText>
      </View>
      <FlashList
        horizontal
        data={movies}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MovieCard
            movie={item}
            onPress={() => {
              prefetchMovie(item.id);
              router.push(`/movie/${item.id}`);
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  arrow: {
    fontSize: 24,
    lineHeight: 26,
    marginTop: 2,
  },
  listContent: {
    paddingRight: 8,
    gap: 12,
  },
});
