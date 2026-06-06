# VeloxLane — Agent orientation

VeloxLane is a private-party vehicle marketplace (Florida + Texas in Phase 1). Buyers and sellers connect on web and mobile; admins operate a separate dashboard. Vehicle purchase funds flow through **Escrow.com** — the platform never holds sale proceeds. Stripe handles platform fees only (listing, unlock, featured upgrades).

**Tagline:** Skip the lot. Take the lane.

## Monorepo layout

```
veloxlane/
??? apps/
?   ??? web/       # Next.js — public site, buyer/seller flows
?   ??? mobile/    # Expo / React Native
?   ??? admin/     # Next.js admin dashboard (separate deploy)
?   ??? api/       # Node.js + Express backend (OpenAPI)
??? packages/
?   ??? ui-web/    # Shared web components
?   ??? design-tokens/
?   ??? types/
?   ??? sdk/
??? brand/         # Logo SVGs, assets
??? docs/
??? infra/
```

Supabase migrations and Edge Functions live under `supabase/` once added (see dev guide).

## Prerequisites

- Node.js 20 LTS
- pnpm 9.x
- Git 2.40+

## Commands

From the repo root:

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Dev (all apps) | `pnpm dev` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Unit tests | `pnpm test` |
| Build | `pnpm build` |

Filter to a single app, e.g. `pnpm --filter @veloxlane/web dev`.

## Hard invariants

Non-negotiable rules live in **`.cursor/rules/`** — read them before any money, security, auth, RLS, or legal work:

- `00-veloxlane-core.mdc` — always applied (money, secrets, RLS, plate privacy, dealers, scope)
- `10-brand.mdc` — UI/brand tokens
- `20-data-and-money.mdc` — DB, webhooks, payments guardrails

When prompting on sensitive paths, @-mention `@.cursor/rules` at the start so invariants survive context compaction.

## Tracks

- **Build** — implementation (Composer Agent mode)
- **Plan + Review** — required before merge for money, escrow, webhooks, auth, RLS, and bill of sale changes

See `docs/` and the VeloxLane dev guide for the full prompt catalog and checklists.
