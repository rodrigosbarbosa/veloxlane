"use client";

import { tagline } from "@veloxlane/brand/copy";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { VinEntryForm } from "@/components/vin/vin-entry-form";
import { createDraftListing } from "@/lib/photos/client";

export default function SellVinPage() {
  const router = useRouter();

  return (
    <main className="page-shell">
      <section className="hero-panel vin-sell-page">
        <header className="hero-topbar">
          <div className="brand-lockup" aria-label="VeloxLane">
            <span>Velox</span>
            <span className="brand-x">X</span>
            <span>Lane</span>
          </div>
          <Link href="/" className="hero-link">
            Back home
          </Link>
        </header>

        <div className="vin-sell-intro">
          <p className="hero-eyebrow">Sell my car</p>
          <h1 className="hero-title">Match your VIN</h1>
          <p className="hero-copy">
            Enter or scan your VIN once. We pull CARFAX history, live NHTSA
            recalls, and fair-market pricing before you add photos and price.
          </p>
          <p className="hero-tagline">{tagline}</p>
        </div>

        <VinEntryForm
          onConfirm={async (preview) => {
            const draft = await createDraftListing({
              vin: preview.vin,
              make: preview.make ?? "Unknown",
              model: preview.model ?? "Unknown",
              year: preview.year ?? new Date().getFullYear(),
            });
            router.push(`/sell/photos?listingId=${draft.listingId}`);
          }}
        />
      </section>
    </main>
  );
}
