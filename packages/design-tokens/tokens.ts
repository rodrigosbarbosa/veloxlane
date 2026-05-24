/**
 * VeloxLane Design Tokens — TypeScript source of truth.
 *
 * Imported by web, admin, and mobile. All shared shape, color, motion, and
 * typography decisions live here. Do not hardcode brand hex values in apps.
 *
 * Mirrors packages/design-tokens/tokens.json and tokens.css. Keep all three
 * in sync when editing.
 */

/* ---------------------------------------------------------------------------
 * Brand colors (canonical hex — do not change without brand approval)
 * ------------------------------------------------------------------------- */
export const brandColors = {
  midnight: "#0A1628",
  amber: "#E8A03D",
  laneWhite: "#F8F6F1",
  asphalt: "#3D4550",
  teal: "#2DBFA6",
} as const;

/* ---------------------------------------------------------------------------
 * Color scales — derived neutrals + brand step scales
 * ------------------------------------------------------------------------- */
export const asphaltScale = {
  50: "#F1F2F4",
  100: "#E2E4E8",
  200: "#C5C9D1",
  300: "#A7AEB9",
  400: "#7A8290",
  500: "#5C6573",
  600: "#3D4550",
  700: "#2F353F",
  800: "#21262E",
  900: "#14181E",
} as const;

export const midnightScale = {
  base: "#0A1628",
  elevated: "#0F1D32",
  raised: "#152543",
  sunken: "#06101F",
} as const;

export const amberScale = {
  soft: "#F5C98A",
  base: "#E8A03D",
  hover: "#F0AC51",
  pressed: "#C9842A",
} as const;

export const tealScale = {
  soft: "#7FD8C6",
  base: "#2DBFA6",
  hover: "#3FCEB4",
  pressed: "#21A18B",
} as const;

export const alphaColors = {
  white: {
    4: "rgba(248, 246, 241, 0.04)",
    8: "rgba(248, 246, 241, 0.08)",
    12: "rgba(248, 246, 241, 0.12)",
    24: "rgba(248, 246, 241, 0.24)",
    48: "rgba(248, 246, 241, 0.48)",
    72: "rgba(248, 246, 241, 0.72)",
  },
  black: {
    4: "rgba(10, 22, 40, 0.04)",
    8: "rgba(10, 22, 40, 0.08)",
    12: "rgba(10, 22, 40, 0.12)",
    24: "rgba(10, 22, 40, 0.24)",
    48: "rgba(10, 22, 40, 0.48)",
    72: "rgba(10, 22, 40, 0.72)",
  },
} as const;

/* ---------------------------------------------------------------------------
 * Semantic color roles — what components should consume
 * ------------------------------------------------------------------------- */
export const colors = {
  surface: {
    canvas: midnightScale.base,
    canvasLight: brandColors.laneWhite,
    card: brandColors.laneWhite,
    cardDark: midnightScale.elevated,
    muted: asphaltScale[50],
    inverse: midnightScale.base,
    scrim: alphaColors.black[48],
  },
  text: {
    primary: midnightScale.base,
    secondary: asphaltScale[600],
    muted: asphaltScale[400],
    onDark: brandColors.laneWhite,
    onDarkMuted: asphaltScale[300],
    onAmber: midnightScale.base,
    onTeal: midnightScale.base,
    link: amberScale.base,
    inverse: brandColors.laneWhite,
  },
  border: {
    subtle: alphaColors.black[8],
    default: asphaltScale[200],
    strong: asphaltScale[600],
    onDark: alphaColors.white[12],
    focus: amberScale.base,
  },
  action: {
    primaryBg: amberScale.base,
    primaryHover: amberScale.hover,
    primaryPressed: amberScale.pressed,
    primaryFg: midnightScale.base,
    secondaryBg: brandColors.laneWhite,
    secondaryFg: midnightScale.base,
    ghostFg: brandColors.laneWhite,
    disabledBg: asphaltScale[200],
    disabledFg: asphaltScale[500],
  },
  status: {
    verified: tealScale.base,
    verifiedBg: "rgba(45, 191, 166, 0.12)",
    warning: amberScale.base,
    warningBg: "rgba(232, 160, 61, 0.12)",
    // No red hue per brand 'only colors' rule. Severity is carried by dark
    // neutral weight + a warning icon + explicit copy ('Remove permanently',
    // 'Cannot complete'). Pair with brand.amber for destructive confirm CTAs.
    danger: asphaltScale[800],
    dangerBg: asphaltScale[50],
    info: tealScale.base,
  },
} as const;

/* ---------------------------------------------------------------------------
 * Spacing scale (4px base, with 2px micro-step)
 * ------------------------------------------------------------------------- */
export const spacing = {
  0: 0,
  px: 1,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 32,
  9: 40,
  10: 48,
  11: 64,
  12: 80,
  13: 96,
  14: 128,
} as const;

/* ---------------------------------------------------------------------------
 * Radius — card uses md (12px) per brand spec
 * ------------------------------------------------------------------------- */
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
} as const;

export const cardRadius = radius.md;

/* ---------------------------------------------------------------------------
 * Typography
 * ------------------------------------------------------------------------- */
export const fontFamily = {
  display:
    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  body: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const letterSpacing = {
  tight: "-0.03em",
  normal: "0em",
  wide: "0.04em",
  wider: "0.08em",
} as const;

export const lineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.65,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 56,
  "5xl": 72,
} as const;

