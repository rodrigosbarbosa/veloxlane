import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

type VerifiedPillProps = {
  label: string;
  icon?: ComponentProps<typeof Check>;
};

export function VerifiedPill({ label, icon }: VerifiedPillProps) {
  return (
    <View style={styles.pill}>
      <Check
        color={mobileTheme.colors.status.verified}
        size={mobileTheme.spacing[5]}
        strokeWidth={1.75}
        {...icon}
      />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: mobileTheme.colors.status.verifiedBg,
    borderRadius: mobileTheme.radius.pill,
    flexDirection: "row",
    gap: mobileTheme.spacing[2],
    paddingHorizontal: mobileTheme.spacing[4],
    paddingVertical: mobileTheme.spacing[2],
  },
  label: {
    ...textStyle("caption"),
    color: mobileTheme.colors.status.verified,
  },
});
