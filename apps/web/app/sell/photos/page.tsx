"use client";

import { tagline } from "@veloxlane/brand/copy";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PhotoUploadGrid } from "@/components/photos/photo-upload-grid";

function SellPhotosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listingId");

  if (!listingId) {
    return (
      <div className="photo-upload-panel">
        <p className="photo-upload-message">
          Start with your VIN so we can attach photos to a draft listing.
        </p>
        <Link href="/sell/vin" className="hero-link">
          Go to VIN step
        </Link>
      </div>
    );
  }

  return (
    <PhotoUploadGrid
      listingId={listingId}
      onContinue={() => {
        router.push(`/sell/price?listingId=${listingId}`);
      }}
    />
  );
}

export default function SellPhotosPage() {
  return (
    <main className="page-shell">
      <section className="hero-panel photo-sell-page">
        <header className="hero-topbar">
          <div className="brand-lockup" aria-label="VeloxLane">
            <span>Velox</span>
            <span className="brand-x">X</span>
            <span>Lane</span>
          </div>
          <Link href="/sell/vin" className="hero-link">
            Back to VIN
          </Link>
        </header>

        <p className="hero-tagline">{tagline}</p>

        <Suspense
          fallback={<p className="photo-upload-loading">Loading photos…</p>}
        >
          <SellPhotosContent />
        </Suspense>
      </section>
    </main>
  );
}
