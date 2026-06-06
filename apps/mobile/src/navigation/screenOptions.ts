import type { ComponentProps } from "react";
import type { Stack } from "expo-router";

import { mobileTheme, textStyle } from "~/theme/mobileTheme";

type StackScreenOptions = NonNullable<
  ComponentProps<typeof Stack>["screenOptions"]
>;

export const stackScreenOptions: StackScreenOptions = {
  contentStyle: {
    backgroundColor: mobileTheme.colors.surface.canvas,
  },
  headerStyle: {
    backgroundColor: mobileTheme.colors.surface.canvas,
  },
  headerShadowVisible: false,
  headerTintColor: mobileTheme.colors.text.onDark,
  headerTitleStyle: {
    ...textStyle("label"),
    color: mobileTheme.colors.text.onDark,
  },
};

export const modalStackScreenOptions: StackScreenOptions = {
  ...stackScreenOptions,
  presentation: "modal",
};
