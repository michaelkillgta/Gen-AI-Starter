import type { Metadata } from "next";
import Link from "next/link";

import { ChallengeFacts, ProjectCard, Steps } from "@/components/challenge/Challenge";
import styles from "@/components/challenge/Challenge.module.css";
import { WaitlistForm } from "@/components/challenge/WaitlistForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getChallenge } from "@/lib/api";

export const metadata: Metadata = {
  title: "Build challenge",
  description: "Build one real AI project this weekend. Free, guided, with a small group. Join the waitlist.",
};

export default async function ChallengePage() {
  const data = await getChallenge();
  if (!data) return null;
  const { challenge, joined, projects } = data;

  return (
    <>
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroText}>
          <span className={styles.statusPill}>
            <span className={styles.statusDot} aria-hidden="true" />
            Waitlist open · date announced at {challenge.goal}
          </span>
          <h1 className={styles.heroTitle}>{challenge.title}</h1>
          <p className={styles.heroLead}>{challenge.blurb}</p>
          <ChallengeFacts challenge={challenge} />
        </div>
        <WaitlistForm joined={joined} goal={challenge.goal} />
      </section>

      <Steps challenge={challenge} />

      <section className={`container ${styles.projectsWrap}`} aria-labelledby="projects-title">
        <div className={styles.projectsHead}>
          <div>
            <span className={styles.projectsEyebrow}>Previous projects</span>
            <h2 id="projects-title" className={styles.projectsTitle}>
              Things I&apos;ve built, so you know who&apos;s guiding you.
            </h2>
          </div>
          <Link href="/blog" className={styles.projectsLink}>
            Read my blog
          </Link>
        </div>
        <div className={styles.projects}>
          {projects.map((p) => (
            <ProjectCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      <SiteFooter
        variant="slim"
        message={
          <>
            Want to run this at your college? <Link href="/contact">Get in touch</Link>
          </>
        }
      />
    </>
  );
}
