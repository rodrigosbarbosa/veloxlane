import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LaneStripe } from "~/components/LaneStripe";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

type PlaceholderScreenProps = {
  title: string;
};

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <SafeAreaView
      className="flex-1 bg-midnight"
      style={{ backgroundColor: mobileTheme.colors.surface.canvas }}
    >
      <View className="flex-1 items-center justify-center gap-5 px-6">
        <Text
          className="text-amber uppercase tracking-widest"
          style={textStyle("overline")}
        >
          VeloxLane
        </Text>
        <LaneStripe segments={5} completedSegments={2} currentSegment={2} />
        <Text
          className="text-cream text-center"
          style={[textStyle("h2"), { color: mobileTheme.colors.text.onDark }]}
        >
          {title}
        </Text>
        <Text
          className="text-center"
          style={[
            textStyle("body"),
            { color: mobileTheme.colors.text.onDarkMuted },
          ]}
        >
          Screen shell — implementation follows in later prompts.
        </Text>
      </View>
    </SafeAreaView>
  );
}
