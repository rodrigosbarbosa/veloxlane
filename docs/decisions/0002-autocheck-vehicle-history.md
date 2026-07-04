# ADR 0002: AutoCheck for vehicle history; Claude Code for development

## Status

Accepted (2026-07-04)

## Decision

1. VeloxLane's vehicle-history provider is **AutoCheck** (Experian Automotive), replacing the original CARFAX choice.
2. Development is done in **Claude Code**; the root `CLAUDE.md` is the primary agent orientation. The earlier Hermes/Codex orchestration described in `docs/HERMES_BRIEF.md` is superseded.

## Rationale

- AutoCheck replaces CARFAX as the partner for VIN history pulls. All user-facing copy, badges, and marketing must say AutoCheck.
- Claude Code is the single development environment; `.cursor/rules/*.mdc` invariants remain canonical and are mirrored in `CLAUDE.md`.

## Consequences

- Internal identifiers created under the CARFAX assumption remain temporarily: `CARFAX_*` env vars, the `listings.carfax_data` jsonb column, the `carfax-proxy` Edge Function, and `carfax`-named symbols in `packages/vin`. They now point at the AutoCheck integration.
- A follow-up rename is required: new `AUTOCHECK_*` env vars, an additive column migration (`carfax_data` → `vehicle_history_data` or `autocheck_data`), a renamed Edge Function, and updated symbols — coordinated with deployed function env config so nothing breaks mid-rename.
- No new `carfax`-named identifiers may be introduced.
- The API surface of the history report (fields, caching per VIN) must be re-validated against AutoCheck's partner API; report pricing and the buyer "history report bundle" add-on price should be re-quoted with Experian.
