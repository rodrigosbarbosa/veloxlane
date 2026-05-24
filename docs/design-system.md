# VeloxLane Design System

The fast lane for private car sales. This document is the canonical reference for VeloxLane's visual language across web, mobile, and admin surfaces.

## 1. Brand Principles

- **Direct, never pushy.** Tell users what to do next. No marketing fluff.
- **Warm, never corporate.** Cream surfaces, italic motion, human copy.
- **Confident, never arrogant.** State facts. Skip superlatives.
- **Specific, never vague.** "Funds released in 2 business days" beats "fast payouts."

Every screen should feel like an open lane: clear path forward, no clutter, no dealer noise.

## 2. Color Tokens

| Role      | Name           | Hex       | Use                                             |
| --------- | -------------- | --------- | ----------------------------------------------- |
| Primary   | Velox Midnight | `#0A1628` | Backgrounds, headers, depth, trust              |
| Accent    | Highway Amber  | `#E8A03D` | Logo X, lane stripes, primary CTAs, key signals |
| Canvas    | Lane White     | `#F8F6F1` | Light backgrounds, card surfaces                |
| Structure | Asphalt Gray   | `#3D4550` | Secondary text, dividers, structure             |
| Verified  | Signal Teal    | `#2DBFA6` | Verified, escrow, ID-checked indicators         |

No other hues. Neutral support shades may be derived from Midnight/Asphalt as `/10`, `/20`, `/40`, `/60`, `/80` opacity steps, declared as tokens in `packages/design-tokens`.

### Amber Rule

Amber is a signal, not a surface. Reserve it for: the logo X, dashed lane-stripe dividers, primary CTA fills, verified badges, success confirmations. Never use amber for body copy, headings, or full-bleed backgrounds. If any screen exceeds ~10% amber surface area, it is overused — pull back.

### Token Usage Rule (mandatory)

**All surfaces consume color, spacing, radius, and typography values from `packages/design-tokens`.** No hardcoded hex values, no inline `rgb()`, no Tailwind arbitrary color literals like `bg-[#0A1628]` in application code. Reviews must reject any commit that introduces hardcoded colors outside the tokens package itself. Tokens ship in three forms:

- `tokens.json` — source of truth, consumed by build scripts.
- `tokens.css` — CSS custom properties for web and admin.
- `tokens.ts` — typed constants for mobile (React Native) and any TS consumer.

## 3. Typography

Inter is the only typeface. Web self-hosts via `next/font`; mobile bundles via Expo custom fonts.

| Role            | Weight | Style  | Tracking |
| --------------- | ------ | ------ | -------- |
| Display         | 600    | Italic | -0.03em  |
| Heading (H1–H3) | 600    | Italic | -0.03em  |
| Subhead         | 600    | Roman  | -0.01em  |
| Body            | 400    | Roman  | 0        |
| Caption         | 400    | Roman  | 0        |
| Mono (VIN, IDs) | 500    | Roman  | 0        |

Italic display reads as motion — it is the typographic equivalent of the lane stripe. Never set body copy in italic.

### Type Scale

`12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56`. Defined as `--font-size-{xs,sm,base,md,lg,xl,2xl,3xl,4xl}` in tokens. Line height is `1.2` for display, `1.5` for body.

## 4. Spacing, Radius, Elevation

- **Spacing scale:** `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`. No half-steps.
- **Card radius:** `12px`. This is the VeloxLane card. Buttons use `8px`. Pills and verified badges use `999px`.
- **Border:** `1px solid` Asphalt at 20% opacity for dividers on Lane White; `1px solid` Lane White at 10% opacity on Midnight.
- **Elevation:** one shadow token only — `0 4px 16px rgba(10, 22, 40, 0.08)` on Lane White surfaces. Mobile may substitute platform-native shadow.

## 5. The Lane Stripe Motif

A dashed amber lane stripe is VeloxLane's signature divider. Use it to:

- Separate major sections on landing and listing pages.
- Sit under section headings on marketing surfaces.
- Mark progress in multi-step flows (KYC, listing creation).

