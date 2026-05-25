import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LaneStripe } from "~/components/LaneStripe";
import { PrimaryButton } from "~/components/PrimaryButton";
import { StepCard } from "~/components/StepCard";
import {
  listingFlowSteps,
  requiredPhotoCount,
  sellerListingFeeUsd,
  summarizeListingFlow,
} from "~/features/listing/listingFlow";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

const draftSummary = summarizeListingFlow({
  completedStepIds: [],
  photoCount: 0,
});

export default function NewListingScreen() {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.kicker}>Seller flow</Text>
          <Text style={styles.title}>Build a listing buyers can trust.</Text>
          <Text style={styles.copy}>
            VeloxLane starts with {requiredPhotoCount} photos, then adds VIN,
            ID, and escrow checkpoints before the ${sellerListingFeeUsd} publish
            step.
          </Text>
        </View>

        <LaneStripe
          completedSegments={draftSummary.completedCount}
          currentSegment={0}
          segments={draftSummary.totalCount}
        />

        <View style={styles.steps}>
          {listingFlowSteps.map((step, index) => (
            <StepCard
              key={step.id}
              eyebrow={`Step ${index + 1}`}
              title={step.title}
              detail={step.detail}
            />
          ))}
        </View>

        <PrimaryButton
          accessibilityLabel="Continue to guided photo capture"
          label="Continue to photos"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: mobileTheme.spacing[7],
    padding: mobileTheme.spacing[5],
    paddingBottom: mobileTheme.spacing[10],
  },
  copy: {
    ...textStyle("body"),
    color: mobileTheme.colors.text.onDarkMuted,
  },
  intro: {
    gap: mobileTheme.spacing[4],
    paddingTop: mobileTheme.spacing[5],
  },
  kicker: {
    ...textStyle("overline"),
    color: mobileTheme.colors.text.onDarkMuted,
  },
  safeArea: {
    backgroundColor: mobileTheme.colors.surface.canvas,
    flex: 1,
  },
  steps: {
    gap: mobileTheme.spacing[4],
  },
  title: {
    ...textStyle("h2"),
    color: mobileTheme.colors.text.onDark,
  },
});
