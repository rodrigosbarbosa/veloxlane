import { Stack } from "expo-router";

import { stackScreenOptions } from "~/navigation/screenOptions";

export default function InboxLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
