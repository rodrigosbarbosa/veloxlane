"use client";

import {
  fetchVinLookupPreview,
  formatVinDisplay,
  normalizeVinInput,
  validateVin,
  type VinLookupPreview,
} from "@veloxlane/vin";
import { ScanLine } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { VinPreviewCard } from "@/components/vin/vin-preview-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type VinEntryFormProps = {
  onConfirm?: (preview: VinLookupPreview) => void | Promise<void>;
};

type ScanState = "idle" | "scanning" | "unsupported";

export function VinEntryForm({ onConfirm }: VinEntryFormProps) {
  const [vin, setVin] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<VinLookupPreview | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const scanFrameRef = useRef<number | null>(null);

  const displayVin = useMemo(() => formatVinDisplay(vin), [vin]);
  const isComplete = vin.length === 17;

  const stopScanner = useCallback(() => {
    if (scanFrameRef.current !== null) {
      cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanState("idle");
  }, []);

  useEffect(() => () => stopScanner(), [stopScanner]);

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
      const supabase = createClient();
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

  const scanLoop = useCallback(async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;

    if (
      !video ||
      !detector ||
      video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA
    ) {
      scanFrameRef.current = requestAnimationFrame(() => {
        void scanLoop();
      });
      return;
    }

    try {
      const codes = await detector.detect(video);
      const match = codes.find((code) => code.rawValue);

      if (match?.rawValue) {
        const normalized = normalizeVinInput(match.rawValue);
        if (normalized.length === 17) {
          handleVinChange(normalized);
          stopScanner();
          setScanMessage("VIN captured from barcode.");
          return;
        }
      }
    } catch {
      // BarcodeDetector can throw on empty frames — keep scanning.
    }

    scanFrameRef.current = requestAnimationFrame(() => {
      void scanLoop();
    });
  }, [stopScanner]);

  const startScanner = async () => {
    setScanMessage(null);

    if (typeof window.BarcodeDetector === "undefined") {
      setScanState("unsupported");
      setScanMessage(
        "Barcode scan needs Chrome on desktop or Android. Type your VIN instead.",
      );
      return;
    }

    try {
      detectorRef.current = new window.BarcodeDetector({
        formats: ["code_39", "code_128", "pdf417", "qr_code"],
      });
    } catch {
      setScanState("unsupported");
      setScanMessage(
        "This browser cannot scan VIN barcodes. Type your VIN instead.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanState("scanning");
      scanFrameRef.current = requestAnimationFrame(() => {
        void scanLoop();
      });
    } catch {
      setScanState("unsupported");
      setScanMessage(
        "Camera access was blocked. Allow camera permission or type your VIN.",
      );
    }
  };

  if (confirmed && preview) {
    return (
      <div className="vin-entry-panel">
        <p className="vin-preview-title">VIN confirmed</p>
        <p className="vin-entry-helper">
          {preview.year} {preview.make} {preview.model} is ready for photos and
          pricing in the publish wizard.
        </p>
        <button
          type="button"
          className="vin-secondary-button"
          onClick={() => {
            setConfirmed(false);
            setPreview(null);
          }}
        >
          Edit VIN
        </button>
      </div>
    );
  }

  if (preview) {
    return (
      <VinPreviewCard
        preview={preview}
        confirming={confirming}
        confirmError={confirmError}
        onConfirm={() => {
          void (async () => {
            setConfirming(true);
            setConfirmError(null);
            try {
              await onConfirm?.(preview);
              setConfirmed(true);
            } catch {
              setConfirmError(
                "We could not start your draft listing. Try again in a moment.",
              );
            } finally {
              setConfirming(false);
            }
          })();
        }}
        onEdit={() => {
          setPreview(null);
          setConfirmError(null);
        }}
      />
    );
  }

  return (
    <div className="vin-entry-panel">
      <label className="vin-entry-label" htmlFor="vin-input">
        Vehicle identification number
      </label>
      <input
        id="vin-input"
        name="vin"
        className="vin-entry-input"
        value={displayVin}
        onChange={(event) => handleVinChange(event.target.value)}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        inputMode="text"
        maxLength={19}
        placeholder="1HG CM8263 3A004352"
        aria-invalid={validationMessage ? true : undefined}
        aria-describedby={validationMessage ? "vin-error" : undefined}
      />

      {validationMessage ? (
        <p id="vin-error" className="vin-entry-error" role="alert">
          {validationMessage}
        </p>
      ) : (
        <p className="vin-entry-helper">
          17 characters. Letters I, O, and Q are not used in VINs.
        </p>
      )}

      <div className="vin-entry-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (scanState === "scanning") {
              stopScanner();
              return;
            }

            void startScanner();
          }}
        >
          <ScanLine aria-hidden className="mr-2 size-4" />
          {scanState === "scanning" ? "Stop scan" : "Scan VIN"}
        </Button>

        <Button
          type="button"
          disabled={!isComplete || Boolean(validationMessage) || loading}
          onClick={() => {
            void handleLookup();
          }}
        >
          {loading ? "Pulling vehicle data…" : "Pull CARFAX + pricing"}
        </Button>
      </div>

      {scanMessage ? <p className="vin-entry-helper">{scanMessage}</p> : null}

      {scanState === "scanning" ? (
        <video
          ref={videoRef}
          className="vin-scan-video"
          muted
          playsInline
          aria-label="VIN barcode scanner camera preview"
        />
      ) : null}

      {loading ? (
        <p className="vin-entry-loading" aria-live="polite">
          Fetching CARFAX, NHTSA recalls, and fair-market pricing in parallel…
        </p>
      ) : null}
    </div>
  );
}
