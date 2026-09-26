import Link from "next/link";

import type { TrackDetail } from "@/lib/api-types/TrackDetail";
import type { TrackSummary } from "@/lib/api-types/TrackSummary";
import { links } from "@/lib/links";
import { DiveRowStatus, TrackCta, TrackProgress } from "./ProgressWidgets";
import styles from "./TrackView.module.css";

/** Track switcher + the chosen track: summary panel and the ordered list of deep dives. */
export function TrackView({ tracks, track }: { tracks: TrackSummary[]; track: TrackDetail }) {
  const diveLinks = track.dives.map((d) => ({ slug: d.slug, title: d.title, href: links.dive(track.slug, d.slug) }));

  return (
    <>
      <nav className={`container ${styles.tabsWrap}`} aria-label="Tracks">
        <ul className={styles.tabs}>
          {tracks.map((t) => {
            const on = t.slug === track.slug;
            return (
              <li key={t.slug}>
                <Link
                  href={links.track(t.slug)}
                  aria-current={on ? "page" : undefined}
                  className={on ? `${styles.tab} ${styles.tabOn}` : styles.tab}
                  scroll={false}
                >
                  <span className={styles.tabLabel}>{t.name}</span>
                  <span className={styles.tabSub}>{t.dive_count} deep dives</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className={`container ${styles.track}`} aria-labelledby="track-name">
        <aside className={styles.summary}>
          <span className={styles.who}>{track.who}</span>
          <h2 id="track-name" className={styles.name}>
            {track.name}
          </h2>
          <p className={styles.blurb}>{track.blurb}</p>
          <div className={styles.startIf}>{track.start_if}</div>
          <TrackProgress slugs={track.dives.map((d) => d.slug)} />
          <TrackCta dives={diveLinks} />
        </aside>

        <ol className={styles.dives}>
          {track.dives.map((d, i) => (
            <li key={d.slug}>
              <Link href={links.dive(track.slug, d.slug)} className={styles.dive}>
                <span className={styles.num} aria-hidden="true">
                  {String(d.position).padStart(2, "0")}
                </span>
                <span className={styles.diveText}>
                  <span className={styles.diveTitle}>{d.title}</span>
                  <span className={styles.tldr}>
                    <span className={styles.tldrLabel}>TL;DR </span>
                    {d.tldr}
                  </span>
                  <span className={styles.meta}>
                    {d.read_minutes} min read{d.has_body ? "" : " · full write-up coming"}
                  </span>
                </span>
                <DiveRowStatus slug={d.slug} first={i === 0} />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
