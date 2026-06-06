import { useLocalSearchParams, useRouter } from "expo-router";

import { PhotoUploadScreen } from "~/features/photos/PhotoUploadScreen";

export default function SellPhotosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ listingId?: string }>();
  const listingId = params.listingId;

  if (!listingId) {
    return null;
  }

  return (
    <PhotoUploadScreen
      listingId={listingId}
      onContinue={() => {
        router.push(`/(tabs)/sell/price?listingId=${listingId}`);
      }}
    />
  );
}
