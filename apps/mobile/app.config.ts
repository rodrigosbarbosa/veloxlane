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
    infoPlist: {
      NSFaceIDUsageDescription:
        "VeloxLane uses Face ID to protect your account and deal actions.",
    },
  },
  android: {
    package: "com.veloxlane.mobile",
    adaptiveIcon: {
      backgroundColor: SPLASH_BACKGROUND,
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          { scheme: "veloxlane", host: "listing" },
          { scheme: "veloxlane", host: "deal" },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "single",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-asset",
    "expo-secure-store",
    "expo-notifications",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "veloxlane-mobile",
    },
  },
};

export default config;
