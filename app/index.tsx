import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { Screen } from "@/components/ui/Screen";
import { useHomeFeed } from "@/hooks/useHomeFeed";
import { getMissingMovieApiConfigMessage, hasHomeFeedSource } from "@/lib/env";
import { useTheme } from "@/theme/ThemeProvider";
import { MovieSummary } from "@/types/movie";

type RailCardProps = {
  movie: MovieSummary;
  onPress: () => void;
};

function RailCard({ movie, onPress }: RailCardProps) {
  const { theme, isDark } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.cardWrap}>
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
        <View style={styles.cardFooter}>
          <View
            style={[
              styles.ratingPill,
              { backgroundColor: isDark ? "rgba(0,0,0,0.56)" : "rgba(255,255,255,0.92)" },
            ]}
          >
            <Ionicons name="star" size={10} color="#F1C431" />
            <AppText
              style={[styles.ratingText, { color: isDark ? "#FAF8FC" : "#111521" }]}
              weight="medium"
            >
              {movie.ratingLabel.replace("/10", "")}
            </AppText>
          </View>
          {movie.primaryGenre ? (
            <View
              style={[
                styles.genrePill,
                {
                  backgroundColor: isDark ? "rgba(14,16,27,0.88)" : "rgba(255,255,255,0.94)",
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppText style={[styles.genreText, { color: isDark ? "#FAF8FC" : "#111521" }]}>
                {movie.primaryGenre}
              </AppText>
            </View>
          ) : null}
        </View>
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

type RailSectionProps = {
  title: string;
  subtitle?: string;
  movies: MovieSummary[];
  onCardPress: (movieId: number) => void;
  onViewAllPress?: () => void;
};

function RailSection({ title, subtitle, movies, onCardPress, onViewAllPress }: RailSectionProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text }]} weight="bold">
            {title}
          </AppText>
          {subtitle ? (
            <AppText
              style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}
              tone="muted"
            >
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {onViewAllPress ? (
          <Pressable style={styles.viewAll} onPress={onViewAllPress}>
            <AppText style={[styles.viewAllText, { color: theme.colors.accent }]}>
              View all
            </AppText>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
      >
        {movies.map((movie) => (
          <RailCard key={movie.id} movie={movie} onPress={() => onCardPress(movie.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { data, isLoading } = useHomeFeed();
  const searchFloat = useRef(new Animated.Value(0)).current;
  const sparklePulse = useRef(new Animated.Value(0.6)).current;

  const trending = useMemo(() => data?.trending.slice(0, 4) ?? [], [data]);
  const hollywood = useMemo(() => data?.hollywood?.slice(0, 4) ?? [], [data]);
  const bollywood = useMemo(() => data?.bollywood?.slice(0, 4) ?? [], [data]);
  const teluguTrending = useMemo(() => data?.tollywood?.slice(0, 4) ?? [], [data]);
  const kollywood = useMemo(() => data?.kollywood?.slice(0, 4) ?? [], [data]);
  const mollywood = useMemo(() => data?.mollywood?.slice(0, 4) ?? [], [data]);

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(searchFloat, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(searchFloat, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparklePulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sparklePulse, {
          toValue: 0.45,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    floatLoop.start();
    pulseLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [searchFloat, sparklePulse]);

  const searchTranslateY = searchFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });
  const searchRotate = searchFloat.interpolate({
    inputRange: [0, 1],
    outputRange: ["-6deg", "2deg"],
  });
  const sparkleTranslateY = sparklePulse.interpolate({
    inputRange: [0.45, 1],
    outputRange: [4, -2],
  });

  return (
    <Screen>
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topBar}>
            <AppText style={styles.brand} tone="accent" weight="bold">
              MOVIEVAULT
            </AppText>
            <View style={styles.topRightCluster}>
              <Pressable style={styles.bulbWrap} onPress={toggleTheme}>
                <View
                  style={[
                    styles.bulbWire,
                    { backgroundColor: isDark ? "rgba(255,255,255,0.22)" : "rgba(17,21,33,0.26)" },
                  ]}
                />
                <View
                  style={[
                    styles.bulbGlass,
                    {
                      backgroundColor: "transparent",
                      borderColor: "transparent",
                      shadowColor: "#F1C431",
                      shadowOpacity: isDark ? 0 : 0.95,
                      shadowRadius: isDark ? 0 : 12,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: isDark ? 0 : 10,
                    },
                  ]}
                >
                    <Ionicons
                      name={isDark ? "bulb-outline" : "bulb"}
                      size={20}
                      color={isDark ? "rgba(245,240,232,0.72)" : "#F1C431"}
                      style={styles.bulbIcon}
                    />
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.hero}>
            <AppText style={[styles.heroTitle, { color: theme.colors.text }]} weight="bold">
              Cinema intelligence{"\n"}
              <AppText style={[styles.heroAccent, { color: theme.colors.accent }]}>Instantly.</AppText>
            </AppText>
            <View style={styles.heroInfoRow}>
              <AppText style={[styles.heroSubtitle, { color: theme.colors.textMuted }]} tone="muted">
                Explore Telugu, Hindi, English, Tamil, Malayalam{"\n"}and global films with
                ratings, cast, story,{"\n"}and watch options in one place.
              </AppText>
              <View style={styles.cinemaAnimWrap}>
                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      opacity: sparklePulse,
                      transform: [{ translateY: sparkleTranslateY }],
                    },
                  ]}
                >
                  <Ionicons
                    name="sparkles"
                    size={12}
                    color={isDark ? "rgba(241,196,49,0.92)" : theme.colors.accent}
                  />
                </Animated.View>
                <Animated.View
                  style={[
                    styles.searchIconWrap,
                    {
                      transform: [{ translateY: searchTranslateY }, { rotate: searchRotate }],
                    },
                  ]}
                >
                  <Ionicons
                    name="search"
                    size={28}
                    color={isDark ? "rgba(245,240,232,0.9)" : "rgba(17,21,33,0.82)"}
                    style={styles.searchGlassIcon}
                  />
                  <Ionicons
                    name="film-outline"
                    size={18}
                    color={isDark ? "rgba(245,240,232,0.68)" : "rgba(17,21,33,0.54)"}
                    style={styles.reelIcon}
                  />
                </Animated.View>
              </View>
            </View>
          </View>

          <Pressable
            style={[
              styles.searchBar,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceElevated,
              },
            ]}
            onPress={() => router.push("/search")}
          >
            <View
              style={[
                styles.filterButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.chip,
                },
              ]}
            >
              <AppText style={[styles.filterButtonText, { color: theme.colors.accent }]} weight="bold">
                Search
              </AppText>
            </View>
            <TextInput
              value=""
              editable={false}
              pointerEvents="none"
              placeholder="Search..."
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.searchInput, { color: theme.colors.textMuted }]}
            />
          </Pressable>

          {!hasHomeFeedSource() ? <ConfigNotice message={getMissingMovieApiConfigMessage()} /> : null}

          {hasHomeFeedSource() && isLoading ? (
            <View style={styles.loadingBlock}>
              <View
                style={[
                  styles.loadingCard,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceElevated,
                  },
                ]}
              />
              <View
                style={[
                  styles.loadingCard,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceElevated,
                  },
                ]}
              />
            </View>
          ) : hasHomeFeedSource() && data ? (
            <>
              <RailSection
                title="Trending Now"
                subtitle="Live from TMDb"
                movies={trending}
                onCardPress={(movieId) => router.push(`/movie/${movieId}`)}
              />
              <RailSection
                title="Hollywood"
                movies={hollywood}
                onCardPress={(movieId) => router.push(`/movie/${movieId}`)}
                onViewAllPress={() => router.push("/category/hollywood")}
              />
              <RailSection
                title="Bollywood"
                movies={bollywood}
                onCardPress={(movieId) => router.push(`/movie/${movieId}`)}
                onViewAllPress={() => router.push("/category/bollywood")}
              />
              <RailSection
                title="Tollywood"
                movies={teluguTrending}
                onCardPress={(movieId) => router.push(`/movie/${movieId}`)}
                onViewAllPress={() => router.push("/category/tollywood")}
              />
              <RailSection
                title="Kollywood"
                movies={kollywood}
                onCardPress={(movieId) => router.push(`/movie/${movieId}`)}
                onViewAllPress={() => router.push("/category/kollywood")}
              />
              <RailSection
                title="Mollywood"
                movies={mollywood}
                onCardPress={(movieId) => router.push(`/movie/${movieId}`)}
                onViewAllPress={() => router.push("/category/mollywood")}
              />
            </>
          ) : null}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  topRightCluster: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 0,
  },
  heroInfoRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 2,
  },
  cinemaAnimWrap: {
    width: 48,
    height: 44,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: 56,
    marginTop: -72,
  },
  searchIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  searchGlassIcon: {
    transform: [{ scaleX: -1 }],
  },
  reelIcon: {
    position: "absolute",
    right: -10,
    bottom: -1,
  },
  sparkle: {
    position: "absolute",
    top: 3,
    right: 1,
  },
  brand: {
    fontSize: 15,
    letterSpacing: 2.6,
    lineHeight: 19,
  },
  bulbWrap: {
    width: 34,
    alignItems: "center",
    paddingTop: 0,
    marginRight: 16,
  },
  bulbWire: {
    width: 2,
    height: 20,
    borderRadius: 999,
    marginLeft: -1,
  },
  bulbGlass: {
    width: 24,
    height: 24,
    marginTop: -4,
    marginLeft: -1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bulbIcon: {
    transform: [{ rotate: "180deg" }],
  },
  hero: {
    marginTop: -8,
    marginBottom: 0,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 26,
    marginBottom: 2,
  },
  heroAccent: {
    fontWeight: "700",
  },
  heroSubtitle: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
  },
  searchBar: {
    height: 48,
    marginTop: 8,
    marginBottom: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterButton: {
    height: 30,
    minWidth: 54,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  filterButtonText: {
    fontSize: 9,
    lineHeight: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.72,
    paddingVertical: 0,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  sectionSubtitle: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  viewAllText: {
    fontSize: 11,
    lineHeight: 14,
  },
  railContent: {
    gap: 8,
    paddingRight: 0,
  },
  cardWrap: {
    width: 154,
  },
  posterCard: {
    width: 154,
    height: 206,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 6,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  cardFooter: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 9,
  },
  genrePill: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  genreText: {
    fontSize: 8,
  },
  cardTitle: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 10,
    lineHeight: 13,
  },
  loadingBlock: {
    gap: 12,
    paddingRight: 0,
  },
  loadingCard: {
    height: 206,
    borderWidth: 1,
    borderRadius: 16,
  },
});
