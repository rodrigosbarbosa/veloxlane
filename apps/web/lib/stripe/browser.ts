import { loadStripe, type Stripe } from "@stripe/stripe-js";

type StripeIdentityWindow = Window & {
  __stripeIdentityShouldFail?: boolean;
};

function createMockStripe(): Stripe {
  return {
    verifyIdentity: async () => {
      const shouldFail =
        typeof window !== "undefined" &&
        (window as StripeIdentityWindow).__stripeIdentityShouldFail;

      if (shouldFail) {
        return { error: { message: "mock_identity_failure" } };
      }

      return { error: undefined };
    },
  } as unknown as Stripe;
}

export async function loadStripeClient(): Promise<Stripe | null> {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  if (key === "pk_test_mock") {
    return createMockStripe();
  }

  return loadStripe(key);
}
