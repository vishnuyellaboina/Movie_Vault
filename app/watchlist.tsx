import { StyleSheet, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { AppText } from "@/components/ui/AppText";

export default function WatchlistScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <AppText style={styles.title} weight="bold">
          Watchlist
        </AppText>
        <AppText tone="muted" style={styles.copy}>
          This screen is intentionally lean for now. The architecture is ready for local-first
          persistence and a future synced backend.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
  },
  copy: {
    fontSize: 15,
    lineHeight: 22,
  },
});
