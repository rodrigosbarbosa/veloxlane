import { Stack } from "expo-router";

import { modalStackScreenOptions } from "~/navigation/screenOptions";

export default function AffiliatesLayout() {
  return <Stack screenOptions={modalStackScreenOptions} />;
}
