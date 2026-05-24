# VeloxLane Founder Brief

To: Hermes (orchestrating agent)
From: Founder
Project location: ~/projects/veloxlane
Mission: Build VeloxLane — a private-party vehicle marketplace web app, mobile app (iOS + Android), and admin backend — from zero to MVP.

## 0. How Hermes Will Run This Project

Hermes is the orchestrator. Hermes delegates, reviews, and instructs. Hermes does not write production application code.

Team:

- Codex CLI: Writes all application code: frontend, backend, mobile, admin, infrastructure-as-code.
- Claude CLI: Reviews every code commit from Codex and sends it back if it fails review. Produces all UX/UI design: wireframes, component specs, design tokens, screen mockups, and Figma-ready specifications.
- Founder: Provides API keys, sets up external service accounts, makes business decisions, signs contracts, funds infrastructure.

Operating loop:

1. Read this brief end-to-end before doing anything.
2. Initialize the project at ~/projects/veloxlane with the monorepo structure defined in section 4.
3. Plan each phase as a sequence of small, reviewable tasks. Never hand Codex a task larger than a single feature module.
4. For each task: instruct Claude CLI to produce design first when UI is involved, then instruct Codex to implement, then instruct Claude CLI to review.
5. If Claude CLI rejects code, return it to Codex with the specific review notes. Do not move forward until Claude approves.
6. Before any external service is needed, stop and instruct the founder with a precise checklist of what to sign up for, what tier to pick, and what credentials to hand back.
7. Memory leak prevention is a standing requirement. Every code review by Claude must check for memory leaks.

Never:

- Never commit production code directly as Hermes.
- Never skip the Claude review step.
- Never bypass the founder for paid service signups, API key generation, or account creation.
- Never hold vehicle purchase funds in any VeloxLane-controlled account or wallet. All car sale money flows through Escrow.com only.

## 1. What VeloxLane Is

VeloxLane is a private-party vehicle marketplace that connects verified individual car sellers directly with verified buyers. Dealers are explicitly blocked. Every transaction is protected by licensed escrow (Escrow.com), identity-verified via Stripe Identity, and documented with a state-specific electronic bill of sale generated inside the app.

One-line pitch: The fast lane for private car sales. Skip the lot. Take the lane.

Core differentiators:

- True no-dealer policy enforced by AI risk scoring, DMV/NIADA registry lookup, VIN cross-reference, and volume caps.
- Automatic CARFAX pull on VIN entry.
- Guided 10-shot camera with AI quality checks.
- Licensed escrow built in through Escrow.com partner. Zero money transmitter license exposure.
- Lower fees: $12 listing + $6 unlock vs PrivateAuto's $29 + $150 closing.

Launch markets: Florida and Texas first. California in phase 2. Do not scope-creep into national launch features before product-market fit.

## 2. Brand Identity

Name: VeloxLane
Primary tagline: The lane built for private deals.
Billboard: Skip the lot. Take the lane.
In-product: Your lane. Your deal.
Campaign: Private sales. Open road.

Logo: custom italicized VeloxLane wordmark. The X is amber and skewed like a lane stripe, with a dashed amber lane stripe under the right side. Logo files are stored in brand/logo/.

