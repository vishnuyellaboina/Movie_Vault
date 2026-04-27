import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { CastCard } from "@/components/cards/CastCard";
import { AppText } from "@/components/ui/AppText";
import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { Screen } from "@/components/ui/Screen";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMovieDetail } from "@/hooks/useMovieDetail";
import { getMissingMovieApiConfigMessage, hasMovieDetailSource } from "@/lib/env";
import { useTheme } from "@/theme/ThemeProvider";

function buildHeroTitleParts(title: string) {
  const colonIndex = title.indexOf(":");
  if (colonIndex === -1) {
    return { primary: title, accent: "" };
  }

  return {
    primary: title.slice(0, colonIndex + 1).trim(),
    accent: title.slice(colonIndex + 1).trim(),
  };
}

function formatLegacyBoxOffice(value?: string) {
  if (!value) {
    return "Unavailable";
  }

  if (/cr/i.test(value)) {
    return value.replace(/^₹/u, "Rs ");
  }

  const amount = Number(value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) {
    return value;
  }

  const crores = amount / 10000000;
  return `Rs ${crores.toFixed(crores >= 100 ? 0 : 2)} Cr`;
}

const USD_TO_INR_RATE = 93.2;

function parseUsdBoxOffice(value?: string) {
  if (!value || value === "N/A" || !value.includes("$")) {
    return undefined;
  }

  const amount = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

function formatApproxInrCrores(value?: string) {
  const usdAmount = parseUsdBoxOffice(value);
  if (!usdAmount) {
    return undefined;
  }

  const crores = (usdAmount * USD_TO_INR_RATE) / 10000000;
  return `Approx. Rs ${crores.toFixed(crores >= 100 ? 0 : 2)} Cr`;
}

function ProviderEmptyState() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.providersEmpty,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.providersEmptyIcon,
          { backgroundColor: theme.colors.surfaceElevated },
        ]}
      >
        <Ionicons name="tv-outline" size={20} color={theme.colors.textMuted} />
      </View>
      <View style={styles.providersEmptyCopy}>
        <AppText style={styles.providersEmptyTitle} weight="semibold">
          No providers available
        </AppText>
        <AppText tone="muted" style={styles.providersEmptyText}>
          No providers available for the selected region.
        </AppText>
      </View>
    </View>
  );
}

