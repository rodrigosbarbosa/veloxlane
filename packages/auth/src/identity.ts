export const MAX_IDENTITY_ATTEMPTS = 3;

export type IdentityState = {
  attempts: number;
  manualReview: boolean;
  idVerified: boolean;
};

export function canRetryIdentity(state: IdentityState): boolean {
  if (state.idVerified) {
    return false;
  }

  if (state.manualReview) {
    return false;
  }

  return state.attempts < MAX_IDENTITY_ATTEMPTS;
}

export function shouldQueueManualReview(attempts: number): boolean {
  return attempts >= MAX_IDENTITY_ATTEMPTS;
}

export function recordIdentityFailure(state: IdentityState): IdentityState {
  if (state.idVerified) {
    return state;
  }

  const attempts = state.attempts + 1;

  return {
    ...state,
    attempts,
    manualReview: shouldQueueManualReview(attempts),
  };
}

export function recordIdentitySuccess(state: IdentityState): IdentityState {
  return {
    ...state,
    attempts: state.attempts,
    manualReview: false,
    idVerified: true,
  };
}
