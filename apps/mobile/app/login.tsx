import { zodResolver } from "@hookform/resolvers/zod";
import {
  getPostAuthRedirect,
  mapSupabaseAuthError,
  type ProfileOnboardingState,
} from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";
import { loginSchema, type LoginInput } from "@veloxlane/schemas";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

import { AuthScreen } from "~/components/AuthScreen";
import { PrimaryButton } from "~/components/PrimaryButton";
import {
  canEnableBiometric,
  promptBiometricUnlock,
  setBiometricEnabled,
} from "~/features/auth/biometric";
import { supabase } from "~/lib/supabase";
import { authFieldStyles, mobileTheme } from "~/theme/mobileTheme";

export default function LoginScreen() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      const code = mapSupabaseAuthError(error.message);
      setMessage(
        code === "invalid_credentials"
          ? copy.auth.errorInvalidCredentials
          : copy.auth.errorGeneric,
      );
      return;
    }

    const unlocked = await promptBiometricUnlock();
    if (!unlocked) {
      setMessage(copy.auth.errorGeneric);
      return;
    }

    if (await canEnableBiometric()) {
      await setBiometricEnabled(true);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/(tabs)/browse");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "role, phone_verified, id_verified, onboarding_step, identity_manual_review",
      )
      .eq("id", user.id)
      .maybeSingle();

    const path = profile
      ? getPostAuthRedirect(
          {
            onboardingStep:
              profile.onboarding_step as ProfileOnboardingState["onboardingStep"],
            role: profile.role as ProfileOnboardingState["role"],
            phoneVerified: profile.phone_verified,
            idVerified: profile.id_verified,
            identityManualReview: profile.identity_manual_review,
          },
          "mobile",
        )
      : "/(tabs)/browse";

    router.replace(path);
  });

  return (
    <AuthScreen subtitle={copy.auth.loginSubtitle} title={copy.auth.loginTitle}>
      <View style={{ gap: mobileTheme.spacing[4] }}>
        <TextInput
          accessibilityLabel={copy.auth.emailLabel}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={copy.auth.emailLabel}
          placeholderTextColor={authFieldStyles.placeholderColor}
          style={authFieldStyles.input}
          onChangeText={(text) => setValue("email", text)}
        />
        <TextInput
          accessibilityLabel={copy.auth.passwordLabel}
          placeholder={copy.auth.passwordLabel}
          placeholderTextColor={authFieldStyles.placeholderColor}
          secureTextEntry
          style={authFieldStyles.input}
          onChangeText={(text) => setValue("password", text)}
        />
        {message ? (
          <Text style={authFieldStyles.messageError}>{message}</Text>
        ) : null}
        <PrimaryButton
          disabled={isSubmitting}
          label={isSubmitting ? copy.auth.loading : copy.auth.submitLogin}
          onPress={() => void onSubmit()}
        />
      </View>
    </AuthScreen>
  );
}
