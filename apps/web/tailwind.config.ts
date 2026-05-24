import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--vl-surface-canvas)",
        "canvas-light": "var(--vl-surface-canvas-light)",
        card: "var(--vl-surface-card)",
        "card-dark": "var(--vl-surface-card-dark)",
        border: "var(--vl-border-default)",
        "border-dark": "var(--vl-border-on-dark)",
        text: "var(--vl-text-primary)",
        "text-secondary": "var(--vl-text-secondary)",
        "text-muted": "var(--vl-text-muted)",
        "text-inverse": "var(--vl-text-on-dark)",
        amber: "var(--vl-action-primary-bg)",
        teal: "var(--vl-status-verified)",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      borderRadius: {
        sm: "var(--vl-radius-sm)",
        md: "var(--vl-radius-md)",
        pill: "var(--vl-radius-pill)",
      },
      boxShadow: {
        card: "var(--vl-shadow-2)",
      },
      spacing: {
        2: "var(--vl-space-2)",
        3: "var(--vl-space-3)",
        4: "var(--vl-space-4)",
        5: "var(--vl-space-5)",
        7: "var(--vl-space-7)",
        8: "var(--vl-space-8)",
        10: "var(--vl-space-10)",
        11: "var(--vl-space-11)",
      },
      fontSize: {
        xs: "var(--vl-font-size-xs)",
        sm: "var(--vl-font-size-sm)",
        base: "var(--vl-font-size-base)",
        lg: "var(--vl-font-size-lg)",
        xl: "var(--vl-font-size-xl)",
        "2xl": "var(--vl-font-size-2xl)",
        "3xl": "var(--vl-font-size-3xl)",
        "4xl": "var(--vl-font-size-4xl)",
      },
    },
  },
  plugins: [],
};

export default config;
