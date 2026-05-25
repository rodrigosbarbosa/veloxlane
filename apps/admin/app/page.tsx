import {
  BadgeCheck,
  ClipboardCheck,
  FileCheck2,
  Flag,
  LockKeyhole,
  Scale,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { MetricTile, StatusPill, SurfacePanel } from "@veloxlane/ui-web";

import {
  canViewArea,
  getStaffAccess,
  type ConsoleArea,
} from "../lib/staff-access";

type AdminPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const consoleAreas: Array<{
  area: ConsoleArea;
  title: string;
  copy: string;
  metric: string;
  icon: typeof ClipboardCheck;
}> = [
  {
    area: "listingsQueue",
    title: "Listings queue",
    copy: "Review private-party listing readiness, VIN match posture, and photo quality checkpoints.",
    metric: "Queue view",
    icon: ClipboardCheck,
  },
  {
    area: "usersIdentity",
    title: "Users and identity",
    copy: "Track seller and buyer identity states before contact unlocks or closing workflows proceed.",
    metric: "KYC state",
    icon: UserRoundCheck,
  },
  {
    area: "dealerFlags",
    title: "Dealer flags",
    copy: "Surface volume, registry, VIN reuse, and behavioral signals that may violate the no-dealer policy.",
    metric: "Risk triage",
    icon: Flag,
  },
  {
    area: "escrowMonitoring",
    title: "Escrow monitoring",
    copy: "Monitor Escrow.com workflow milestones without receiving, holding, or disbursing purchase funds.",
    metric: "Escrow.com",
    icon: ShieldCheck,
  },
  {
    area: "billOfSaleMonitoring",
    title: "Bill-of-sale monitoring",
    copy: "Check state-specific document readiness for Florida and Texas launch transactions.",
    metric: "FL + TX",
    icon: FileCheck2,
  },
  {
    area: "auditPosture",
    title: "Audit posture",
    copy: "Prepare immutable staff action logs, queue review reasons, and compliance evidence boundaries.",
    metric: "Evidence",
    icon: Scale,
  },
];

const rolePreviewLinks = [
  "support",
  "identity",
  "risk",
  "escrow",
  "compliance",
  "admin",
];

export default function AdminHomePage({ searchParams }: AdminPageProps) {
  const access = getStaffAccess(searchParams?.role);

  return (
    <main className="admin-shell">
      <section className="admin-hero">
        <header className="admin-topbar">
          <div className="brand-lockup" aria-label="VeloxLane Admin">
            <span>Velox</span>
            <span className="brand-x">X</span>
            <span>Lane</span>
            <span className="brand-console">Admin</span>
          </div>
          <StatusPill
            tone={access.allowed ? "success" : "warning"}
            icon={
              access.allowed ? (
                <BadgeCheck className="h-4 w-4" />
              ) : (
                <LockKeyhole className="h-4 w-4" />
              )
            }
          >
            {access.allowed ? `${access.role} role` : "locked preview"}
          </StatusPill>
        </header>

        <div className="hero-grid">
          <div className="hero-copy-block">
            <p className="eyebrow">Staff-only operations</p>
            <h1>{access.heading}</h1>
            <p>
              {access.detail} The console scope covers listing review, user
              identity, dealer detection, Escrow.com transaction status,
              bill-of-sale monitoring, and audit readiness.
            </p>
            <p className="funds-rule">
              VeloxLane never holds vehicle purchase funds. Car sale money must
              flow through Escrow.com as the licensed escrow agent.
            </p>
          </div>

          <SurfacePanel as="aside" className="access-panel">
            <p className="panel-kicker">Scaffold gate</p>
            <h2>Role claim preview</h2>
            <p>
              Use the role model below to preview staff states until Firebase
              Auth claims are wired into this separate deployment.
            </p>
            <div className="role-links" aria-label="Staff role previews">
              {rolePreviewLinks.map((role) => (
                <a key={role} href={`/?role=${role}`}>
                  {role}
                </a>
              ))}
            </div>
          </SurfacePanel>
        </div>
      </section>

      <section className="metrics-strip" aria-label="Admin posture summary">
        <MetricTile
          label="Purchase funds"
          value="Never held"
          detail="Escrow.com handles buyer-to-seller sale money."
        />
        <MetricTile
          label="Deployment"
          value="Separate app"
          detail="Admin ships independently from the public marketplace."
        />
        <MetricTile
          label="Access"
          value={access.allowed ? "Staff scoped" : "Closed"}
          detail="No customer, seller, or dealer role can view queue state."
        />
      </section>

      <section className="console-grid" aria-label="Staff console areas">
        {consoleAreas.map(({ area, title, copy, metric, icon: Icon }) => {
          const visible = canViewArea(access, area);

          return (
            <SurfacePanel
              key={area}
              className={
                visible ? "console-card" : "console-card console-card-locked"
              }
            >
              <div className="card-heading-row">
                <div className="icon-badge">
                  <Icon className="h-5 w-5" />
                </div>
                <StatusPill tone={visible ? "success" : "neutral"}>
                  {visible ? "visible" : "gated"}
                </StatusPill>
              </div>
              <h2>{title}</h2>
              <p>
                {visible
                  ? copy
                  : "Staff role scope required before this area can expose operational state."}
              </p>
              <span className="card-metric">{visible ? metric : "Locked"}</span>
            </SurfacePanel>
          );
        })}
      </section>
    </main>
  );
}
