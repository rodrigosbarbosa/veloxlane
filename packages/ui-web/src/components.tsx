import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "./utils";

export type StatusTone = "neutral" | "success" | "warning" | "danger";

export type StatusPillProps = HTMLAttributes<HTMLDivElement> & {
  tone?: StatusTone;
  icon?: ReactNode;
};

export function StatusPill({
  tone = "neutral",
  icon,
  className,
  children,
  ...props
}: StatusPillProps) {
  return (
    <div
      className={cx("vl-status-pill", `vl-status-pill-${tone}`, className)}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}

export type SurfacePanelProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "aside" | "section";
};

export function SurfacePanel({
  as: Component = "article",
  className,
  children,
  ...props
}: SurfacePanelProps) {
  return (
    <Component className={cx("vl-surface-panel", className)} {...props}>
      {children}
    </Component>
  );
}

export type MetricTileProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string;
  detail?: string;
};

export function MetricTile({
  label,
  value,
  detail,
  className,
  ...props
}: MetricTileProps) {
  return (
    <div className={cx("vl-metric-tile", className)} {...props}>
      <p className="vl-metric-label">{label}</p>
      <p className="vl-metric-value">{value}</p>
      {detail ? <p className="vl-metric-detail">{detail}</p> : null}
    </div>
  );
}