export type TypeStyle = {
  fontFamily: string;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  fontSize: number;
  lineHeight: number;
  letterSpacing: string;
  textTransform?: "uppercase" | "none";
};

export const typography: Record<
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "bodyLg"
  | "body"
  | "bodySm"
  | "label"
  | "caption"
  | "overline"
  | "mono",
  TypeStyle
> = {
  display: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontStyle: "italic",
    fontSize: fontSize["5xl"],
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h1: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontStyle: "italic",
    fontSize: fontSize["4xl"],
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontStyle: "italic",
    fontSize: fontSize["3xl"],
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontStyle: "italic",
    fontSize: fontSize["2xl"],
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  h4: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontStyle: "italic",
    fontSize: fontSize.xl,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  h5: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
    fontStyle: "italic",
    fontSize: fontSize.lg,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  bodyLg: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.regular,
    fontStyle: "normal",
    fontSize: fontSize.md,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.regular,
    fontStyle: "normal",
    fontSize: fontSize.base,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodySm: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.regular,
    fontStyle: "normal",
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontStyle: "normal",
    fontSize: fontSize.sm,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.regular,
    fontStyle: "normal",
    fontSize: fontSize.xs,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.wide,
  },
  overline: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontStyle: "normal",
    fontSize: fontSize.xs,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.wider,
    textTransform: "uppercase",
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontWeight: fontWeight.regular,
    fontStyle: "normal",
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
};

/* ---------------------------------------------------------------------------
 * Elevation (web shadows). Mobile maps these via react-native shadow props
 * in a platform shim — do not hand-roll RN shadows in screens.
 * ------------------------------------------------------------------------- */
export const elevation = {
  0: "none",
  1: "0 1px 2px 0 rgba(10, 22, 40, 0.06), 0 1px 1px 0 rgba(10, 22, 40, 0.04)",
  2: "0 2px 6px -1px rgba(10, 22, 40, 0.10), 0 1px 3px 0 rgba(10, 22, 40, 0.06)",
  3: "0 8px 24px -4px rgba(10, 22, 40, 0.18), 0 4px 8px -2px rgba(10, 22, 40, 0.08)",
  4: "0 16px 48px -8px rgba(10, 22, 40, 0.28), 0 6px 16px -4px rgba(10, 22, 40, 0.12)",
  amberGlow: "0 0 0 4px rgba(232, 160, 61, 0.24)",
  tealGlow: "0 0 0 4px rgba(45, 191, 166, 0.20)",
  insetDark: "inset 0 1px 0 0 rgba(248, 246, 241, 0.06)",
} as const;

/* ---------------------------------------------------------------------------
 * z-index — keep all layered UI on this scale; never use ad-hoc values.
 * ------------------------------------------------------------------------- */
export const zIndex = {
  hide: -1,
  base: 0,
  raised: 10,
  docked: 100,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1900,
} as const;

/* ---------------------------------------------------------------------------
 * Motion
 * ------------------------------------------------------------------------- */
export const duration = {
  instant: 0,
  fast: 120,
  base: 200,
  slow: 320,
  slower: 480,
} as const;

export const easing = {
  standard: "cubic-bezier(0.2, 0.0, 0.0, 1.0)",
  enter: "cubic-bezier(0.0, 0.0, 0.2, 1.0)",
  exit: "cubic-bezier(0.4, 0.0, 1.0, 1.0)",
  emphasized: "cubic-bezier(0.2, 0.0, 0.0, 1.2)",
  linear: "linear",
} as const;

export const transition = {
  ui: `all ${duration.base}ms ${easing.standard}`,
  hover: `background-color ${duration.fast}ms ${easing.standard}, color ${duration.fast}ms ${easing.standard}, border-color ${duration.fast}ms ${easing.standard}`,
  elevate: `box-shadow ${duration.base}ms ${easing.standard}, transform ${duration.base}ms ${easing.standard}`,
} as const;

/* ---------------------------------------------------------------------------
 * Brand motifs
 * ------------------------------------------------------------------------- */
export const laneStripe = {
  color: amberScale.base,
  thickness: 2, // px
  dashLength: 12, // px
  gapLength: 8, // px
  skewDeg: -12,
  cssImage:
    "repeating-linear-gradient(90deg, #E8A03D 0 12px, transparent 12px 20px)",
  cssImageDiag:
    "repeating-linear-gradient(-12deg, #E8A03D 0 12px, transparent 12px 20px)",
} as const;

export const logoMotif = {
  wordmarkSkewDeg: -12,
  xColor: amberScale.base,
} as const;

export const focusRing = {
  width: 2,
  offset: 2,
  color: amberScale.base,
} as const;

/* ---------------------------------------------------------------------------
 * Breakpoints
 * ------------------------------------------------------------------------- */
export const breakpoint = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/* ---------------------------------------------------------------------------
 * Aggregated default export — useful for Tailwind theme + RN theme bridges.
 * ------------------------------------------------------------------------- */
export const tokens = {
  brandColors,
  asphaltScale,
  midnightScale,
  amberScale,
  tealScale,
  alphaColors,
  colors,
  spacing,
  radius,
  cardRadius,
  fontFamily,
  fontWeight,
  letterSpacing,
  lineHeight,
  fontSize,
  typography,
  elevation,
  zIndex,
  duration,
  easing,
  transition,
  laneStripe,
  logoMotif,
  focusRing,
  breakpoint,
} as const;

export type Tokens = typeof tokens;
export default tokens;
