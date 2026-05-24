import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LaneStripe } from "~/components/LaneStripe";
import { PrimaryButton } from "~/components/PrimaryButton";
import { StepCard } from "~/components/StepCard";
import { VerifiedPill } from "~/components/VerifiedPill";
import {
  requiredPhotoCount,
  sellerListingFeeUsd,
  summarizeListingFlow,
} from "~/features/listing/listingFlow";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

const sampleSummary = summarizeListingFlow({
  completedStepIds: ["photos", "vin"],
  photoCount: requiredPhotoCount,
});

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.brand}>VeloxLane</Text>
          <Text style={styles.headline}>Your lane. Your deal.</Text>
          <Text style={styles.copy}>
            List once, verify trust, and sell private party without dealer
            noise.
          </Text>

          <View style={styles.pills}>
            <VerifiedPill label="ID verified" />
            <VerifiedPill label="Escrow protected" />
            <VerifiedPill label="VIN matched" />
          </View>

          <LaneStripe
            completedSegments={sampleSummary.completedCount}
            currentSegment={sampleSummary.completedCount}
            segments={sampleSummary.totalCount}
          />

          <Link href="/listing/new" asChild>
            <PrimaryButton label="Start seller listing" />
          </Link>
        </View>

        <View style={styles.section}>
          <StepCard
            eyebrow="Listing"
            title={`${requiredPhotoCount} guided photos`}
            detail="A camera checklist walks sellers through the angles buyers need before they message."
          />
          <StepCard
            eyebrow="Trust"
            title="VIN and ID checks"
            detail="The flow pairs a matched vehicle with a verified private-party seller."
          />
          <StepCard
            eyebrow="Deal"
            title="Escrow-protected handoff"
            detail={`Publish for $${sellerListingFeeUsd}. Buyers see a dealer-free marketplace built around signed releases.`}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: {
    ...textStyle("overline"),
    color: mobileTheme.colors.text.onDarkMuted,
  },
  content: {
    gap: mobileTheme.spacing[8],
    padding: mobileTheme.spacing[5],
    paddingBottom: mobileTheme.spacing[10],
  },
  copy: {
    ...textStyle("bodyLg"),
    color: mobileTheme.colors.text.onDarkMuted,
  },
  headline: {
    ...textStyle("h1"),
    color: mobileTheme.colors.text.onDark,
  },
  hero: {
    gap: mobileTheme.spacing[6],
    paddingTop: mobileTheme.spacing[8],
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: mobileTheme.spacing[3],
  },
  safeArea: {
    backgroundColor: mobileTheme.colors.surface.canvas,
    flex: 1,
  },
  section: {
    gap: mobileTheme.spacing[4],
  },
});
