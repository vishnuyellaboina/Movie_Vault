import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/theme/ThemeProvider";

type ConfigNoticeProps = {
  title?: string;
  message: string;
};

export function ConfigNotice({
  title = "API keys required",
  message,
}: ConfigNoticeProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppText weight="bold" style={styles.title}>
        {title}
      </AppText>
      <AppText tone="muted" style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
  },
});
