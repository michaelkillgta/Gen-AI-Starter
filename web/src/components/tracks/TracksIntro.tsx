import Link from "next/link";

import { PageIntro } from "@/components/layout/PageIntro";
import type { TrackSummary } from "@/lib/api-types/TrackSummary";
import { links } from "@/lib/links";
import styles from "./TracksIntro.module.css";

const steps = [
  { n: 1, title: "Learn", text: "What the stage is and why it matters" },
  { n: 2, title: "Study", text: "The best resources, mostly free, in order" },
  { n: 3, title: "Build", text: "One project that proves you can do it" },
  { n: 4, title: "Check", text: "Tick the checklist, then move on" },
];

export function TracksIntro() {
  return (
    <PageIntro
      title="Tracks"
      lead="Two step-by-step plans with the best resources for each step, so you always know what to learn next and where to learn it."
      aside={
        <ol className={styles.steps} aria-label="How every stage works">
          {steps.map((s) => (
            <li key={s.n} className={styles.step}>
              <span className={styles.n}>{s.n}</span>
              <span className={styles.title}>{s.title}</span>
              <span className={styles.text}>{s.text}</span>
            </li>
          ))}
        </ol>
      }
    />
  );
}

/** The two tracks as big cards on /tracks. */
export function TrackCards({ tracks }: { tracks: TrackSummary[] }) {
  return (
    <section className={`container ${styles.cardsWrap}`} aria-label="Choose a track">
      <ul className={styles.cards}>
        {tracks.map((t) => (
          <li key={t.slug}>
            <Link href={links.track(t.slug)} className={t.tone === "dark" ? `${styles.card} ${styles.cardDark}` : styles.card}>
              <span className={styles.cardWho}>{t.who}</span>
              <span className={styles.cardName}>{t.name}</span>
              <span className={styles.cardBlurb}>{t.blurb}</span>
              <ol className={styles.cardStages}>
                {t.stages.map((s) => (
                  <li key={s.slug}>
                    <span className={styles.cardStageNum}>{s.position}</span>
                    {s.title}
                  </li>
                ))}
              </ol>
              <span className={styles.cardFoot}>
                <span>
                  {t.stage_count} stages · {t.resource_count} resources · {t.duration}
                </span>
                <span className={styles.cardCta}>Open the track →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Dark "Not sure where to start?" panel. */
export function WhereToStart() {
  const items = [
    { href: links.track("ai-ml"), title: "New to coding or AI", text: "Start the AI/ML track at Stage 1. No experience assumed." },
    { href: links.track("gen-ai"), title: "Know Python, want to build with LLMs", text: "Go straight to the Gen AI track." },
    { href: `${links.track("ai-ml")}#stage-classic-ml`, title: "Want ML engineer or data roles", text: "Do the AI/ML track first, then Gen AI." },
  ];
  return (
    <section className={`container ${styles.whereWrap}`}>
      <div className={styles.where}>
        <h2 className={styles.whereTitle}>Not sure where to start?</h2>
        {items.map((it) => (
          <Link key={it.title} href={it.href} className={styles.whereItem}>
            <span className={styles.whereHead}>{it.title}</span>
            <span className={styles.whereText}>{it.text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
