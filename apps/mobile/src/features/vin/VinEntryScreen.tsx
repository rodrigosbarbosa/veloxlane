import { CameraView, useCameraPermissions } from "expo-camera";
import {
  fetchVinLookupPreview,
  formatVinDisplay,
  normalizeVinInput,
  validateVin,
  type VinLookupPreview,
} from "@veloxlane/vin";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LaneStripe } from "~/components/LaneStripe";
import { PrimaryButton } from "~/components/PrimaryButton";
import { VinPreviewCard } from "~/features/vin/VinPreviewCard";
import { supabase } from "~/lib/supabase";
import { authFieldStyles, mobileTheme, textStyle } from "~/theme/mobileTheme";

type VinEntryScreenProps = {
  confirming?: boolean;
  confirmError?: string | null;
  onConfirm?: (preview: VinLookupPreview) => void | Promise<void>;
};

export function VinEntryScreen({
  confirming = false,
  confirmError = null,
  onConfirm,
}: VinEntryScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [vin, setVin] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<VinLookupPreview | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const displayVin = formatVinDisplay(vin);
  const isComplete = vin.length === 17;

  const handleVinChange = (value: string) => {
    const normalized = normalizeVinInput(value);
    setVin(normalized);
    setPreview(null);

    if (normalized.length === 0) {
      setValidationMessage(null);
      return;
    }

    const result = validateVin(normalized);
    setValidationMessage(result.valid ? null : result.message);
  };

  const handleLookup = async () => {
    const result = validateVin(vin);
    if (!result.valid) {
      setValidationMessage(result.message);
      return;
    }

    setLoading(true);
    setPreview(null);

    try {
      const nextPreview = await fetchVinLookupPreview(supabase, result.vin);
      setPreview(nextPreview);
    } catch {
      setValidationMessage(
        "We could not load vehicle data right now. Try again in a moment.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = useCallback(({ data }: { data: string }) => {
    const normalized = normalizeVinInput(data);
    if (normalized.length !== 17) {
      return;
    }

    setVin(normalized);
    setPreview(null);
    setValidationMessage(null);
    setScanning(false);
    setScanMessage("VIN captured from barcode.");
  }, []);

  const toggleScanner = async () => {
    setScanMessage(null);

    if (scanning) {
      setScanning(false);
      return;
    }

    if (!permission?.granted) {
      const nextPermission = await requestPermission();
      if (!nextPermission.granted) {
        setScanMessage("Camera access is required to scan your VIN.");
        return;
      }
    }

    setScanning(true);
  };

  if (preview) {
    return (
      <SafeAreaView
        style={{
          backgroundColor: mobileTheme.colors.surface.canvas,
          flex: 1,
          padding: mobileTheme.spacing[5],
        }}
      >
        <VinPreviewCard
          preview={preview}
          confirming={confirming}
          confirmError={confirmError}
          onConfirm={() => {
            void onConfirm?.(preview);
          }}
          onEdit={() => setPreview(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: mobileTheme.colors.surface.canvas,
        flex: 1,
        padding: mobileTheme.spacing[5],
        gap: mobileTheme.spacing[5],
      }}
    >
      <View style={{ gap: mobileTheme.spacing[3] }}>
        <Text
          style={[
            textStyle("overline"),
            { color: mobileTheme.colors.text.onDarkMuted },
          ]}
        >
          Sell my car
        </Text>
        <LaneStripe segments={5} completedSegments={1} currentSegment={1} />
        <Text
          style={[textStyle("h2"), { color: mobileTheme.colors.text.onDark }]}
        >
          Match your VIN
        </Text>
        <Text
          style={[
            textStyle("body"),
            { color: mobileTheme.colors.text.onDarkMuted },
          ]}
        >
          Enter or scan your VIN once. We pull CARFAX, live NHTSA recalls, and
          fair-market pricing in parallel.
        </Text>
      </View>

      <View style={{ gap: mobileTheme.spacing[3] }}>
        <Text
          style={[
            textStyle("label"),
            { color: mobileTheme.colors.text.onDarkMuted },
          ]}
        >
          Vehicle identification number
        </Text>
        <TextInput
          value={displayVin}
          onChangeText={handleVinChange}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={19}
          placeholder="1HG CM8263 3A004352"
          placeholderTextColor={authFieldStyles.placeholderColor}
          style={[
            authFieldStyles.input,
            textStyle("mono"),
            { letterSpacing: 1, textTransform: "uppercase" },
          ]}
        />
        {validationMessage ? (
          <Text style={authFieldStyles.messageError}>{validationMessage}</Text>
        ) : (
          <Text style={authFieldStyles.helperText}>
            17 characters. Letters I, O, and Q are not used in VINs.
          </Text>
        )}
      </View>

      <View style={{ gap: mobileTheme.spacing[3] }}>
        <Pressable onPress={() => void toggleScanner()}>
          <Text
            style={[
              textStyle("label"),
              { color: mobileTheme.colors.action.primaryBg },
            ]}
          >
            {scanning ? "Stop VIN scan" : "Scan VIN barcode"}
          </Text>
        </Pressable>

        {scanning ? (
          <CameraView
            style={{
              borderRadius: mobileTheme.radius.md,
              height: 220,
              overflow: "hidden",
            }}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["code39", "code128", "pdf417", "qr"],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          />
        ) : null}

        {scanMessage ? (
          <Text style={authFieldStyles.helperText}>{scanMessage}</Text>
        ) : null}
      </View>

      {loading ? (
        <View style={{ alignItems: "center", gap: mobileTheme.spacing[2] }}>
          <ActivityIndicator color={mobileTheme.colors.action.primaryBg} />
          <Text
            style={[
              textStyle("bodySm"),
              { color: mobileTheme.colors.text.onDarkMuted },
            ]}
          >
            Fetching CARFAX, NHTSA recalls, and fair-market pricing…
          </Text>
        </View>
      ) : (
        <PrimaryButton
          disabled={!isComplete || Boolean(validationMessage)}
          label="Pull CARFAX + pricing"
          onPress={() => {
            void handleLookup();
          }}
        />
      )}
    </SafeAreaView>
  );
}
