export type ListingFlowStepId =
  | "photos"
  | "vin"
  | "identity"
  | "escrow"
  | "publish";

export type ListingFlowStep = {
  id: ListingFlowStepId;
  title: string;
  detail: string;
};

export const requiredPhotoCount = 10;
export const sellerListingFeeUsd = 12;

export const listingFlowSteps: readonly ListingFlowStep[] = [
  {
    id: "photos",
    title: "Guided 10-photo listing",
    detail: "Capture the angles buyers expect before the car goes live.",
  },
  {
    id: "vin",
    title: "VIN match",
    detail: "Add the VIN once so buyers see the right vehicle history.",
  },
  {
    id: "identity",
    title: "ID verification",
    detail: "Show buyers a real private-party seller is behind the listing.",
  },
  {
    id: "escrow",
    title: "Escrow-protected deal",
    detail: "Funds release after both sides sign and the handoff is complete.",
  },
  {
    id: "publish",
    title: "$12 seller listing",
    detail: "Publish into a dealer-free private party marketplace.",
  },
] as const;

export type ListingFlowState = {
  completedStepIds: readonly ListingFlowStepId[];
  photoCount: number;
  vin?: string;
};

export type ListingFlowSummary = {
  completedCount: number;
  totalCount: number;
  progress: number;
  nextStep: ListingFlowStep | null;
  photosRemaining: number;
  isReadyToPublish: boolean;
};

export const summarizeListingFlow = (
  state: ListingFlowState,
): ListingFlowSummary => {
  const completed = new Set<ListingFlowStepId>(state.completedStepIds);
  const completedCount = listingFlowSteps.filter((step) =>
    completed.has(step.id),
  ).length;
  const nextStep =
    listingFlowSteps.find((step) => !completed.has(step.id)) ?? null;
  const photosRemaining = Math.max(requiredPhotoCount - state.photoCount, 0);

  return {
    completedCount,
    totalCount: listingFlowSteps.length,
    progress: completedCount / listingFlowSteps.length,
    nextStep,
    photosRemaining,
    isReadyToPublish:
      photosRemaining === 0 &&
      completed.has("vin") &&
      completed.has("identity") &&
      completed.has("escrow"),
  };
};
