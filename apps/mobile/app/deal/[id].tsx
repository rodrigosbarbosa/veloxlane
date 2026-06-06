import { Redirect, useLocalSearchParams } from "expo-router";

export default function DealDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <Redirect href="/(tabs)/deals" />;
  }

  return <Redirect href={`/(tabs)/deals/escrow/${id}`} />;
}
