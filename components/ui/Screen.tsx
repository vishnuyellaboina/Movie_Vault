import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, ViewProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

type ScreenProps = PropsWithChildren<ViewProps>;

export function Screen({ children, style, ...props }: ScreenProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View
        {...props}
        style={[styles.content, { backgroundColor: theme.colors.background }, style]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
