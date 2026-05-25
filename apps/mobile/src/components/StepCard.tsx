import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

type StepCardProps = {
  eyebrow: string;
  title: string;
  detail: string;
  accessory?: ReactNode;
};

export function StepCard({ eyebrow, title, detail, accessory }: StepCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        {accessory}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...mobileTheme.shadow.card,
    backgroundColor: mobileTheme.colors.surface.card,
    borderColor: mobileTheme.colors.border.subtle,
    borderRadius: mobileTheme.radius.md,
    borderWidth: 1,
    gap: mobileTheme.spacing[3],
    padding: mobileTheme.spacing[5],
  },
  detail: {
    ...textStyle("bodySm"),
    color: mobileTheme.colors.text.secondary,
  },
  eyebrow: {
    ...textStyle("caption"),
    color: mobileTheme.colors.text.muted,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    ...textStyle("h5"),
    color: mobileTheme.colors.text.primary,
  },
});
