import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { darkPalette, lightPalette } from "@/theme/palette";

type Theme = {
  colors: typeof lightPalette;
};

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const [override, setOverride] = useState<"light" | "dark" | null>(null);
  const isDark = (override ?? scheme) === "dark";

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme: () =>
        setOverride((current) => ((current ?? scheme) === "dark" ? "light" : "dark")),
      theme: {
        colors: isDark ? darkPalette : lightPalette,
      },
    }),
    [isDark, scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return value;
}
