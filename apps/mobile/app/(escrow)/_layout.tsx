import { Stack } from "expo-router";

import { modalStackScreenOptions } from "~/navigation/screenOptions";

export default function EscrowModalLayout() {
  return <Stack screenOptions={modalStackScreenOptions} />;
}
