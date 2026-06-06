import "../global.css";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { promptBiometricUnlock } from "~/features/auth/biometric";
import { bootstrapPermissions } from "~/lib/permissions";
import { supabase } from "~/lib/supabase";
import {
  modalStackScreenOptions,
  stackScreenOptions,
} from "~/navigation/screenOptions";
import { mobileTheme } from "~/theme/mobileTheme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    void bootstrapPermissions();
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await promptBiometricUnlock();
      }
    })();
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(onboarding)"
          options={{ ...modalStackScreenOptions, headerShown: false }}
        />
        <Stack.Screen
          name="(escrow)"
          options={{ ...modalStackScreenOptions, headerShown: false }}
        />
        <Stack.Screen
          name="(affiliates)"
          options={{ ...modalStackScreenOptions, headerShown: false }}
        />
        <Stack.Screen
          name="(sell)"
          options={{ ...modalStackScreenOptions, headerShown: false }}
        />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="deal/[id]" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    backgroundColor: mobileTheme.colors.surface.canvas,
    flex: 1,
  },
});
