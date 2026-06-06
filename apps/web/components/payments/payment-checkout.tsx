"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  formatAmountCents,
  getAmountCents,
  PAYMENT_TYPE_LABELS,
  type PlatformPaymentType,
} from "@veloxlane/payments";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { loadStripeClient } from "@/lib/stripe/browser";

export type PaymentCheckoutProps = {
  type: PlatformPaymentType;
  relatedId: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (message: string) => void;
};

type CheckoutFormProps = {
  type: PlatformPaymentType;
  relatedId: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (message: string) => void;
};

type CreateIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
  amountCents: number;
};

function CheckoutForm({
  type,
  relatedId,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setSubmitting(true);
      setMessage(null);

      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      setSubmitting(false);

      if (result.error) {
        const errorMessage =
          result.error.message ?? "Payment failed. Try again.";
        setMessage(errorMessage);
        onError?.(errorMessage);
        return;
      }

      const paymentIntentId = result.paymentIntent?.id;
      if (!paymentIntentId) {
        const errorMessage = "Payment did not complete.";
        setMessage(errorMessage);
        onError?.(errorMessage);
        return;
      }

      onSuccess?.(paymentIntentId);
    },
    [elements, onError, onSuccess, stripe],
  );

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <PaymentElement />
      {message ? (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      ) : null}
      <Button disabled={!stripe || submitting} type="submit">
        {submitting
          ? "Processing…"
          : `Pay ${formatAmountCents(getAmountCents(type))}`}
      </Button>
    </form>
  );
}

export function PaymentCheckout({
  type,
  relatedId,
  onSuccess,
  onError,
}: PaymentCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stripePromise = useMemo(() => loadStripeClient(), []);

  const initializeCheckout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, relatedId }),
      });

      const payload = (await response.json()) as CreateIntentResponse & {
        message?: string;
      };

      if (!response.ok || !payload.clientSecret) {
        throw new Error(payload.message ?? "Unable to start checkout.");
      }

      setClientSecret(payload.clientSecret);
    } catch (initError) {
      const message =
        initError instanceof Error
          ? initError.message
          : "Unable to start checkout.";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [onError, relatedId, type]);

  useEffect(() => {
    void initializeCheckout();
  }, [initializeCheckout]);

  if (loading) {
    return <p className="text-sm text-asphalt">Preparing secure checkout…</p>;
  }

  if (error || !clientSecret) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {error ?? "Unable to start checkout."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-midnight">
        {PAYMENT_TYPE_LABELS[type]}
      </p>
      <Elements
        options={{ clientSecret, appearance: { theme: "stripe" } }}
        stripe={stripePromise}
      >
        <CheckoutForm
          onError={onError}
          onSuccess={onSuccess}
          relatedId={relatedId}
          type={type}
        />
      </Elements>
    </div>
  );
}
