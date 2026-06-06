import { describe, expect, it, vi } from "vitest";

import {
  PaymentDispatchError,
  dispatchPaymentSuccess,
  type PaymentDispatchContext,
  type PaymentDispatchDeps,
} from "./index";

const baseContext: PaymentDispatchContext = {
  paymentId: "pay-1",
  userId: "user-1",
  relatedId: "listing-1",
  stripePaymentIntentId: "pi_test",
  amountCents: 600,
};

function createDeps(): PaymentDispatchDeps {
  return {
    activateListing: vi.fn(async () => undefined),
    revealUnlock: vi.fn(async () => undefined),
    applyFeaturedBoost: vi.fn(async () => undefined),
  };
}

describe("dispatchPaymentSuccess", () => {
  it("activates listing on listing fee payment", async () => {
    const deps = createDeps();

    const result = await dispatchPaymentSuccess(
      "listing",
      { ...baseContext, amountCents: 1200 },
      deps,
    );

    expect(deps.activateListing).toHaveBeenCalledWith("listing-1", "user-1");
    expect(deps.revealUnlock).not.toHaveBeenCalled();
    expect(deps.applyFeaturedBoost).not.toHaveBeenCalled();
    expect(result).toEqual({
      action: "listing",
      relatedId: "listing-1",
      stub: true,
    });
  });

  it("reveals unlock on unlock fee payment", async () => {
    const deps = createDeps();

    const result = await dispatchPaymentSuccess("unlock", baseContext, deps);

    expect(deps.revealUnlock).toHaveBeenCalledWith(
      "listing-1",
      "user-1",
      "pi_test",
      600,
    );
    expect(result.action).toBe("unlock");
  });

  it("applies featured boost on featured fee payment", async () => {
    const deps = createDeps();

    const result = await dispatchPaymentSuccess(
      "featured",
      { ...baseContext, amountCents: 1800 },
      deps,
    );

    expect(deps.applyFeaturedBoost).toHaveBeenCalledWith("listing-1", "user-1");
    expect(result.action).toBe("featured");
  });

  it("requires related_id for all platform fee types", async () => {
    const deps = createDeps();

    await expect(
      dispatchPaymentSuccess(
        "unlock",
        { ...baseContext, relatedId: null },
        deps,
      ),
    ).rejects.toThrow(PaymentDispatchError);
  });

  it("throws on unsupported runtime payment type", async () => {
    const deps = createDeps();

    await expect(
      dispatchPaymentSuccess("invalid" as "listing", baseContext, deps),
    ).rejects.toThrow(PaymentDispatchError);
  });
});
