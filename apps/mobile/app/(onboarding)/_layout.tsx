import { Stack } from "expo-router";

import { modalStackScreenOptions } from "~/navigation/screenOptions";

export default function OnboardingLayout() {
  return <Stack screenOptions={modalStackScreenOptions} />;
}
