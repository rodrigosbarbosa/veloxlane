"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SellPriceContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listingId");

  return (
    <div className="photo-upload-panel">
      <p className="hero-eyebrow">Next up</p>
      <h2 className="hero-title">Price + description</h2>
      <p className="hero-copy">
        Photo upload is saved on your draft listing
        {listingId ? ` (${listingId})` : ""}. Pricing and publish ship in P1.11.
      </p>
      {listingId ? (
        <Link
          href={`/sell/photos?listingId=${listingId}`}
          className="hero-link"
        >
          Back to photos
        </Link>
      ) : null}
    </div>
  );
}

export default function SellPricePage() {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <Suspense fallback={<p className="photo-upload-loading">Loading…</p>}>
          <SellPriceContent />
        </Suspense>
      </section>
    </main>
  );
}
