import type { ExpoConfig } from "expo/config";

/** Velox Midnight — keep in sync with @veloxlane/brand `colors.surface.canvas`. */
const SPLASH_BACKGROUND = "#0A1628";

const config: ExpoConfig = {
  name: "VeloxLane",
  slug: "veloxlane",
  scheme: "veloxlane",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  splash: {
    backgroundColor: SPLASH_BACKGROUND,
    resizeMode: "contain",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.veloxlane.mobile",
  },
  android: {
    package: "com.veloxlane.mobile",
    adaptiveIcon: {
      backgroundColor: SPLASH_BACKGROUND,
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
