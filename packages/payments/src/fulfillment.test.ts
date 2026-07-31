import { describe, expect, it, vi } from "vitest";

import {
  FEATURED_DURATION_DAYS,
  activateListingOnPayment,
  applyFeaturedBoostOnPayment,
  featuredUntilFrom,
  revealUnlockOnPayment,
  unlockAmountDollars,
  type FulfillmentStore,
} from "./fulfillment";

function createStore(
  overrides: Partial<FulfillmentStore> = {},
): FulfillmentStore {
  return {
    activateDraftListing: vi.fn(async () => undefined),
    unlockExistsForIntent: vi.fn(async () => false),
    insertUnlock: vi.fn(async () => undefined),
    setListingFeaturedUntil: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("unlockAmountDollars", () => {
  it("converts cents to dollars", () => {
    expect(unlockAmountDollars(600)).toBe(6);
    expect(unlockAmountDollars(1234)).toBe(12.34);
    expect(unlockAmountDollars(0)).toBe(0);
  });
});

describe("featuredUntilFrom", () => {
  it("adds the featured window to the start time", () => {
    const now = new Date("2026-07-31T00:00:00.000Z");
    const until = featuredUntilFrom(now);

    const expected = new Date(
      now.getTime() + FEATURED_DURATION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(until).toBe(expected);
    expect(until).toBe("2026-08-30T00:00:00.000Z");
  });
});

describe("activateListingOnPayment", () => {
  it("activates the seller's draft listing", async () => {
    const store = createStore();

    await activateListingOnPayment(store, "listing-1", "seller-1");

    expect(store.activateDraftListing).toHaveBeenCalledWith(
      "listing-1",
      "seller-1",
    );
  });
});

describe("revealUnlockOnPayment", () => {
  const args = {
    listingId: "listing-1",
    buyerId: "buyer-1",
    stripePaymentIntentId: "pi_test",
    amountCents: 600,
  };

  it("inserts an unlock row with the amount in dollars", async () => {
    const store = createStore();

    await revealUnlockOnPayment(store, args);

    expect(store.insertUnlock).toHaveBeenCalledWith({
      listingId: "listing-1",
      buyerId: "buyer-1",
      stripePaymentIntentId: "pi_test",
      amount: 6,
    });
  });

  it("is idempotent when an unlock already exists for the intent", async () => {
    const store = createStore({
      unlockExistsForIntent: vi.fn(async () => true),
    });

    await revealUnlockOnPayment(store, args);

    expect(store.insertUnlock).not.toHaveBeenCalled();
  });
});

describe("applyFeaturedBoostOnPayment", () => {
  it("sets featured_until scoped to the seller", async () => {
    const store = createStore();
    const now = new Date("2026-07-31T00:00:00.000Z");

    await applyFeaturedBoostOnPayment(store, "listing-1", "seller-1", now);

    expect(store.setListingFeaturedUntil).toHaveBeenCalledWith(
      "listing-1",
      "seller-1",
      "2026-08-30T00:00:00.000Z",
    );
  });
});
