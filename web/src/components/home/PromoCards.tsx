import Link from "next/link";

import styles from "./PromoCards.module.css";

const cards = [
  {
    href: "/tracks",
    tone: "dark",
    eyebrow: "Tracks",
    title: "Know exactly what to learn next.",
    text: "Clear paths from your first AI call to agents and RAG, each ending with something you build.",
    cta: "See the tracks",
  },
  {
    href: "/challenge",
    tone: "accent",
    eyebrow: "Build challenge",
    title: "Build one real AI project this weekend.",
    text: "Free, guided, with a small group. Start Saturday, ship by Sunday.",
    cta: "Join the waitlist",
  },
  {
    href: "/blog",
    tone: "panel",
    eyebrow: "Blog",
    title: "My honest perspective on AI.",
    text: "What I'm learning, what I'm building, and what students should know.",
    cta: "Read the blog",
  },
] as const;

/** The three big cards under the toolkit: Tracks, Build challenge, Blog. */
export function PromoCards() {
  return (
    <section className={`container ${styles.grid}`} aria-label="More from GenAI Starter">
      {cards.map((c) => (
        <Link key={c.href} href={c.href} className={`${styles.card} ${styles[c.tone]}`}>
          <span className={styles.eyebrow}>{c.eyebrow}</span>
          <span className={styles.title}>{c.title}</span>
          <span className={styles.text}>{c.text}</span>
          <span className={styles.cta}>{c.cta}</span>
        </Link>
      ))}
    </section>
  );
}
