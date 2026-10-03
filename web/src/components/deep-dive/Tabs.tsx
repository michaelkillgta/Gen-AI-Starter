"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import styles from "./BlockRenderer.module.css";

/**
 * A row of example chips with one panel shown at a time (the first by
 * default). Arrow keys, Home and End move between chips, as in a tab list.
 */
export function Tabs({ label, titles, panels }: { label: string | null; titles: string[]; panels: ReactNode[] }) {
  const [open, setOpen] = useState(0);
  const id = useId();
  const chips = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (to: number) => {
    const n = (to + titles.length) % titles.length;
    setOpen(n);
    chips.current[n]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: open + 1, ArrowDown: open + 1, ArrowLeft: open - 1, ArrowUp: open - 1, Home: 0, End: titles.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      move(keys[e.key]);
    }
  };

  return (
    <div className={styles.tabs}>
      {label && <span className={styles.tabsLabel}>{label}</span>}
      <div role="tablist" aria-label={label ?? "Examples"} className={styles.tabList} onKeyDown={onKey}>
        {titles.map((t, n) => (
          <button
            key={t}
            ref={(el) => {
              chips.current[n] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${n}`}
            aria-selected={n === open}
            aria-controls={`${id}-panel-${n}`}
            tabIndex={n === open ? 0 : -1}
            className={n === open ? `${styles.tabChip} ${styles.tabChipOn}` : styles.tabChip}
            onClick={() => setOpen(n)}
          >
            {t}
          </button>
        ))}
      </div>
      {panels.map((p, n) => (
        <div
          key={n}
          role="tabpanel"
          id={`${id}-panel-${n}`}
          aria-labelledby={`${id}-tab-${n}`}
          hidden={n !== open}
          className={styles.tabPanel}
        >
          {p}
        </div>
      ))}
    </div>
  );
}
