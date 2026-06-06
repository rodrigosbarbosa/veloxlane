import { canRetryIdentity } from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Text, View } from "react-native";

import { AuthScreen } from "~/components/AuthScreen";
import { PrimaryButton } from "~/components/PrimaryButton";
import { supabase } from "~/lib/supabase";
import { mobileTheme } from "~/theme/mobileTheme";

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

export default function IdVerifyScreen() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    attempts: 0,
    manualReview: false,
    idVerified: false,
  });

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("identity_attempts, identity_manual_review, id_verified")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          attempts: data.identity_attempts,
          manualReview: data.identity_manual_review,
          idVerified: data.id_verified,
        });
      }
    })();
  }, []);

  const startVerification = async () => {
    if (!canRetryIdentity(profile)) {
      setMessage(copy.auth.errorIdentityManualReview);
      return;
    }

    setLoading(true);
    const response = await fetch(`${apiUrl}/api/auth/identity/session`, {
      method: "POST",
    });
    const payload = (await response.json()) as {
      url?: string;
      message?: string;
    };
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.message ?? copy.auth.errorGeneric);
      return;
    }

    const verifyUrl = `${apiUrl}/verify-id`;
    await Linking.openURL(verifyUrl);
    router.push("/(onboarding)/welcome");
  };

  return (
    <AuthScreen
      subtitle={copy.auth.verifyIdSubtitle}
      title={copy.auth.verifyIdTitle}
    >
      <View style={{ gap: mobileTheme.spacing[4] }}>
        {message ? (
          <Text style={{ color: mobileTheme.colors.action.primaryBg }}>
            {message}
          </Text>
        ) : null}
        {profile.manualReview ? (
          <Text style={{ color: mobileTheme.colors.text.onDarkMuted }}>
            {copy.auth.identityManualReviewNote}
          </Text>
        ) : (
          <PrimaryButton
            disabled={loading}
            label={loading ? copy.auth.loading : copy.auth.submitIdentity}
            onPress={() => void startVerification()}
          />
        )}
      </View>
    </AuthScreen>
  );
}
