import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { useMoviePrefetch } from "@/hooks/useMoviePrefetch";
import { useTheme } from "@/theme/ThemeProvider";
import { MovieSummary } from "@/types/movie";

type MovieGridProps = {
  movies: MovieSummary[];
  onEndReached?: () => void;
};

function SearchGridCard({
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

export function MovieGrid({ movies, onEndReached }: MovieGridProps) {
  const router = useRouter();
  const prefetchMovie = useMoviePrefetch();

  return (
    <FlatList
      data={movies}
      keyExtractor={(item) => String(item.id)}
      numColumns={3}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <SearchGridCard
          movie={item}
          onPress={() => {
            prefetchMovie(item.id);
            router.push(`/movie/${item.id}`);
          }}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridItem: {
    width: "31.5%",
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
