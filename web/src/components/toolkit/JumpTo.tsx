"use client";

import styles from "./ToolDirectory.module.css";

/** "Jump to" links for the Area sections. Scrolls to whichever copy (table or list) is on screen. */
export function JumpTo({ sections }: { sections: { id: string; title: string }[] }) {
  if (sections.length < 2) return null;
  return (
    <nav aria-label="Jump to an area" className={styles.jump}>
      <span className={styles.jumpLabel}>Jump to</span>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={styles.jumpLink}
          onClick={(e) => {
            e.preventDefault();
            const target = Array.from(document.querySelectorAll<HTMLElement>(`[data-section="${s.id}"]`)).find(
              (el) => el.offsetParent !== null,
            );
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
            target?.focus?.({ preventScroll: true });
          }}
        >
          {s.title}
        </a>
      ))}
    </nav>
  );
}
