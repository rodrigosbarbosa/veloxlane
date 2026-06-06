# VeloxLane — Agent orientation

VeloxLane is a private-party vehicle marketplace (Florida + Texas in Phase 1). Buyers and sellers connect on web and mobile; admins operate a separate dashboard. Vehicle purchase funds flow through **Escrow.com** — the platform never holds sale proceeds. Stripe handles platform fees only (listing, unlock, featured upgrades).

**Tagline:** Skip the lot. Take the lane.

## Monorepo layout

See `README.md` for the full tree. Hard invariants live in `.cursor/rules/`.

## Commands

From the repo root: `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

When prompting on money, security, auth, RLS, or legal paths, @-mention `@.cursor/rules` at the start.
