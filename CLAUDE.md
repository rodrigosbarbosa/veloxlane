# VeloxLane — Claude Code guide

VeloxLane is a private-party vehicle marketplace (web + mobile + admin). Verified individual sellers meet verified buyers; **dealers are blocked**. Vehicle purchase funds flow through **Escrow.com** — the platform never holds sale proceeds. Stripe handles platform fees only.

**Development happens in Claude Code.** This file is the primary agent orientation; `.cursor/rules/*.mdc` remain the canonical invariant text and are mirrored below.

## Non-negotiable invariants

- **MONEY:** VeloxLane NEVER holds vehicle purchase funds. All car-sale money routes through Escrow.com. Stripe handles ONLY platform fees (listing $12, unlock $6, featured upgrades). Never build a flow that takes custody of sale proceeds — it would trigger money-transmitter licensing.
- **SECRETS:** Only vars prefixed `NEXT_PUBLIC_` / `EXPO_PUBLIC_` may reach client code. Server-only secrets live in API routes + Supabase Edge Functions.
- **DATABASE:** Row Level Security is ON for every table, no exceptions. `unlocks`, `offers`, `escrow_transactions` are insert-via-webhook-only — never client-writable.
- **PLATE PRIVACY:** Real license plates are NEVER served to buyers. Public reads return `processed_path` (branded plate cover) only. If plate detection misses, fail safe to a blur.
- **NO DEALERS:** Never add a feature that eases bulk/dealer listing or weakens dealer detection (risk score, registry lookup, volume caps).
- **SCOPE:** Phase 1 launches Florida + Texas ONLY.
- **TS:** TypeScript strict mode. No `any` in app code.
- **REVIEW:** Any change to money, escrow, webhooks, auth, RLS, or the bill of sale must ship with tests and get a review pass before merge.

## Vehicle history provider: AutoCheck

The vehicle-history provider is **AutoCheck** (Experian Automotive), not CARFAX. The project originally chose CARFAX, and internal identifiers still carry that name: `CARFAX_*` env vars, the `carfax_data` jsonb column, the `carfax-proxy` Edge Function, and `carfax`-named symbols in `packages/vin`. Treat all of them as the AutoCheck integration. Do NOT introduce new `carfax`-named identifiers; new code uses `autocheck` / vehicle-history naming. The full identifier rename (env vars, function, column migration) is a tracked follow-up.

User-facing copy must say **AutoCheck** — never CARFAX.

## Monorepo layout

```text
apps/web       Next.js 14 — public marketplace (shadcn/ui + Tailwind)
apps/mobile    Expo SDK 51 — iOS/Android (NativeWind)
apps/admin     Next.js 14 — staff admin console (separate Vercel deploy)
packages/*     ui, db, schemas, config, brand, auth, payments, photos, vin
supabase/      Migrations, seed, Edge Functions (webhooks, proxies)
```

Backend logic lives in **Supabase Edge Functions** (`supabase/functions/`), not a standalone Node API.

## Commands

From the repo root (pnpm 9 + turborepo):

| Task           | Command                            |
| -------------- | ---------------------------------- |
| Dev (all apps) | `pnpm dev`                         |
| Dev — web      | `pnpm --filter @veloxlane/web dev` |
| Lint           | `pnpm lint`                        |
| Typecheck      | `pnpm typecheck`                   |
| Test           | `pnpm test`                        |
| Build          | `pnpm build`                       |

CI (GitHub Actions) runs lint, typecheck, test, and build on every PR to `main`. Husky + lint-staged run Prettier on commit.

## Brand (for UI work)

- Colors: Midnight `#0A1628` (canvas/trust), Amber `#E8A03D` (accents ONLY — CTAs, the X, lane stripes; never body text or full backgrounds), Cream `#F8F6F1`, Asphalt `#3D4550`, Signal Teal `#2DBFA6` (verified/protected/escrow indicators).
- Type: Inter 600 italic (-0.03em) display; Inter 400 body.
- Voice: direct, warm, confident, specific. Tagline: "Skip the lot. Take the lane."
- Errors are plain-language and recoverable, never raw codes.

## Gotchas

- The docs directory is tracked in git as lowercase `docs/` but appears as `Docs/` on macOS (case-insensitive FS). Always reference it as `docs/` in code, CI, and imports so case-sensitive systems (Linux CI, Vercel) resolve it.
- `Docs/HERMES_BRIEF.md` is a superseded founder brief (old Hermes/Codex workflow, Express/Prisma stack). Do not follow it — the repo and this file are the source of truth.
- Data/payments guardrails: webhooks are idempotent and signature-verified; never trust client-supplied amounts — re-derive server-side; validate all input with the shared Zod schemas in `packages/schemas`; write `audit_log` entries for state changes on listings, offers, escrow_transactions, and bans.
