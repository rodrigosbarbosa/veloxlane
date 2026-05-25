import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: mobileTheme.colors.surface.canvas,
          },
          headerStyle: {
            backgroundColor: mobileTheme.colors.surface.canvas,
          },
          headerShadowVisible: false,
          headerTintColor: mobileTheme.colors.text.onDark,
          headerTitleStyle: {
            ...textStyle("label"),
            color: mobileTheme.colors.text.onDark,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="listing/new"
          options={{ title: "Start a listing" }}
        />
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
