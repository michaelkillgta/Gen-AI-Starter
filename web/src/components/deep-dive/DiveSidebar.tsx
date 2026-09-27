import Link from "next/link";

import { DiveDot, TrackProgress } from "@/components/tracks/ProgressWidgets";
import type { TrackOutline } from "@/lib/api-types/TrackOutline";
import { links } from "@/lib/links";
import styles from "./DiveSidebar.module.css";

/**
 * The track's list of deep dives. Desktop: a sidebar. Phone and tablet: folded
 * into a "Deep dive N of M" button (a native <details>, so it works without JS).
 */
export function DiveSidebar({ track, current }: { track: TrackOutline; current: string }) {
  const idx = track.dives.findIndex((d) => d.slug === current);
  const list = (
    <ol className={styles.list}>
      {track.dives.map((d, i) => {
        const on = d.slug === current;
        return (
          <li key={d.slug}>
            <Link
              href={links.dive(track.slug, d.slug)}
              aria-current={on ? "page" : undefined}
              className={on ? `${styles.item} ${styles.itemOn}` : styles.item}
            >
              <DiveDot slug={d.slug} n={i + 1} current={on} />
              {d.title}
            </Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <details className={styles.fold}>
        <summary className={styles.summary}>
          <span>
            <span className={styles.summaryTrack}>
              {track.name} · Stage {track.stage_position}
            </span>
            <span className={styles.summaryPos}>
              Deep dive {idx + 1} of {track.dives.length}
            </span>
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.chev}>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className={styles.foldBody}>
          <TrackProgress slugs={track.dives.map((d) => d.slug)} compact />
          {list}
        </div>
      </details>

      <aside className={styles.side} aria-label="Deep dives in this track">
        <Link href={`${links.track(track.slug)}#stage-${track.stage_slug}`} className={styles.crumb}>
          ← Back to the {track.name}
        </Link>
        <span className={styles.trackName}>{track.stage_title}</span>
        <span className={styles.stageLine}>
          {track.name} · Stage {track.stage_position}
        </span>
        <div className={styles.progress}>
          <TrackProgress slugs={track.dives.map((d) => d.slug)} compact />
        </div>
        {list}
      </aside>
    </>
  );
}