export default function MovieDetailScreen() {
  const { theme, isDark } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const movieId = Number(params.id);
  const { data, isLoading } = useMovieDetail(movieId);

  if (!hasMovieDetailSource()) {
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
          <Skeleton height={420} />
          <Skeleton height={120} radius={20} />
          <Skeleton height={180} radius={18} />
        </View>
      </Screen>
    );
  }

  const genreLabel = data.primaryGenre ? ` · ${data.primaryGenre}` : "";
  const screenBackground = theme.colors.background;
  const panelBackground = theme.colors.surfaceElevated;
  const panelBorder = theme.colors.border;
  const bodyText = theme.colors.text;
  const mutedText = theme.colors.textMuted;
  const heroMetaColor = isDark ? "rgba(245, 240, 232, 0.82)" : "#374151";
  const heroTitleColor = isDark ? "#FAF8FC" : "#101726";
  const heroPillBackground = isDark ? "rgba(10, 13, 22, 0.72)" : "rgba(255,255,255,0.92)";
  const heroPillBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(16,23,38,0.08)";
  const heroPillText = isDark ? "#FAF8FC" : "#101726";
  const { primary, accent } = buildHeroTitleParts(data.title);
  const approxBoxOffice = formatApproxInrCrores(data.boxOffice);
  const productionCompanies = data.productionCompanies ?? [];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: screenBackground }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image
            source={data.backdropUrl ? { uri: data.backdropUrl } : undefined}
            style={[styles.heroImage, { backgroundColor: panelBackground }]}
            contentFit="cover"
          />
          <LinearGradient
            colors={
              isDark
                ? ["rgba(7,10,20,0)", "rgba(7,10,20,0.14)", "rgba(7,10,20,0.72)", "#070A14"]
                : ["rgba(255,255,255,0)", "rgba(255,255,255,0.18)", "rgba(255,255,255,0.58)", "#FFFFFF"]
            }
            locations={[0, 0.5, 0.82, 1]}
            style={styles.heroGradient}
          />
          <View style={styles.heroTop}>
            <Pressable
              onPress={() => router.back()}
              style={[
                styles.backButton,
                {
                  backgroundColor: heroPillBackground,
                  borderColor: heroPillBorder,
                },
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={heroPillText} />
            </Pressable>
          </View>

          <View style={styles.heroBottom}>
            <View style={styles.heroTitleWrap}>
              <AppText style={[styles.heroTitle, { color: heroTitleColor }]} weight="bold">
                {primary}
              </AppText>
              {accent ? (
                <AppText style={[styles.heroAccentTitle, { color: theme.colors.accent }]} weight="bold">
                  {accent}
                </AppText>
              ) : null}
            </View>

            <View style={styles.heroMetaRow}>
              <AppText style={[styles.heroMeta, { color: heroMetaColor }]}>
                {data.releaseYear || "TBA"} · {data.runtimeLabel}
                {genreLabel}
              </AppText>
              <View
                style={[
                  styles.heroRatingPill,
                  {
                    backgroundColor: heroPillBackground,
                    borderColor: heroPillBorder,
                  },
                ]}
              >
                <Ionicons name="star" size={14} color="#F1C431" />
                <AppText style={[styles.heroRatingText, { color: heroPillText }]} weight="semibold">
                  {data.ratingLabel}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <AppText style={[styles.overview, { color: mutedText }]}>
            {data.overview}
          </AppText>

          {productionCompanies.length ? (
            <View style={styles.productionSection}>
              <AppText style={[styles.sectionTitle, { color: bodyText }]} weight="bold">
                Production
              </AppText>
              <View style={styles.productionWrap}>
                {productionCompanies.map((company) => (
                  <View
                    key={company}
                    style={[
                      styles.productionChip,
                      {
                        backgroundColor: panelBackground,
                        borderColor: panelBorder,
                      },
                    ]}
                  >
                    <Ionicons name="business-outline" size={14} color={theme.colors.accent} />
                    <AppText numberOfLines={1} style={[styles.productionName, { color: bodyText }]}>
                      {company}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View
            style={[
              styles.statsPanel,
              {
                backgroundColor: panelBackground,
                borderColor: panelBorder,
              },
            ]}
          >
            <View style={styles.statBlock}>
              <View style={styles.statLabelRow}>
                <Ionicons name="ticket-outline" size={22} color="#F1C431" />
                <AppText tone="muted" style={[styles.statLabel, { color: mutedText }]}>
                  BOX OFFICE
                </AppText>
              </View>
              <AppText style={[styles.statValue, { color: bodyText }]} weight="bold">
                {data.boxOffice || "Unavailable"}
              </AppText>
              {approxBoxOffice ? (
                <AppText style={[styles.statSubvalue, { color: mutedText }]}>
                  {approxBoxOffice}
                </AppText>
              ) : null}
            </View>

            <View
              style={[
                styles.statsDivider,
                { backgroundColor: panelBorder },
              ]}
            />

            <View style={styles.statBlock}>
              <View style={styles.statLabelRow}>
                <Ionicons name="star" size={22} color="#F1C431" />
                <AppText tone="muted" style={[styles.statLabel, { color: mutedText }]}>
                  IMDB RATING
                </AppText>
              </View>
              <AppText style={[styles.statValue, { color: bodyText }]} weight="bold">
                {data.imdbRating ? `${data.imdbRating}/10` : "N/A"}
              </AppText>
            </View>
          </View>

          <View style={styles.providersSection}>
            <View style={styles.sectionHeader}>
              <View>
                <AppText style={[styles.sectionTitle, { color: bodyText }]} weight="bold">
                  Streaming providers
                </AppText>
                <AppText tone="muted" style={[styles.sectionSubtitle, { color: mutedText }]}>
                  Region-specific availability from TMDb watch providers.
                </AppText>
              </View>
            </View>

            {data.providers.length ? (
              <View style={styles.providersWrap}>
                {data.providers.map((provider) => (
                  <View
                    key={provider.id}
                    style={[
                      styles.providerChip,
                      {
                        backgroundColor: panelBackground,
                        borderColor: panelBorder,
                      },
                    ]}
                  >
                    {provider.logoUrl ? (
                      <Image
                        source={{ uri: provider.logoUrl }}
                        style={styles.providerLogo}
                        contentFit="contain"
                      />
                    ) : (
                      <View
                        style={[
                          styles.providerLogoFallback,
                          { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(16,23,38,0.08)" },
                        ]}
                      >
                        <Ionicons name="play-circle-outline" size={16} color={bodyText} />
                      </View>
                    )}
                    <AppText numberOfLines={1} style={[styles.providerName, { color: bodyText }]}>
                      {provider.name}
                    </AppText>
                  </View>
                ))}
              </View>
            ) : (
              <ProviderEmptyState />
            )}
          </View>

          <View style={styles.sectionHeader}>
            <AppText style={[styles.sectionTitle, { color: bodyText }]} weight="bold">
              Top cast
            </AppText>
            <Pressable style={styles.sectionAction}>
              <AppText style={[styles.sectionActionText, { color: theme.colors.accent }]}>
                View all
              </AppText>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.castRail}
          >
            {data.cast.map((person) => (
              <CastCard
                key={person.id}
                person={person}
                onPress={() => router.push(`/actor/${person.id}`)}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },
  loading: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  hero: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTop: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBottom: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 12,
    zIndex: 2,
    gap: 2,
  },
  heroTitleWrap: {
    gap: 0,
    marginBottom: 0,
  },
  heroTitle: {
    fontSize: 31,
    lineHeight: 33,
  },
  heroAccentTitle: {
    fontSize: 31,
    lineHeight: 33,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heroMeta: {
    flex: 1,
    fontSize: 13,
    lineHeight: 16,
  },
  heroRatingPill: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroRatingText: {
    fontSize: 12,
    lineHeight: 15,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12,
  },
  overview: {
    fontSize: 13,
    lineHeight: 21,
  },
  productionSection: {
    gap: 10,
  },
  productionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  productionChip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "100%",
  },
  productionName: {
    fontSize: 12,
    lineHeight: 15,
    maxWidth: 240,
  },
  statsPanel: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "stretch",
  },
  statBlock: {
    flex: 1,
    gap: 8,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 16,
    lineHeight: 20,
    color: "#FAF8FC",
  },
  statSubvalue: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: -2,
  },
  statsDivider: {
    width: 1,
    marginHorizontal: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 23,
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  sectionActionText: {
    fontSize: 14,
    lineHeight: 16,
  },
  castRail: {
    gap: 12,
    paddingRight: 6,
  },
  providersSection: {
    gap: 12,
  },
  sectionSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  providersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  providerChip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: "48%",
    minWidth: "46%",
  },
  providerLogo: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  providerLogoFallback: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  providerName: {
    flex: 1,
    fontSize: 12,
    lineHeight: 15,
  },
  providersEmpty: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  providersEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  providersEmptyCopy: {
    flex: 1,
    gap: 4,
  },
  providersEmptyTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  providersEmptyText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
