import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import { AppText } from "@/components/ui/AppText";
import { MovieSummary } from "@/types/movie";
import { useTheme } from "@/theme/ThemeProvider";

type MovieCardProps = {
  movie: MovieSummary;
  onPress: () => void;
};

export const MovieCard = memo(function MovieCard({ movie, onPress }: MovieCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.cardInset,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.posterFrame,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <Image
          source={movie.posterUrl ? { uri: movie.posterUrl } : undefined}
          style={[styles.poster, { backgroundColor: theme.colors.surfaceElevated }]}
          contentFit="cover"
          transition={150}
        />
      </View>
      <View style={styles.body}>
        <AppText numberOfLines={2} style={styles.title} weight="bold">
          {movie.title}
        </AppText>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 128,
    borderRadius: 22,
    borderWidth: 1,
    padding: 12,
  },
  posterFrame: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    height: 180,
    justifyContent: "center",
  },
  poster: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  body: {
    paddingTop: 10,
    minHeight: 50,
  },
  title: {
    fontSize: 10,
    lineHeight: 14,
  },
});
