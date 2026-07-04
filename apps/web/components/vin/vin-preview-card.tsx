"use client";

import { copy, tagline } from "@veloxlane/brand/copy";
import { getPriceRangePosition, type VinLookupPreview } from "@veloxlane/vin";
import { AlertTriangle, BadgeCheck, ShieldCheck } from "lucide-react";

type VinPreviewCardProps = {
  preview: VinLookupPreview;
  confirming?: boolean;
  confirmError?: string | null;
  onConfirm: () => void;
  onEdit: () => void;
};

function formatCurrency(value: number | undefined): string {
  if (value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function VinPreviewCard({
  preview,
  confirming = false,
  confirmError = null,
  onConfirm,
  onEdit,
}: VinPreviewCardProps) {
  const vehicleTitle = [preview.year, preview.make, preview.model]
    .filter(Boolean)
    .join(" ");

  const low = preview.marketcheck?.fairPriceLow;
  const high = preview.marketcheck?.fairPriceHigh;
  const mid = preview.marketcheck?.fairPriceMid;
  const rangePosition = getPriceRangePosition(mid, low, high);

  const rangeClassName =
    rangePosition === "below"
      ? "bg-teal/20"
      : rangePosition === "above"
        ? "bg-amber/20"
        : "bg-teal/30";

  const recallCount = preview.nhtsa?.recallCount ?? 0;

  return (
    <section className="vin-preview-card" aria-live="polite">
      <header className="vin-preview-header">
        <div>
          <p className="vin-preview-eyebrow">Vehicle match</p>
          <h2 className="vin-preview-title">
            {vehicleTitle || "Vehicle details pending"}
          </h2>
          <p className="vin-preview-vin">{preview.vin}</p>
        </div>
        <div className="vin-trust-badge" aria-label="VeloxLane trust badge">
          <BadgeCheck aria-hidden className="size-5" />
          <span>{copy.escrowProtected}</span>
        </div>
      </header>

      <div className="vin-preview-grid">
        <article className="vin-preview-stat">
          <p className="vin-preview-stat-label">AutoCheck accidents</p>
          <p className="vin-preview-stat-value">
            {preview.autocheck?.accidentCount ?? "—"}
          </p>
          {preview.errors?.autocheck ? (
            <p className="vin-preview-note">{preview.errors.autocheck}</p>
          ) : null}
        </article>

        <article className="vin-preview-stat">
          <p className="vin-preview-stat-label">Owners</p>
          <p className="vin-preview-stat-value">
            {preview.autocheck?.ownerCount ?? "—"}
          </p>
        </article>

        <article className="vin-preview-stat">
          <p className="vin-preview-stat-label">Open recalls</p>
          <p className="vin-preview-stat-value">{recallCount}</p>
          {recallCount > 0 ? (
            <p className="vin-preview-note vin-preview-warning">
              <AlertTriangle aria-hidden className="inline size-4" /> Check
              NHTSA before you list
            </p>
          ) : null}
          {preview.errors?.nhtsa ? (
            <p className="vin-preview-note">{preview.errors.nhtsa}</p>
          ) : null}
        </article>
      </div>

      <article className="vin-price-range">
        <div className="vin-price-range-header">
          <p className="vin-preview-stat-label">Fair market range</p>
          <p className="vin-price-range-values">
            {formatCurrency(low)} – {formatCurrency(high)}
          </p>
        </div>
        <div className="vin-price-range-track" aria-hidden>
          <div className={`vin-price-range-fill ${rangeClassName}`} />
          <div className="vin-price-range-marker" />
        </div>
        {preview.marketcheck?.fairPriceMid ? (
          <p className="vin-preview-note">
            Mid-market estimate:{" "}
            {formatCurrency(preview.marketcheck.fairPriceMid)}
          </p>
        ) : null}
        {preview.errors?.marketcheck ? (
          <p className="vin-preview-note">{preview.errors.marketcheck}</p>
        ) : null}
      </article>

      <div className="vin-preview-actions">
        <button type="button" className="vin-secondary-button" onClick={onEdit}>
          Edit VIN
        </button>
        <button
          type="button"
          className="vin-primary-button"
          disabled={confirming}
          onClick={onConfirm}
        >
          {confirming ? "Saving draft…" : "Looks right — continue"}
        </button>
      </div>

      {confirmError ? (
        <p className="vin-preview-note vin-preview-warning" role="alert">
          {confirmError}
        </p>
      ) : null}

      <p className="vin-preview-footer">
        <ShieldCheck aria-hidden className="inline size-4" /> {tagline}
      </p>
    </section>
  );
}
