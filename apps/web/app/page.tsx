import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CircleDollarSign,
  FileText,
  MessageSquareLock,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { getApiHealthSummary } from "../lib/api-health";

const highlights = [
  "Private-party car marketplace",
  "Dealer-free listings",
  "Verified buyers and sellers",
];

const trustPills = [
  "ID verified",
  "Escrow protected",
  "State bill-of-sale",
  "VIN matched",
];

const steps = [
  {
    icon: Camera,
    title: "List in 10 guided photos",
    copy: "Follow a built-in shot list, add the VIN, and publish with a flat $12 seller listing fee.",
  },
  {
    icon: UserRoundCheck,
    title: "Meet verified buyers",
    copy: "Buyers unlock seller contact for $6 after verification, so both sides know who is showing up.",
  },
  {
    icon: ShieldCheck,
    title: "Close through escrow",
    copy: "Transactions stay escrow-protected and finish with a state-specific bill of sale inside the flow.",
  },
];

const valueCards = [
  {
    icon: CircleDollarSign,
    title: "Straight pricing",
    copy: "$12 to list. $6 to unlock contact. No dealer markup, no closing surprise.",
  },
  {
    icon: MessageSquareLock,
    title: "Protected introductions",
    copy: "Contact details stay behind a paid unlock so sellers are not fielding anonymous spam.",
  },
  {
    icon: FileText,
    title: "Paperwork built in",
    copy: "Every completed deal ends with a state bill-of-sale flow instead of a messy handoff.",
  },
];

const healthToneClassName: Record<
  Awaited<ReturnType<typeof getApiHealthSummary>>["state"],
  string
> = {
  configured: "status-chip status-chip-configured",
  online: "status-chip status-chip-online",
  offline: "status-chip status-chip-offline",
};

export default async function HomePage() {
  const apiHealth = await getApiHealthSummary();

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <header className="hero-topbar">
          <div className="brand-lockup" aria-label="VeloxLane">
            <span>Velox</span>
            <span className="brand-x">X</span>
            <span>Lane</span>
          </div>
          <div className={healthToneClassName[apiHealth.state]}>
            <BadgeCheck className="h-4 w-4" />
            <span>{apiHealth.label}</span>
          </div>
        </header>

        <div className="hero-grid">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="eyebrow">Skip the lot. Take the lane.</p>
              <h1 className="hero-title">
                Private-party car deals without the dealer noise.
              </h1>
              <p className="hero-copy">
                VeloxLane helps verified buyers and sellers move faster with
                escrow-protected transactions, guided listings, and direct fees
                you can explain in one sentence.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {highlights.map((item) => (
                <span key={item} className="pill pill-dark">
                  {item}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a className="button-primary" href="#list-flow">
                Start a seller flow
                <ArrowRight className="h-4 w-4" />
              </a>
              <a className="button-secondary" href="#pricing">
                See marketplace fees
              </a>
            </div>

            <p className="hero-note">{apiHealth.detail}</p>
          </div>

          <aside className="hero-card">
            <div className="card-kicker">Marketplace snapshot</div>
            <div className="space-y-4">
              <div>
                <p className="metric-value">$12</p>
                <p className="metric-copy">
                  seller listing fee for a guided 10-photo post
                </p>
              </div>
              <div className="lane-divider" />
              <div>
                <p className="metric-value">$6</p>
                <p className="metric-copy">
                  buyer contact unlock once identity checks are complete
                </p>
              </div>
              <div className="lane-divider" />
              <div className="flex flex-wrap gap-3">
                {trustPills.map((item) => (
                  <span key={item} className="pill pill-teal">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="list-flow" className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Your lane. Your deal.</p>
          <h2>Three steps from listing to signed paperwork.</h2>
        </div>
        <div className="card-grid">
          {steps.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="feature-card">
              <div className="icon-badge">
                <Icon className="h-5 w-5" />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="content-section content-section-light">
        <div className="section-heading">
          <p className="eyebrow eyebrow-dark">Built for private deals</p>
          <h2>Direct fees, verified people, and less wasted time.</h2>
        </div>
        <div className="card-grid">
          {valueCards.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="surface-card">
              <div className="icon-badge icon-badge-light">
                <Icon className="h-5 w-5" />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
