import { StyleSheet, View } from "react-native";
import { mobileTheme } from "~/theme/mobileTheme";

type LaneStripeProps = {
  segments?: number;
  completedSegments?: number;
  currentSegment?: number;
};

export function LaneStripe({
  segments = 5,
  completedSegments = 0,
  currentSegment = completedSegments,
}: LaneStripeProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: segments,
        now: Math.min(completedSegments, segments),
      }}
      style={styles.track}
    >
      {Array.from({ length: segments }).map((_, index) => {
        const isComplete = index < completedSegments;
        const isCurrent = index === currentSegment;

        return (
          <View
            key={`lane-${index}`}
            style={[
              styles.segment,
              isComplete && styles.segmentComplete,
              isCurrent && styles.segmentCurrent,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    gap: mobileTheme.laneStripe.gapLength,
  },
  segment: {
    backgroundColor: mobileTheme.colors.border.default,
    borderRadius: mobileTheme.radius.pill,
    flex: 1,
    height: mobileTheme.laneStripe.thickness,
  },
  segmentComplete: {
    backgroundColor: mobileTheme.laneStripe.color,
  },
  segmentCurrent: {
    backgroundColor: mobileTheme.laneStripe.color,
    maxWidth: mobileTheme.laneStripe.dashLength,
  },
});
