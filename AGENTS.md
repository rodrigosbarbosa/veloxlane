# VeloxLane — Agent orientation

Development happens in **Claude Code** — read `CLAUDE.md` at the repo root first; it is the primary orientation and mirrors the invariants in `.cursor/rules/`.

VeloxLane is a private-party vehicle marketplace (Florida + Texas in Phase 1). Buyers and sellers connect on web and mobile; admins operate a separate dashboard. Vehicle purchase funds flow through **Escrow.com** — the platform never holds sale proceeds. Stripe handles platform fees only (listing, unlock, featured upgrades). Vehicle history comes from **AutoCheck** (legacy `carfax`-named identifiers in code refer to this integration — see `docs/decisions/0002-autocheck-vehicle-history.md`).

**Tagline:** Skip the lot. Take the lane.

## Monorepo layout

See `README.md` for the full tree. Hard invariants live in `.cursor/rules/`.

## Commands

From the repo root: `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

When prompting on money, security, auth, RLS, or legal paths, @-mention `@.cursor/rules` at the start.
