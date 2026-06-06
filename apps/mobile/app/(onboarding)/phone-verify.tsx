import {
  advanceOnboardingStep,
  getPostAuthRedirect,
} from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { AuthScreen } from "~/components/AuthScreen";
import { PrimaryButton } from "~/components/PrimaryButton";
import { supabase } from "~/lib/supabase";
import { mobileTheme } from "~/theme/mobileTheme";

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

export default function PhoneVerifyScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`${apiUrl}/api/auth/phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", phone }),
    });
    const payload = (await response.json()) as { message?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.message ?? copy.auth.errorGeneric);
      return;
    }

    setStep("otp");
  };

  const verifyCode = async () => {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`${apiUrl}/api/auth/phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", phone, token }),
    });
    const payload = (await response.json()) as {
      message?: string;
      next?: string;
    };
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.message ?? copy.auth.errorGeneric);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "role, phone_verified, id_verified, onboarding_step, identity_manual_review",
        )
        .eq("id", user.id)
        .maybeSingle();

      const role = profile?.role === "seller" ? "seller" : "buyer";
      const nextStep = advanceOnboardingStep("phone", role, "phone_verified");
      await supabase
        .from("profiles")
        .update({ phone, phone_verified: true, onboarding_step: nextStep })
        .eq("id", user.id);

      const path = getPostAuthRedirect(
        {
          onboardingStep: nextStep,
          role,
          phoneVerified: true,
          idVerified: profile?.id_verified ?? false,
          identityManualReview: profile?.identity_manual_review ?? false,
        },
        "mobile",
      );

      router.replace(path);
      return;
    }

    router.replace("/(onboarding)/welcome");
  };

  return (
    <AuthScreen
      subtitle={copy.auth.verifyPhoneSubtitle}
      title={copy.auth.verifyPhoneTitle}
    >
      <View style={{ gap: mobileTheme.spacing[4] }}>
        {step === "phone" ? (
          <TextInput
            accessibilityLabel={copy.auth.phoneLabel}
            keyboardType="phone-pad"
            placeholder={copy.auth.phoneLabel}
            placeholderTextColor={mobileTheme.colors.text.onDarkMuted}
            style={inputStyle}
            value={phone}
            onChangeText={setPhone}
          />
        ) : (
          <TextInput
            accessibilityLabel={copy.auth.otpLabel}
            keyboardType="number-pad"
            maxLength={6}
            placeholder={copy.auth.otpLabel}
            placeholderTextColor={mobileTheme.colors.text.onDarkMuted}
            style={inputStyle}
            value={token}
            onChangeText={setToken}
          />
        )}
        {message ? (
          <Text style={{ color: mobileTheme.colors.action.primaryBg }}>
            {message}
          </Text>
        ) : null}
        <PrimaryButton
          disabled={loading}
          label={
            loading
              ? copy.auth.loading
              : step === "phone"
                ? copy.auth.submitPhone
                : copy.auth.submitOtp
          }
          onPress={() => void (step === "phone" ? sendCode() : verifyCode())}
        />
      </View>
    </AuthScreen>
  );
}

const inputStyle = {
  borderColor: mobileTheme.colors.border.onDark,
  borderWidth: 1,
  borderRadius: mobileTheme.radius.md,
  color: mobileTheme.colors.text.onDark,
  height: 44,
  paddingHorizontal: mobileTheme.spacing[4],
};
