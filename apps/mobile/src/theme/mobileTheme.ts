import type { TextStyle, ViewStyle } from "react-native";
import {
  colors,
  fontSize,
  fontWeight,
  laneStripe,
  radius,
  spacing,
  typography,
} from "@veloxlane/design-tokens";
import type { TypeStyle } from "@veloxlane/design-tokens";

const mobileFontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

type MobileTextRole = keyof typeof typography;

const toFontFamily = (weight: number): string => {
  if (weight >= fontWeight.bold) {
    return mobileFontFamily.bold;
  }

  if (weight >= fontWeight.semibold) {
    return mobileFontFamily.semibold;
  }

  if (weight >= fontWeight.medium) {
    return mobileFontFamily.medium;
  }

  return mobileFontFamily.regular;
};

const toFontWeight = (weight: number): TextStyle["fontWeight"] => {
  if (weight >= fontWeight.bold) {
    return "700";
  }

  if (weight >= fontWeight.semibold) {
    return "600";
  }

  if (weight >= fontWeight.medium) {
    return "500";
  }

  return "400";
};

const toLetterSpacing = (style: TypeStyle): number => {
  const emValue = Number.parseFloat(style.letterSpacing.replace("em", ""));

  if (Number.isNaN(emValue)) {
    return 0;
  }

  return emValue * style.fontSize;
};

export const textStyle = (role: MobileTextRole): TextStyle => {
  const style = typography[role];

  return {
    fontFamily: toFontFamily(style.fontWeight),
    fontSize: style.fontSize,
    fontStyle: style.fontStyle,
    fontWeight: toFontWeight(style.fontWeight),
    lineHeight: Math.round(style.fontSize * style.lineHeight),
    letterSpacing: toLetterSpacing(style),
    textTransform: style.textTransform,
  };
};

export const mobileTheme = {
  colors,
  spacing,
  radius,
  fontSize,
  laneStripe,
  fonts: mobileFontFamily,
  shadow: {
    card: {
      shadowColor: colors.surface.inverse,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 2,
    } satisfies ViewStyle,
  },
} as const;

export type MobileTheme = typeof mobileTheme;
