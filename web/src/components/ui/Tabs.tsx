"use client";

import { useRef, type KeyboardEvent } from "react";

import { cx } from "./cx";
import styles from "./Tabs.module.css";

export type TabItem<T extends string> = { value: T; label: string; sub?: string };

type Props<T extends string> = {
  label: string;
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** id prefix; each tab controls the panel `${idPrefix}-panel`. */
  idPrefix: string;
};

/**
 * Large card-style tabs (the track picker). Arrow keys move between tabs.
 * Phone: tabs scroll sideways. Tablet and up: equal-width grid.
 */
export function Tabs<T extends string>({ label, items, value, onChange, idPrefix }: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent, index: number) {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (index + dir + items.length) % items.length;
    refs.current[next]?.focus();
    onChange(items[next].value);
  }

  return (
    <div role="tablist" aria-label={label} className={styles.list} style={{ ["--tab-count" as string]: items.length }}>
      {items.map((t, i) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${idPrefix}-tab-${t.value}`}
            role="tab"
            type="button"
            aria-selected={on}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx(styles.tab, on && styles.on)}
          >
            <span className={styles.tabLabel}>{t.label}</span>
            {t.sub && <span className={styles.tabSub}>{t.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}
