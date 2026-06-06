import { describe, expect, it } from "vitest";

import {
  canRetryIdentity,
  recordIdentityFailure,
  recordIdentitySuccess,
  shouldQueueManualReview,
} from "./identity";

describe("identity", () => {
  it("allows retries until the third failure", () => {
    expect(
      canRetryIdentity({ attempts: 2, manualReview: false, idVerified: false }),
    ).toBe(true);
    expect(
      canRetryIdentity({ attempts: 3, manualReview: true, idVerified: false }),
    ).toBe(false);
  });

  it("blocks retries when already verified", () => {
    expect(
      canRetryIdentity({ attempts: 0, manualReview: false, idVerified: true }),
    ).toBe(false);
  });

  it("queues manual review after three failures", () => {
    let state = { attempts: 0, manualReview: false, idVerified: false };
    state = recordIdentityFailure(state);
    state = recordIdentityFailure(state);
    state = recordIdentityFailure(state);

    expect(shouldQueueManualReview(state.attempts)).toBe(true);
    expect(state.manualReview).toBe(true);
  });

  it("does not increment attempts when already verified", () => {
    const state = recordIdentityFailure({
      attempts: 1,
      manualReview: false,
      idVerified: true,
    });
    expect(state.attempts).toBe(1);
  });

  it("marks verification success", () => {
    const state = recordIdentitySuccess({
      attempts: 2,
      manualReview: false,
      idVerified: false,
    });

    expect(state.idVerified).toBe(true);
  });
});
