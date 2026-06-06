import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LaneStripe } from "~/components/LaneStripe";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: mobileTheme.colors.surface.canvas }}
    >
      <View
        style={{
          flex: 1,
          padding: mobileTheme.spacing[5],
          gap: mobileTheme.spacing[6],
        }}
      >
        <Text
          style={[
            textStyle("overline"),
            { color: mobileTheme.colors.action.primaryBg },
          ]}
        >
          VeloxLane
        </Text>
        <LaneStripe segments={5} completedSegments={2} currentSegment={2} />
        <View style={{ gap: mobileTheme.spacing[3] }}>
          <Text
            style={[textStyle("h2"), { color: mobileTheme.colors.text.onDark }]}
          >
            {title}
          </Text>
          <Text
            style={[
              textStyle("body"),
              { color: mobileTheme.colors.text.onDarkMuted },
            ]}
          >
            {subtitle}
          </Text>
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
}