Spec: 2px stroke, Highway Amber, dash 12px / gap 8px, horizontal. On dark backgrounds use full amber; on Lane White use amber at 100% — never tint it. Do not use it as decoration when it would compete with a CTA.

## 6. Components

All web components live in `packages/ui-web` and consume tokens directly. Mobile mirrors the same names in `apps/mobile/src/components`.

### Buttons

- **Primary:** Amber fill, Midnight label, 8px radius, 16px vertical / 24px horizontal padding. One per view. Used for the single most important action: Publish listing, Fund escrow, Verify ID.
- **Secondary:** Lane White fill on Midnight, or Midnight outline on Lane White. Same dimensions.
- **Tertiary/Text:** Asphalt label, underline on hover. For destructive actions, label turns Midnight with a Highway Amber underline — never red. (Avoid alarm color outside of system errors.)

### Cards

12px radius, Lane White surface on Midnight pages, single shadow token. Internal padding `16px` mobile, `24px` web. Listing cards lead with the primary photo at 16:9, then italic make+model, then price in roman 600, then a row of teal verified pills.

### Verified Pills

Signal Teal background at 12% opacity, Teal label, 999px radius, leading checkmark icon. Labels: `ID verified`, `Escrow protected`, `VIN matched`, `CARFAX pulled`. Never amber.

### Inputs

Lane White fill, 8px radius, 1px Asphalt/20 border, Midnight label above. Focus ring: 2px Highway Amber. Errors show Asphalt copy + a 2px Midnight underline; system-error red is reserved for true failures only.

### Lane Progress

The dashed lane stripe doubles as a multi-step progress indicator: completed segments solid amber, current segment dashed amber, upcoming segments Asphalt/20. Used in KYC, listing creation, and the offer→fund→release escrow flow.

## 7. Iconography

Use `lucide-react` on web/admin and `lucide-react-native` on mobile. Icons inherit `currentColor`. Stroke width `1.75`. Verified states pair the icon with a Teal pill — never a standalone amber icon for verification.

## 8. Imagery

- Vehicle photos render inside 12px-radius containers with the Lane White card as the frame.
- Hero imagery on marketing surfaces: cars at speed, low-light, amber rim light where possible. Never stock dealership lots.
- The 10-shot guided camera enforces consistent angles; the design system treats those ten angles as the canonical product shot grid.

## 9. Voice and Copy

| Do                                     | Don't                                    |
| -------------------------------------- | ---------------------------------------- |
| "Skip the lot. Take the lane."         | "Welcome to the future of car sales."    |
| "Your lane. Your deal."                | "We empower buyers and sellers."         |
| "$6 to unlock the seller's contact."   | "Affordable pricing for premium access." |
| "Funds release after both sides sign." | "Industry-leading escrow technology."    |

Numbers belong in copy. Say `$12 listing`, `10 photos`, `2 business days`. Never use ALL CAPS except in the wordmark.

## 10. Accessibility

- WCAG 2.1 AA contrast minimum across web and admin. Verify Midnight-on-Lane-White (passes), Amber-on-Midnight (passes for large text only — never use Amber on Midnight for body), Asphalt-on-Lane-White (passes).
- Amber is never the sole signal — pair with icon or label.
- Mobile honors dynamic type and provides screen-reader labels for every interactive element, including the lane progress.
- Focus states are always visible; never `outline: none` without a replacement.

## 11. Review Checklist

Before any UI commit merges, Claude review confirms:

1. No hardcoded hex, rgb, or hsl values outside `packages/design-tokens`.
2. All colors, spacing, radius, and font sizes resolve to a token.
3. Amber surface area on the changed screen is under ~10%.
4. Verified/escrow/ID states use Signal Teal, not amber.
5. Card radius is 12px; button radius is 8px.
6. Inter is loaded via `next/font` or Expo custom font — no system fallback shipped.
7. Copy matches the voice rules in §9.
8. Contrast ratios meet WCAG 2.1 AA.
9. Lane stripe motif, when used, follows the §5 spec.
10. No system-error red outside of true error states.

Anything that fails these checks goes back to Codex with the failing rule numbers cited verbatim.
