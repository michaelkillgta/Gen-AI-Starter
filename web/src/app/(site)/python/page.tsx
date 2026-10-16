import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";

import styles from "./python.module.css";

export const metadata: Metadata = {
  title: "Python",
  description: "Python for freshers and students: the parts you actually need, explained in plain words.",
};

/** Sections are filled in as the content arrives. */
const sections: { id: string; title: string; body: string }[] = [];

export default function PythonPage() {
  return (
    <>
      <PageIntro
        title="Python"
        lead="The Python you actually need as a fresher or student, explained in plain words with real examples you can run on a normal laptop."
      />
      <section className={`container ${styles.sections}`} aria-label="Python sections">
        {sections.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Sections coming soon</p>
            <p className={styles.emptyText}>The first Python lessons are being written. Check back shortly.</p>
          </div>
        ) : (
          sections.map((s) => (
            <article key={s.id} id={s.id} className={styles.card}>
              <h2 className={styles.cardTitle}>{s.title}</h2>
              <p className={styles.cardBody}>{s.body}</p>
            </article>
          ))
        )}
      </section>
      <SiteFooter variant="full" />
    </>
  );
}
