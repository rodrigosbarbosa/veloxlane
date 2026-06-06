import { copy } from "@veloxlane/brand/copy";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { AuthScreen } from "~/components/AuthScreen";
import { PrimaryButton } from "~/components/PrimaryButton";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <AuthScreen
      subtitle={copy.auth.welcomeSubtitle}
      title={copy.auth.welcomeTitle}
    >
      <View>
        <PrimaryButton
          label="Enter the lane"
          onPress={() => router.replace("/(tabs)/browse")}
        />
      </View>
    </AuthScreen>
  );
}
