# VeloxLane

VeloxLane is a private-party vehicle marketplace for verified individual buyers and sellers.

Tagline: The lane built for private deals.

## Operating rules

- Hermes orchestrates only; Codex CLI implements application code.
- Claude CLI produces UX/UI design and reviews every Codex commit before progress is accepted.
- VeloxLane never holds vehicle purchase funds. All car-sale funds route through Escrow.com only.
- Stripe is used only for VeloxLane platform fees.
- Launch scope is Florida and Texas first.

## Monorepo layout

```text
apps/web       Next.js 14 public marketplace
apps/mobile    Expo SDK 51 iOS + Android app
apps/admin     Next.js 14 staff admin console
apps/api       Node.js 20 + TypeScript + Express + OpenAPI backend
packages/design-tokens
packages/ui-web
packages/types
packages/sdk
brand/logo
brand/assets
docs
infra
```

## Local development

Install dependencies:

```bash
pnpm install
```

Run all apps in development mode once scaffolded:

```bash
pnpm dev
```

## Current status

Initial scaffold created. Production application code will be implemented by Codex CLI in small reviewed tasks.
