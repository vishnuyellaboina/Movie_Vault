import { View, StyleSheet } from "react-native";

import { AppText } from "@/components/ui/AppText";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title} weight="bold">
        {title}
      </AppText>
      {subtitle ? (
        <AppText style={styles.subtitle} tone="muted">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
  },
});
