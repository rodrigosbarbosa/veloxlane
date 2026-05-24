# ADR 0001: API Style

## Status

Accepted

## Decision

VeloxLane will use Node.js 20 + TypeScript + Express with an OpenAPI contract for the Phase 1 backend.

## Rationale

Express + OpenAPI is preferred over tRPC for the MVP because VeloxLane has multiple clients (web, mobile, admin), third-party webhook integrations, and a need for explicit API documentation in `docs/api-spec.md`. The OpenAPI contract will be generated/maintained against shared Zod schemas in `packages/types`.

## Consequences

- API endpoints must validate all inputs at boundaries using Zod.
- API documentation must stay in sync with the implementation.
- Clients consume the typed SDK from `packages/sdk` rather than duplicating request logic.
