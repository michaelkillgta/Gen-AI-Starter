import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SuggestForm } from "@/components/layout/SimpleForms";
import styles from "./suggest.module.css";

export const metadata: Metadata = {
  title: "Suggest a tool or topic",
  description: "Tell me about a tool to test, a topic to write about, or a mistake to fix.",
};

type Props = { searchParams: Promise<{ about?: string }> };

const steps = [
  { title: "I read every one", text: "Suggestions land straight in my inbox, not a bot." },
  { title: "I try it on a normal laptop", text: "On a real task a student would build, not just the demo." },
  { title: "You see the verdict", text: "Worth it? It goes in Worth It? Weekly and the toolkit, with credit to you if you like." },
];

export default async function SuggestPage({ searchParams }: Props) {
  const about = (await searchParams).about ?? "tool";
  return (
    <>
      <PageIntro
        title="Suggest something"
        lead="A tool I should test, a topic you want explained, or a mistake I should fix. It takes a minute."
      />
      <div className={`container ${styles.layout}`}>
        <SuggestForm about={about} />
        <aside className={styles.side} aria-labelledby="what-happens">
          <h2 id="what-happens" className={styles.sideTitle}>
            What happens next
          </h2>
          <ol className={styles.steps}>
            {steps.map((s, i) => (
              <li key={s.title} className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={styles.stepText}>
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className={styles.sideNote}>
            Nobody pays to be listed, and suggesting a tool doesn&apos;t guarantee a good verdict.
          </p>
        </aside>
      </div>
      <SiteFooter variant="slim" message="Suggestions shape what I test and write next." />
    </>
  );
}
