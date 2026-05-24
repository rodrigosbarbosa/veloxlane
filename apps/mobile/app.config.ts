import type { ExpoConfig } from "expo/config";
import { colors } from "@veloxlane/design-tokens";

const config: ExpoConfig = {
  name: "VeloxLane",
  slug: "veloxlane",
  scheme: "veloxlane",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  splash: {
    backgroundColor: colors.surface.canvas,
    resizeMode: "contain",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.veloxlane.mobile",
  },
  android: {
    package: "com.veloxlane.mobile",
    adaptiveIcon: {
      backgroundColor: colors.surface.canvas,
    },
  },
  web: {
    bundler: "metro",
    output: "single",
  },
  plugins: ["expo-router", "expo-font", "expo-asset"],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
