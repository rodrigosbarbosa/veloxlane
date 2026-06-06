import { Stack } from "expo-router";

import { stackScreenOptions } from "~/navigation/screenOptions";

export default function SellLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
