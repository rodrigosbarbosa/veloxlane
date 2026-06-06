import { Stack } from "expo-router";

import { stackScreenOptions } from "~/navigation/screenOptions";

export default function DealsLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
