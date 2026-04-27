import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, StyleSheet, TextInputProps, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/theme/ThemeProvider";

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
} & Pick<TextInputProps, "onFocus" | "onSubmitEditing">;

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search for movies, actors, or titles",
  onFocus,
  onSubmitEditing,
}: SearchBarProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Pressable
        style={[
          styles.filterChip,
          {
            backgroundColor: theme.colors.chip,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <AppText style={[styles.filterText, { color: theme.colors.accent }]} weight="bold">
          Search
        </AppText>
      </Pressable>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { color: theme.colors.text }]}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        onFocus={onFocus}
        onSubmitEditing={onSubmitEditing}
      />
      {value.trim().length ? (
        <Pressable onPress={() => onChangeText("")} style={styles.clearButton}>
          <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterChip: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontSize: 9,
    lineHeight: 11,
  },
  input: {
    flex: 1,
    fontSize: 11,
    height: 20,
    paddingVertical: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
