# VeloxLane

Private-party vehicle marketplace for verified individual buyers and sellers.

**Tagline:** Skip the lot. Take the lane.

## Invariants

- Vehicle purchase funds route through **Escrow.com only** — VeloxLane never holds sale proceeds.
- **Stripe** handles platform fees only (listing $12, unlock $6, featured upgrades).
- Phase 1 scope: **Florida + Texas** only.
- See `.cursor/rules/` for non-negotiable agent and developer guardrails.

## Monorepo layout

```text
apps/web       Next.js 14 — public marketplace (shadcn/ui + Tailwind)
apps/mobile    Expo SDK 51 — iOS/Android (NativeWind)
apps/admin     Next.js 14 — staff admin console (separate deploy)
packages/ui    Shared component library
packages/db    Supabase types + query helpers
packages/schemas  Shared Zod schemas
packages/config   ESLint, Prettier, TS configs
packages/brand    Design tokens, logo assets, copy
supabase/      Migrations, seed, Edge Functions (webhooks, proxies)
```

Backend logic lives in **Supabase Edge Functions** (`supabase/functions/`), not a standalone Node API.

## Prerequisites

- Node.js 20 LTS
- pnpm 9.x
- Git 2.40+

## Setup

```bash
pnpm install
cp .env.example .env.local
# Fill Supabase, Stripe (test keys), and other §06 vars from the dev guide.
```

## Commands

| Task           | Command                               |
| -------------- | ------------------------------------- |
| Dev (all apps) | `pnpm dev`                            |
| Dev — web      | `pnpm --filter @veloxlane/web dev`    |
| Dev — admin    | `pnpm --filter @veloxlane/admin dev`  |
| Dev — mobile   | `pnpm --filter @veloxlane/mobile dev` |
| Lint           | `pnpm lint`                           |
| Typecheck      | `pnpm typecheck`                      |
| Test           | `pnpm test`                           |
| Build          | `pnpm build`                          |
| Format         | `pnpm format`                         |

## CI

GitHub Actions runs `lint`, `typecheck`, `test`, and `build` on every pull request to `main`.

## Agent orientation

Development happens in Claude Code. See `CLAUDE.md` (primary), `AGENTS.md`, and `.cursor/rules/` before working on money, escrow, auth, RLS, or plate privacy. Vehicle history is provided by AutoCheck (`autocheck`-named identifiers; a few deprecated `carfax` leftovers remain during migration — see `docs/decisions/0002-autocheck-vehicle-history.md`).
