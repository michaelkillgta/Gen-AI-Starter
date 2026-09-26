import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./ThisWeek.module.css";

export type ThisWeekItem = {
  href: string;
  eyebrow: string;
  text: string;
  tone: "green" | "amber" | "clay";
  icon: "check" | "bolt" | "book";
};

const icons: Record<ThisWeekItem["icon"], ReactNode> = {
  check: <path d="M4.5 8.3l2.3 2.3 4.7-5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  bolt: <path d="M9 1.5L3.5 9H7.5L6.8 14.5 12.5 7H8.5L9 1.5Z" strokeWidth="1.5" strokeLinejoin="round" />,
  book: (
    <path
      d="M8 4.2C6.8 3.3 5 3 2.5 3v9.3c2.5 0 4.3.3 5.5 1.2M8 4.2c1.2-.9 3-1.2 5.5-1.2v9.3c-2.5 0-4.3.3-5.5 1.2M8 4.2v9.3"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

/** Three quiet links under the hero: this week's verdicts, the challenge, the newest deep dive. */
export function ThisWeek({ items }: { items: ThisWeekItem[] }) {
  return (
    <section className={`container ${styles.strip}`} aria-label="This week">
      {items.map((it) => (
        <Link key={it.href} href={it.href} className={`${styles.item} ${styles[it.tone]}`}>
          <span className={styles.icon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              {icons[it.icon]}
            </svg>
          </span>
          <span className={styles.text}>
            <span className={styles.eyebrow}>{it.eyebrow}</span>
            <span className={styles.main}>{it.text}</span>
          </span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.arrow}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      ))}
    </section>
  );
}
