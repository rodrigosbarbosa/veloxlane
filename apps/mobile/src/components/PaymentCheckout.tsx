import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { StripeProvider, usePaymentSheet } from "@stripe/stripe-react-native";
import {
  formatAmountCents,
  getAmountCents,
  PAYMENT_TYPE_LABELS,
  type PlatformPaymentType,
} from "@veloxlane/payments";

import { PrimaryButton } from "~/components/PrimaryButton";
import { supabase } from "~/lib/supabase";

export type PaymentCheckoutProps = {
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

function PaymentSheetCheckout({
  type,
  relatedId,
  onSuccess,
  onError,
}: PaymentCheckoutProps) {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReady(false);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "stripe-create-intent",
      { body: { type, relatedId } },
    );

    if (invokeError || !data) {
      const message = invokeError?.message ?? "Unable to start checkout.";
      setError(message);
      onError?.(message);
      setLoading(false);
      return;
    }

    const payload = data as CreateIntentResponse;
    setPaymentIntentId(payload.paymentIntentId);

    const initResult = await initPaymentSheet({
      merchantDisplayName: "VeloxLane",
      paymentIntentClientSecret: payload.clientSecret,
      defaultBillingDetails: { name: "VeloxLane buyer" },
    });

    if (initResult.error) {
      const message = initResult.error.message;
      setError(message);
      onError?.(message);
      setLoading(false);
      return;
    }

    setReady(true);
    setLoading(false);
  }, [initPaymentSheet, onError, relatedId, type]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const handlePay = useCallback(async () => {
    const result = await presentPaymentSheet();
    if (result.error) {
      const message = result.error.message;
      setError(message);
      onError?.(message);
      return;
    }

    if (paymentIntentId) {
      onSuccess?.(paymentIntentId);
    }
  }, [onError, onSuccess, paymentIntentId, presentPaymentSheet]);

  if (loading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator />
        <Text className="mt-2 text-sm text-asphalt">
          Preparing secure checkout…
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <Text className="text-sm text-red-600" accessibilityRole="alert">
        {error}
      </Text>
    );
  }

  return (
    <View className="space-y-3">
      <Text className="text-base font-semibold text-midnight">
        {PAYMENT_TYPE_LABELS[type]}
      </Text>
      <Text className="text-sm text-asphalt">
        {formatAmountCents(getAmountCents(type))} platform fee
      </Text>
      <PrimaryButton
        disabled={!ready}
        label={`Pay ${formatAmountCents(getAmountCents(type))}`}
        onPress={() => {
          void handlePay();
        }}
      />
    </View>
  );
}

export function PaymentCheckout(props: PaymentCheckoutProps) {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  const content = useMemo(() => <PaymentSheetCheckout {...props} />, [props]);

  if (!publishableKey) {
    return (
      <Text className="text-sm text-red-600">
        Stripe publishable key is not configured.
      </Text>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>{content}</StripeProvider>
  );
}
