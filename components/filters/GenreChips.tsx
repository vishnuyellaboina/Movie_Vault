import { Pressable, ScrollView, StyleSheet } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Genre } from "@/types/movie";
import { useTheme } from "@/theme/ThemeProvider";

type GenreChipsProps = {
  genres: Genre[];
  selectedGenreId?: number;
  onSelect: (genreId?: number) => void;
};

export function GenreChips({ genres, selectedGenreId, onSelect }: GenreChipsProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Pressable
        onPress={() => onSelect(undefined)}
        style={[
          styles.chip,
          {
            backgroundColor: selectedGenreId ? theme.colors.surface : theme.colors.accent,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <AppText
          weight="semibold"
          tone={selectedGenreId ? "default" : "default"}
          style={{ color: selectedGenreId ? theme.colors.text : theme.colors.background }}
        >
          All
        </AppText>
      </Pressable>
      {genres.map((genre) => {
        const active = genre.id === selectedGenreId;
        return (
          <Pressable
            key={genre.id}
            onPress={() => onSelect(active ? undefined : genre.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <AppText style={{ color: active ? theme.colors.background : theme.colors.text }}>
              {genre.name}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
});
