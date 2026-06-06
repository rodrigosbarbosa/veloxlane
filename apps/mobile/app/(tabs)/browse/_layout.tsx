import { Stack } from "expo-router";

import { stackScreenOptions } from "~/navigation/screenOptions";

export default function BrowseLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