App icon: square icon in same visual language: V + amber X on midnight (#0A1628), with a small dashed amber lane stripe at the bottom.

Colors:

- Velox Midnight: #0A1628 — primary brand color; backgrounds, headers, depth, trust.
- Highway Amber: #E8A03D — accents only; logo X, lane stripes, primary CTAs, signals.
- Lane White: #F8F6F1 — cream canvas; light backgrounds, card surfaces.
- Asphalt Gray: #3D4550 — secondary text, structure, dividers.
- Signal Teal: #2DBFA6 — verified, protected, escrow indicators.

Neutral support shades only as needed. No other hues.

Amber Rule: Amber is the signal color. Use sparingly for logo X, dashed lane stripes, primary CTAs, verified badges, key confirmations. Never use amber for body text or as a full background. If a screen has more than about 10% amber surface area, it is overused.

Typography:

- Display/headings: Inter, 600, italic, tight letter-spacing (-0.03em).
- Body: Inter, 400, regular.
- Web self-hosts Inter via next/font.
- Mobile bundles Inter as a custom Expo font.

Brand voice:

- Direct, never pushy.
- Warm, never corporate.
- Confident, never arrogant.
- Specific, never vague.

Visual motifs:

- Dashed amber lane stripes as dividers.
- Sharp italic typography evokes motion.
- Rounded cards, radius 12px, Lane White surfaces on Midnight backgrounds.
- Verified / escrow / ID-checked indicators always Signal Teal with checkmark icon.

Design tokens day-one requirement:
Create packages/design-tokens/ with tokens.json, tokens.css, and tokens.ts. No screen should hardcode hex values.

## 3. Product Scope

Three surfaces sharing one backend:

- apps/web: Next.js 14 App Router, Tailwind, shadcn/ui public marketplace.
- apps/mobile: React Native + Expo SDK 51 iOS/Android, primary seller camera/KYC/listing app.
- apps/admin: separate Next.js deployment, role-gated staff console.
- apps/api: Node.js 20 + TypeScript + Express + OpenAPI, Prisma over PostgreSQL, Redis cache, Bull queues.

Shared packages:

- packages/design-tokens
- packages/ui-web
- packages/types
- packages/sdk

## 4. Repository Structure

Required structure:

~/projects/veloxlane/
├── apps/
│ ├── web/
│ ├── mobile/
│ ├── admin/
│ └── api/
├── packages/
│ ├── design-tokens/
│ ├── ui-web/
│ ├── types/
│ └── sdk/
├── brand/
│ ├── logo/
│ └── assets/
├── docs/
│ ├── design-system.md
│ ├── api-spec.md
│ ├── runbook.md
│ └── decisions/
├── infra/
│ ├── terraform/
│ └── github-actions/
├── .env.example
├── turbo.json
├── pnpm-workspace.yaml
└── README.md

Hermes must enforce this structure and reject Codex commits that deviate.

## 5. Tech Stack

- Web: Next.js 14 App Router + Tailwind + shadcn/ui.
- Mobile: React Native + Expo SDK 51.
- API: Node.js 20 + TypeScript + Express + OpenAPI.
- Database: PostgreSQL 16 + Prisma ORM.
- Cache: Redis.
- File storage: AWS S3 + CloudFront.
- Search: Typesense first for simplicity.
- Auth: Firebase Auth.
- Forms: React Hook Form + Zod.
- State: Zustand + TanStack Query.
- Analytics: PostHog.
- Error monitoring: Sentry.
- Logging: Winston + AWS CloudWatch.
- Testing: Vitest + Playwright, Jest + Detox, Supertest.
- CI/CD: GitHub Actions.
- Hosting: Vercel for web/admin; AWS ECS Fargate for API.
- IaC: Terraform.

## 6. External Services — Founder Action Required

Before each integration, Hermes must create docs/setup/<service>.md with signup steps, plan/tier, env vars, credentials to return, then wait for founder confirmation.

Week 1 services:

- LLC formation.
- Domain registration: veloxlane.com plus .co and .io backups.
- AWS account with root MFA and IAM user for Terraform.
- Vercel Pro account linked to GitHub repo.
- GitHub repository/organization.

Later services:

- Firebase Auth, Stripe, Stripe Identity, Twilio, Escrow.com partner, CARFAX partner, Marketcheck, Google Maps, SendGrid, PostHog, Sentry, Apple Developer, Google Play Developer, Expo/EAS, NHTSA VIN API, legal Privacy Policy/ToS, bill-of-sale templates.

## 7. Critical Architecture Rule

VeloxLane must NEVER hold vehicle purchase funds in its own bank accounts, Stripe balance, or any VeloxLane-controlled wallet.

All car sale money routes through Escrow.com, a licensed escrow agent. This eliminates money transmitter license requirements.

Stripe is used only for VeloxLane platform fees:

- Seller listing fee.
- Buyer contact unlock fee.
- Featured listing upgrade.
- CARFAX bundle.
- Buyer protection add-on.

Any flow where VeloxLane receives, holds, or disburses purchase funds must be rejected immediately.

## 8. Core User Flows — Build Order

Phase 1 P0:

1. Monorepo scaffold + design tokens + CI/CD.
2. Auth: email + Google sign-in, phone OTP via Twilio.
3. Seller ID verification via Stripe Identity.
4. VIN entry + CARFAX auto-pull, cache per VIN.
5. Photo upload: 10 slots, basic validation.
6. Listing creation and publication.
7. Public listing browse + search: make, model, year, price, location, mileage.
8. Contact unlock: $6 Stripe payment.
9. In-app messaging masked; no real phone numbers shared.
10. Escrow.com integration: offer → fund → release.
11. Electronic bill of sale for Florida and Texas.
12. Admin dashboard: listings, users, dealer flags.
13. Push notifications on mobile.

Phase 1 P1 if time allows:

- Guided camera overlay with AI QC.
- Fair price range widget.
- Featured listing upgrade.

Phase 2:
VIN barcode scan, full guided camera, inspection booking, warranty/insurance affiliates, all-50-state bill of sale, dealer detection AI, advanced admin, SEO state pages, seller dashboard, saved searches, biometric login, deep links, App Clips.

Phase 3:
Financing affiliate, full multi-state, transport booking, seller analytics, repeat-user trust scores, price drop alerts, certified listings, third-party syndication API, SOC2 Type II prep.

## 9. Code Review Standards — Claude Enforces

Memory leak checklist:

- React: every useEffect with subscriptions, intervals, timeouts, event listeners, or async work must clean up.
- TanStack Query: explicit cache and stale times; proper invalidation.
- WebSockets/SSE: close on unmount or route change.
- Mobile camera/sensors: release resources when leaving screen.
- Image handling: avoid full-resolution in memory unless needed; use thumbnails; release blobs after upload.
- Node API: no unbounded Map/Set/in-memory queue without TTL/eviction; no global state accumulating; Prisma pooled client; Redis shared not per-request.
- Bull queues: complete/fail/remove jobs; no orphaned jobs.
- Streams: close via finally or pipeline().
- Event emitters: removeListener on shutdown; no listeners inside hot paths without removal.
- Long-lived connections: SDK recommended patterns only.

Claude must run memory profile suggestions on PRs touching API hot paths, mobile camera flow, photo upload pipeline, or message thread UI.

Other mandatory checks:

- TypeScript strict mode passes.
- No any without inline justification.
- All inputs validated via Zod at API boundaries.
- No secrets in code.
- Brand tokens used; no hardcoded colors.
- WCAG 2.1 AA web/admin; mobile dynamic type and screen reader labels.
- Unit coverage >= 70% on new business logic.
- API contracts match shared schemas.
- No PII in logs.
- No card/bank data touches VeloxLane code.
- Rate limiting on public endpoints.
- Dependency scanning; no high/critical CVEs merged.

When Claude rejects, Hermes returns the numbered issues verbatim to Codex.

## 10. Database Schema — Starting Tables

users: id, email, phone, id_verified, role, created_at, suspended_at, risk_score
listings: id, user_id, vin, make, model, year, mileage, price, status, carfax_data, escrow_fee_mode, published_at, created_at
photos: id, listing_id, url, angle_slot (1-10), ai_quality_score, approved, created_at
unlocks: id, listing_id, buyer_id, stripe_payment_id, amount, created_at
offers: id, listing_id, buyer_id, seller_id, amount, status, counter_amount, escrow_txn_id, created_at
escrow_transactions: id, offer_id, escrow_com_id, status, amount, funded_at, released_at
messages: id, thread_id, sender_id, body, created_at
bill_of_sale: id, offer_id, state, pdf_url, seller_signed_at, buyer_signed_at
inspections: id, listing_id, provider, booked_at, report_url, status
affiliate_clicks: id, user_id, offer_type, partner, commission, converted, created_at
audit_log: id, actor_id, action, target_type, target_id, metadata, created_at

Required indexes:

- listings(status, published_at)
- listings(state, make, model)
- users(email)
- users(phone)
- unlocks(listing_id, buyer_id)
- offers(listing_id, status)
- messages(thread_id, created_at)

## 11. Fee Defaults

- Seller listing fee: $12, configurable to $15 via admin.
- Buyer contact unlock: $6.
- Featured listing upgrade: $18 / 7 days.
- CARFAX full report bundle: $12 optional buyer add-on.
- Buyer protection add-on: $9.
- Escrow fee: passed through from Escrow.com, default split 50/50, configurable per listing.

## 12. Dealer Detection Data Model

Support from day one:

- Track every listing per user.
- Store EXIF data from uploaded photos.
- Store posting timestamps with high resolution.
- Store seller phone number type.
- users.risk_score 0–100 default 0.

Phase 1 enforces only volume cap >3 active listings = flag.

## 13. MVP Definition of Done

MVP is complete only when all Phase 1 P0 features are shipped/reviewed/merged, FL/TX bill of sale templates are lawyer-reviewed and integrated, ID verification is tested end-to-end on iOS/Android/web, Escrow.com sandbox transaction passes, Stripe webhook signature verification is implemented/tested, Privacy Policy and Terms are published, Sentry and PostHog are live, CI is green, seller and buyer mobile flows are recorded, admin can manage listings/users/flags, and memory leak audits pass.

## 14. First Instructions

1. Confirm receipt and ask clarifying questions before touching filesystem.
2. Scaffold monorepo at ~/projects/veloxlane exactly as defined; initialize git, pnpm + Turborepo, base .gitignore, README.md, .env.example.
3. Instruct Claude CLI to produce docs/design-system.md plus packages/design-tokens tokens.json/tokens.css/tokens.ts.
4. Instruct founder on Week 1 setup: LLC, domain, AWS, Vercel, GitHub. Wait for confirmation.
5. Once Week 1 services are in place, instruct Codex to scaffold apps/api with TypeScript, Prisma, Express + OpenAPI, Sentry, Winston, health check. Claude reviews.
6. Scaffold apps/web with Next.js 14 App Router, Tailwind design tokens, shadcn/ui, one landing route. Claude reviews.
7. Scaffold apps/mobile with Expo SDK 51, Expo Router, design tokens. Claude reviews.
8. Scaffold apps/admin as second Next.js app, role-gated, sharing packages/ui-web.
9. Continue Phase 1 feature-by-feature: design → implement → review → merge.

When a decision affects budget, brand, or legal posture, stop and ask the founder.
