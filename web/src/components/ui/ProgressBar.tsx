import { cx } from "./cx";
import styles from "./ProgressBar.module.css";

type Props = {
  value: number;
  max: number;
  label: string;
  /** "light" for tan panels, "dark" for dark panels. */
  tone?: "light" | "dark";
  className?: string;
};

export function ProgressBar({ value, max, label, tone = "light", className }: Props) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cx(styles.track, styles[tone], className)}
    >
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
