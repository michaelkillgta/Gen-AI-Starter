"use client";

import { cx } from "./cx";
import styles from "./Segmented.module.css";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Two or three options in a tan tray, e.g. "My picks first / A to Z" or "Cards / List". */
export function Segmented<T extends string>({ label, options, value, onChange, className }: Props<T>) {
  return (
    <div role="group" aria-label={label} className={cx(styles.tray, className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx(styles.option, o.value === value && styles.on)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
