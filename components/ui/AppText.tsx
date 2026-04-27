import { Text, TextProps, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

type AppTextProps = TextProps & {
  tone?: "default" | "muted" | "accent";
  weight?: "regular" | "medium" | "semibold" | "bold";
};

const weightStyles = StyleSheet.create({
  regular: { fontWeight: "400" },
  medium: { fontWeight: "500" },
  semibold: { fontWeight: "600" },
  bold: { fontWeight: "700" },
});

export function AppText({
  style,
  tone = "default",
  weight = "regular",
  ...props
}: AppTextProps) {
  const { theme } = useTheme();

  return (
    <Text
      {...props}
      style={[
        {
          color:
            tone === "muted"
              ? theme.colors.textMuted
              : tone === "accent"
                ? theme.colors.accent
                : theme.colors.text,
        },
        weightStyles[weight],
        style,
      ]}
    />
  );
}
