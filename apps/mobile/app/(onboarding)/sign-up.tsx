import { zodResolver } from "@hookform/resolvers/zod";
import {
  advanceOnboardingStep,
  getLoginRedirectForSignupError,
  mapSupabaseAuthError,
} from "@veloxlane/auth";
import { copy } from "@veloxlane/brand/copy";
import { signupSchema, type SignupInput } from "@veloxlane/schemas";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";

import { AuthScreen } from "~/components/AuthScreen";
import { PrimaryButton } from "~/components/PrimaryButton";
import { supabase } from "~/lib/supabase";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

export default function SignUpScreen() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const {
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "buyer" },
  });

  const role = watch("role");

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (error) {
      const code = mapSupabaseAuthError(error.message);
      if (getLoginRedirectForSignupError(code)) {
        router.push("/login");
        return;
      }
      setMessage(copy.auth.errorEmailExists);
      return;
    }

    if (!data.user) {
      setMessage(copy.auth.errorGeneric);
      return;
    }

    const nextStep = advanceOnboardingStep(
      "signup",
      values.role,
      "signup_complete",
    );
    await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        role: values.role,
        onboarding_step: nextStep,
      })
      .eq("id", data.user.id);

    router.push("/(onboarding)/phone-verify");
  });

  return (
    <AuthScreen
      subtitle={copy.auth.signupSubtitle}
      title={copy.auth.signupTitle}
    >
      <View style={{ gap: mobileTheme.spacing[4] }}>
        <TextInput
          accessibilityLabel={copy.auth.fullNameLabel}
          placeholder={copy.auth.fullNameLabel}
          placeholderTextColor={mobileTheme.colors.text.onDarkMuted}
          style={inputStyle}
          onChangeText={(text) => setValue("fullName", text)}
        />
        <TextInput
          accessibilityLabel={copy.auth.emailLabel}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={copy.auth.emailLabel}
          placeholderTextColor={mobileTheme.colors.text.onDarkMuted}
          style={inputStyle}
          onChangeText={(text) => setValue("email", text)}
        />
        <TextInput
          accessibilityLabel={copy.auth.passwordLabel}
          placeholder={copy.auth.passwordLabel}
          placeholderTextColor={mobileTheme.colors.text.onDarkMuted}
          secureTextEntry
          style={inputStyle}
          onChangeText={(text) => setValue("password", text)}
        />
        <TextInput
          accessibilityLabel={copy.auth.confirmPasswordLabel}
          placeholder={copy.auth.confirmPasswordLabel}
          placeholderTextColor={mobileTheme.colors.text.onDarkMuted}
          secureTextEntry
          style={inputStyle}
          onChangeText={(text) => setValue("confirmPassword", text)}
        />
        <View style={{ flexDirection: "row", gap: mobileTheme.spacing[4] }}>
          {(["buyer", "seller"] as const).map((value) => (
            <Pressable key={value} onPress={() => setValue("role", value)}>
              <Text
                style={{
                  color:
                    role === value
                      ? mobileTheme.colors.action.primaryBg
                      : mobileTheme.colors.text.onDarkMuted,
                }}
              >
                {value === "buyer" ? copy.auth.roleBuyer : copy.auth.roleSeller}
              </Text>
            </Pressable>
          ))}
        </View>
        {message ? (
          <Text style={{ color: mobileTheme.colors.action.primaryBg }}>
            {message}
          </Text>
        ) : null}
        {errors.fullName?.message ? (
          <Text style={errorStyle}>{errors.fullName.message}</Text>
        ) : null}
        <PrimaryButton
          disabled={isSubmitting}
          label={isSubmitting ? copy.auth.loading : copy.auth.submitSignup}
          onPress={() => void onSubmit()}
        />
        <Link href="/login">
          <Text
            style={[
              textStyle("body"),
              { color: mobileTheme.colors.action.primaryBg },
            ]}
          >
            {copy.auth.backToLogin}
          </Text>
        </Link>
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

const errorStyle = {
  color: mobileTheme.colors.action.primaryBg,
};
