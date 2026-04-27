import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { AppText } from "@/components/ui/AppText";
import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActorDetail } from "@/hooks/useActorDetail";
import { getMissingMovieApiConfigMessage, hasActorDetailSource } from "@/lib/env";
import { useTheme } from "@/theme/ThemeProvider";
import { PersonFilmographyItem } from "@/types/person";

function FilmographyCard({
  movie,
  onPress,
  textColor,
  mutedTextColor,
  borderColor,
  surfaceColor,
}: {
  movie: PersonFilmographyItem;
  onPress: () => void;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  surfaceColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filmCard,
        {
          backgroundColor: surfaceColor,
          borderColor,
        },
      ]}
    >
      <Image source={movie.posterUrl ? { uri: movie.posterUrl } : undefined} style={styles.filmPoster} contentFit="cover" />
      <View style={styles.filmCopy}>
        <AppText style={[styles.filmTitle, { color: textColor }]} weight="semibold" numberOfLines={1}>
          {movie.title}
        </AppText>
        <AppText style={[styles.filmMeta, { color: mutedTextColor }]} numberOfLines={1}>
          {[movie.releaseYear, movie.character].filter(Boolean).join(" · ")}
        </AppText>
      </View>
    </Pressable>
  );
}

export default function ActorDetailScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const actorId = Number(params.id);
  const { data, isLoading } = useActorDetail(actorId);
  const biography = data?.biography?.trim() || "";
  const filmography = data?.filmography ?? [];
  const totalFilmographyCount = data?.totalFilmographyCount ?? filmography.length;

  if (!hasActorDetailSource()) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ConfigNotice message={getMissingMovieApiConfigMessage()} />
        </View>
      </Screen>
    );
  }

  if (isLoading || !data) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Skeleton height={160} width={160} radius={80} />
          <Skeleton height={24} width="50%" />
          <Skeleton height={100} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
          </Pressable>
        </View>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Image
            source={data.profileUrl ? { uri: data.profileUrl } : undefined}
            style={[styles.avatar, { backgroundColor: theme.colors.surface }]}
            contentFit="cover"
          />

          <View style={styles.nameBlock}>
            <AppText style={[styles.name, { color: theme.colors.text }]} weight="bold">
              {data.name}
            </AppText>
            <View
              style={[
                styles.departmentChip,
                {
                  backgroundColor: theme.colors.cardInset,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppText style={[styles.departmentText, { color: theme.colors.accent }]} weight="semibold">
                {data.department}
              </AppText>
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <AppText tone="muted" style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                  Known for
                </AppText>
                <AppText style={[styles.metaValue, { color: theme.colors.text }]} numberOfLines={1}>
                  {data.department}
                </AppText>
              </View>

              {data.debutMovie ? (
                <View style={styles.metaItem}>
                  <AppText tone="muted" style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                    Debut
                  </AppText>
                  <AppText style={[styles.metaValue, { color: theme.colors.text }]} numberOfLines={2}>
                    {data.debutMovie.title}
                  </AppText>
                </View>
              ) : null}

              {data.topBoxOfficeMovie ? (
                <View style={styles.metaItem}>
                  <AppText tone="muted" style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                    Top gross loaded
                  </AppText>
                  <AppText style={[styles.metaValue, { color: theme.colors.text }]} numberOfLines={2}>
                    {data.topBoxOfficeMovie.title}
                  </AppText>
                </View>
              ) : null}

              <View style={styles.metaItem}>
                <AppText tone="muted" style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
                  Filmography
                </AppText>
                <AppText style={[styles.metaValue, { color: theme.colors.text }]} numberOfLines={1}>
                  {totalFilmographyCount} movies
                </AppText>
              </View>

            </View>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text }]} weight="bold">
            Personal
          </AppText>
          <View
            style={[
              styles.infoPanel,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {data.birthday ? (
              <View style={styles.infoRow}>
                <AppText style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Birth date</AppText>
                <AppText style={[styles.infoValue, { color: theme.colors.text }]}>{data.birthday}</AppText>
              </View>
            ) : null}
            {data.placeOfBirth ? (
              <View style={styles.infoRow}>
                <AppText style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Birth place</AppText>
                <AppText style={[styles.infoValue, { color: theme.colors.text }]}>{data.placeOfBirth}</AppText>
              </View>
            ) : null}
            {data.genderLabel ? (
              <View style={styles.infoRow}>
                <AppText style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Gender</AppText>
                <AppText style={[styles.infoValue, { color: theme.colors.text }]}>{data.genderLabel}</AppText>
              </View>
            ) : null}
            <View style={styles.infoRow}>
              <AppText style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Known for</AppText>
              <AppText style={[styles.infoValue, { color: theme.colors.text }]}>{data.department}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text }]} weight="bold">
            Biography
          </AppText>
          <View
            style={[
              styles.bioCard,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <AppText style={[styles.bio, { color: theme.colors.text }]}>
              {biography || `${data.name}${data.placeOfBirth ? ` was born in ${data.placeOfBirth}.` : ""}`}
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text }]} weight="bold">
            Filmography
          </AppText>

          <View style={styles.filmSummaryGrid}>
            {data.debutMovie ? (
              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <AppText style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Debut movie</AppText>
                <AppText style={[styles.summaryTitle, { color: theme.colors.text }]} weight="semibold" numberOfLines={2}>
                  {data.debutMovie.title}
                </AppText>
                <AppText style={[styles.summaryMeta, { color: theme.colors.textMuted }]}>
                  {data.debutMovie.releaseYear || "Unknown year"}
                </AppText>
              </View>
            ) : null}

            {data.topBoxOfficeMovie ? (
              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <AppText style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>
                  Highest box office loaded
                </AppText>
                <AppText style={[styles.summaryTitle, { color: theme.colors.text }]} weight="semibold" numberOfLines={2}>
                  {data.topBoxOfficeMovie.title}
                </AppText>
                <AppText style={[styles.summaryMeta, { color: theme.colors.textMuted }]} numberOfLines={1}>
                  {data.topBoxOfficeMovie.revenueLabel || "Revenue unavailable"}
                </AppText>
              </View>
            ) : null}
          </View>

          <View style={styles.filmographyList}>
            {filmography.map((movie) => (
              <FilmographyCard
                key={movie.id}
                movie={movie}
                onPress={() => router.push(`/movie/${movie.id}`)}
                textColor={theme.colors.text}
                mutedTextColor={theme.colors.textMuted}
                borderColor={theme.colors.border}
                surfaceColor={theme.colors.surfaceElevated}
              />
            ))}
          </View>

          {totalFilmographyCount > filmography.length ? (
            <AppText style={[styles.moreNote, { color: theme.colors.textMuted }]}>
              Showing {filmography.length} of {totalFilmographyCount} released movies.
            </AppText>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  loading: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    gap: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: -4,
  },
  avatar: {
    width: 108,
    aspectRatio: 122 / 164,
    borderRadius: 18,
  },
  nameBlock: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  name: {
    fontSize: 24,
    lineHeight: 28,
  },
  departmentChip: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  departmentText: {
    fontSize: 11,
    lineHeight: 14,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaItem: {
    width: "47%",
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  metaValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
  },
  infoPanel: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  infoRow: {
    gap: 3,
  },
  infoLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  infoValue: {
    fontSize: 14,
    lineHeight: 18,
  },
  bioCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  bio: {
    fontSize: 14,
    lineHeight: 22,
  },
  filmSummaryGrid: {
    gap: 10,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  summaryTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  summaryMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  filmographyList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  filmCard: {
    width: "31.5%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 6,
  },
  filmPoster: {
    width: "100%",
    aspectRatio: 0.68,
    borderRadius: 10,
    backgroundColor: "#1B2440",
    marginBottom: 5,
  },
  filmCopy: {
    gap: 1,
  },
  filmTitle: {
    fontSize: 10,
    lineHeight: 13,
  },
  filmMeta: {
    fontSize: 9,
    lineHeight: 12,
  },
  moreNote: {
    fontSize: 12,
    lineHeight: 16,
  },
});
