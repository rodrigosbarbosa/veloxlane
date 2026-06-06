import { Stack } from "expo-router";

import { stackScreenOptions } from "~/navigation/screenOptions";

export default function ProfileLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
