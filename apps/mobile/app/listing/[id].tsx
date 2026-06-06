import { Redirect, useLocalSearchParams } from "expo-router";

export default function ListingDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <Redirect href="/(tabs)/browse" />;
  }

  return <Redirect href={`/(tabs)/browse/listing/${id}`} />;
}
