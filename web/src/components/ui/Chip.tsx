import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "./cx";
import styles from "./Chip.module.css";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  pressed: boolean;
  /** "accent" fills the active chip with marigold (the "Start here" chips). */
  tone?: "ink" | "accent";
  count?: number | string;
  children: ReactNode;
};

/** A pill-shaped toggle used for filters. */
export function Chip({ pressed, tone = "ink", count, children, className, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      {...rest}
      className={cx(styles.chip, pressed && styles[`on-${tone}`], className)}
    >
      {children}
      {count !== undefined && count !== "" && <span className={styles.count}>{count}</span>}
    </button>
  );
}

/** A row of chips: wraps on desktop, scrolls sideways on phone and tablet. */
export function ChipRow({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cx(styles.row, className)}>
      {children}
    </div>
  );
}
