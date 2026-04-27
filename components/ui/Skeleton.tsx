import { DimensionValue, View, ViewStyle } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

type SkeletonProps = {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = "100%", height, radius = 12, style }: SkeletonProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.skeleton,
        },
        style,
      ]}
    />
  );
}
