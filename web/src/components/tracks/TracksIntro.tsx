import Link from "next/link";

import { PageIntro } from "@/components/layout/PageIntro";
import styles from "./TracksIntro.module.css";

const steps = [
  { n: 1, title: "TL;DR", text: "The idea in three lines" },
  { n: 2, title: "Deep dive", text: "The full explanation" },
  { n: 3, title: "Try it", text: "One small build step" },
  { n: 4, title: "Next", text: "On to the next one" },
];

export function TracksIntro() {
  return (
    <PageIntro
      title="Tracks"
      lead="Clear paths, so you always know what comes next. Each track is a set of deep dives in order: read one, try it, move to the next."
      aside={
        <ol className={styles.steps} aria-label="How a deep dive works">
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

/** Dark "Not sure where to start?" panel at the bottom of the tracks pages. */
export function WhereToStart({ links }: { links: { foundations: string; rag: string; agents: string } }) {
  const items = [
    { href: links.foundations, title: "New to coding or AI", text: "Start with Foundations. No experience assumed." },
    { href: links.rag, title: "Know Python, want a project", text: "Start with RAG and documents." },
    { href: links.agents, title: "Built an agent already", text: "Go straight to Agents that don't break." },
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
