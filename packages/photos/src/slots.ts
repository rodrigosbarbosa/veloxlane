import { z } from "zod";

import { PHOTO_SLOT_COUNT } from "./constants";

export const angleSlotSchema = z.number().int().min(1).max(PHOTO_SLOT_COUNT);

export type AngleSlot = z.infer<typeof angleSlotSchema>;

export type PhotoSlotDefinition = {
  slot: AngleSlot;
  label: string;
  required: boolean;
};

export const photoSlotDefinitions: readonly PhotoSlotDefinition[] = [
  { slot: 1, label: "Driver side", required: true },
  { slot: 2, label: "Passenger side", required: true },
  { slot: 3, label: "Front", required: true },
  { slot: 4, label: "Rear", required: true },
  { slot: 5, label: "Front 3/4", required: false },
  { slot: 6, label: "Rear 3/4", required: false },
  { slot: 7, label: "Dashboard + odometer", required: false },
  { slot: 8, label: "Front seats", required: false },
  { slot: 9, label: "Engine bay", required: false },
  { slot: 10, label: "Trunk", required: false },
] as const;

export function getPhotoSlotLabel(slot: number): string {
  return (
    photoSlotDefinitions.find((definition) => definition.slot === slot)
      ?.label ?? `Photo ${slot}`
  );
}

export function areRequiredPhotoSlotsFilled(
  filledSlots: readonly number[],
): boolean {
  const filled = new Set(filledSlots);
  return photoSlotDefinitions
    .filter((definition) => definition.required)
    .every((definition) => filled.has(definition.slot));
}
