import type { ComponentProps } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

type PrimaryButtonProps = PressableProps & {
  label: string;
  style?: StyleProp<ViewStyle>;
  icon?: ComponentProps<typeof ChevronRight>;
};

export function PrimaryButton({
  label,
  style,
  icon,
  ...pressableProps
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        style,
      ]}
      {...pressableProps}
    >
      <Text style={styles.label}>{label}</Text>
      <ChevronRight
        color={mobileTheme.colors.action.primaryFg}
        size={mobileTheme.spacing[6]}
        strokeWidth={1.75}
        {...icon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: mobileTheme.colors.action.primaryBg,
    borderRadius: mobileTheme.radius.sm,
    flexDirection: "row",
    gap: mobileTheme.spacing[3],
    justifyContent: "center",
    minHeight: mobileTheme.spacing[10],
    paddingHorizontal: mobileTheme.spacing[7],
    paddingVertical: mobileTheme.spacing[5],
  },
  buttonPressed: {
    backgroundColor: mobileTheme.colors.action.primaryPressed,
  },
  label: {
    ...textStyle("label"),
    color: mobileTheme.colors.action.primaryFg,
  },
});
