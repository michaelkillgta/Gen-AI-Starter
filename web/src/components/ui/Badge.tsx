import type { CSSProperties, ReactNode } from "react";

import { cx } from "./cx";
import styles from "./Badge.module.css";

export type BadgeTone =
  | "tool" | "library" | "package" | "mcp"
  | "use" | "wait" | "skip"
  | "neutral" | "dark" | "accent";

type Props = {
  tone?: BadgeTone;
  size?: "sm" | "md" | "lg";
  /** Custom colours, e.g. blog categories that come from the database. */
  colors?: { bg: string; fg: string };
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = "neutral", size = "sm", colors, children, className }: Props) {
  const style: CSSProperties | undefined = colors ? { background: colors.bg, color: colors.fg } : undefined;
  return (
    <span className={cx(styles.badge, styles[tone], styles[size], className)} style={style}>
      {children}
    </span>
  );
}

export type ToolStatus = "using" | "notes" | "tested";

/** The coloured dot for "I use this" / "In my notes" / "Tested". */
export function StatusDot({ status, label }: { status: ToolStatus; label: string }) {
  return <span className={cx(styles.dot, styles[`dot-${status}`])} title={label} role="img" aria-label={label} />;
}
