"use client";

import Link from "next/link";

import { Button, ProgressBar } from "@/components/ui";
import { setDone, useProgress } from "@/features/progress/progress";
import styles from "./ProgressWidgets.module.css";

/** "Your progress · 3 of 9 done" with a bar. */
export function TrackProgress({ slugs, compact = false }: { slugs: string[]; compact?: boolean }) {
  const done = useProgress();
  const count = slugs.filter((s) => done[s]).length;
  return (
    <div className={compact ? `${styles.progress} ${styles.compact}` : styles.progress}>
      <div className={styles.progressHead}>
        <span className={styles.progressLabel}>Your progress</span>
        <span className={styles.progressCount}>
          {count} of {slugs.length} done
        </span>
      </div>
      <ProgressBar value={count} max={slugs.length} label="Deep dives finished in this track" />
      {!compact && <span className={styles.progressNote}>Saved in this browser.</span>}
    </div>
  );
}

/** "Start the first deep dive", or "Continue: <next unfinished>" once some are done. */
export function TrackCta({ dives }: { dives: { slug: string; title: string; href: string }[] }) {
  const done = useProgress();
  const started = dives.some((d) => done[d.slug]);
  const next = dives.find((d) => !done[d.slug]);
  if (!dives.length) return null;
  if (!started) return <Button href={dives[0].href} size="lg" block>Start the first deep dive</Button>;
  if (!next) return <Button href={dives[0].href} size="lg" variant="outline" block>Track finished. Read again</Button>;
  return (
    <Button href={next.href} size="lg" block>
      Continue: {next.title}
    </Button>
  );
}

/** The right-hand label on a dive row: Start here / Read / Done. */
export function DiveRowStatus({ slug, first }: { slug: string; first: boolean }) {
  const done = useProgress();
  if (done[slug]) {
    return (
      <span className={styles.doneTag}>
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5.2l2 2L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Done
      </span>
    );
  }
  if (first && !Object.keys(done).length) return <span className={styles.startTag}>Start here</span>;
  return <span className={styles.readTag}>Read</span>;
}

/** The circle next to each dive in the deep dive sidebar. */
export function DiveDot({ slug, n, current }: { slug: string; n: number; current: boolean }) {
  const done = useProgress();
  if (done[slug]) {
    return (
      <span className={`${styles.dot} ${styles.dotDone}`} aria-label="done">
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5.2l2 2L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return <span className={current ? `${styles.dot} ${styles.dotCurrent}` : styles.dot}>{current ? "" : n}</span>;
}

/** "Mark as done" at the end of a deep dive. */
export function MarkDone({ slug, nextHref }: { slug: string; nextHref?: string }) {
  const done = useProgress();
  const isDone = !!done[slug];
  return (
    <div className={styles.markRow}>
      <Button variant={isDone ? "dark" : "outline"} size="lg" aria-pressed={isDone} onClick={() => setDone(slug, !isDone)}>
        {isDone ? "Done ✓ (undo)" : "Mark as done"}
      </Button>
      {isDone && nextHref && (
        <Link href={nextHref} className={styles.markNext}>
          On to the next one
        </Link>
      )}
    </div>
  );
}
