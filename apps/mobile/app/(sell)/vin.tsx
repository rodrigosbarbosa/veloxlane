import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import type { VinLookupPreview } from "@veloxlane/vin";

import { VinEntryScreen } from "~/features/vin/VinEntryScreen";
import { createDraftListing } from "~/lib/photos-api";
import { supabase } from "~/lib/supabase";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

export default function SellVinScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  return (
    <VinEntryScreen
      confirming={confirming}
      confirmError={error}
      onConfirm={async (preview: VinLookupPreview) => {
        setConfirming(true);
        setError(null);

        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            throw new Error("Sign in required.");
          }

          const draft = await createDraftListing(session.access_token, {
            vin: preview.vin,
            make: preview.make ?? "Unknown",
            model: preview.model ?? "Unknown",
            year: preview.year ?? new Date().getFullYear(),
          });

          router.push(`/(sell)/photos?listingId=${draft.listingId}`);
        } catch (confirmFailure) {
          setError(
            confirmFailure instanceof Error
              ? confirmFailure.message
              : "Unable to start your draft listing.",
          );
        } finally {
          setConfirming(false);
        }
      }}
    />
  );
}
