import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import { AppText } from "@/components/ui/AppText";
import { PersonSummary } from "@/types/person";
import { useTheme } from "@/theme/ThemeProvider";

type CastCardProps = {
  person: PersonSummary;
  onPress: () => void;
  forceDark?: boolean;
};

export function CastCard({ person, onPress, forceDark = false }: CastCardProps) {
  const { theme } = useTheme();
  const backgroundColor = forceDark ? "#111722" : theme.colors.surface;
  const borderColor = forceDark ? "rgba(255,255,255,0.08)" : theme.colors.border;
  const imageFallback = forceDark ? "#141B31" : theme.colors.surfaceElevated;
  const titleColor = forceDark ? "#F5F0E8" : theme.colors.text;
  const subtitleColor = forceDark ? "#A7A5B4" : theme.colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={person.profileUrl ? { uri: person.profileUrl } : undefined}
          style={[styles.avatar, { backgroundColor: imageFallback }]}
          contentFit="cover"
          transition={120}
        />
        <View style={styles.roleTag}>
          <AppText numberOfLines={1} style={styles.roleTagText} weight="medium">
            {person.roleTag || person.knownForRole}
          </AppText>
        </View>
      </View>
      <View style={styles.body}>
        <AppText numberOfLines={1} weight="semibold" style={{ color: titleColor }}>
          {person.name}
        </AppText>
        <AppText numberOfLines={1} style={[styles.subtitle, { color: subtitleColor }]}>
          {person.knownForRole}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 136,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    aspectRatio: 0.9,
  },
  imageWrap: {
    position: "relative",
  },
  body: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 2,
  },
  subtitle: {
    fontSize: 10,
    lineHeight: 14,
  },
  roleTag: {
    position: "absolute",
    right: 8,
    bottom: 8,
    maxWidth: "72%",
    borderRadius: 11,
    backgroundColor: "rgba(10, 13, 22, 0.84)",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  roleTagText: {
    fontSize: 9,
    lineHeight: 11,
    color: "#F5F0E8",
  },
});
