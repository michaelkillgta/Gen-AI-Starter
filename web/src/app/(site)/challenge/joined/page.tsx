import type { Metadata } from "next";
import Link from "next/link";

import { ChallengeFacts, Steps } from "@/components/challenge/Challenge";
import styles from "@/components/challenge/Challenge.module.css";
import { waitlistStatus } from "@/features/challenge/status";
import { ShareButton } from "@/components/challenge/ShareButton";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProgressBar } from "@/components/ui";
import { getChallenge } from "@/lib/api";

export const metadata: Metadata = {
  title: "You're on the list",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ n?: string }> };

export default async function JoinedPage({ searchParams }: Props) {
  const n = Number((await searchParams).n) || null;
  const data = await getChallenge();
  if (!data) return null;
  const { challenge, joined } = data;

  return (
    <>
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>You&apos;re on the list.</h1>
          <p className={styles.heroLead}>
            {n ? <>You&apos;re number {n}. </> : null}When we reach {challenge.goal}, I&apos;ll announce the date and send
            your invite with the timings.
          </p>
          <ChallengeFacts challenge={challenge} />
        </div>
        <div role="status" className={styles.joined}>
          <span className={styles.joinedCheck} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 10 10" fill="none">
              <path d="M2 5.2l2 2L8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h2 className={styles.joinedTitle}>{n ? `You're number ${n}` : "You're in"}</h2>
          <div className={styles.counter}>
            <div className={styles.counterHead}>
              <span>
                <strong>
                  {joined} of {challenge.goal}
                </strong>{" "}
                <span className={styles.muted}>people have joined</span>
              </span>
              <span className={styles.counterStatus}>{waitlistStatus(joined, challenge.goal)}</span>
            </div>
            <ProgressBar value={joined} max={challenge.goal} label="Waitlist progress" />
          </div>
          <p className={styles.joinedNote}>Know a friend who&apos;d join? Share this page to help us reach {challenge.goal} sooner.</p>
          <ShareButton />
          <Link href="/challenge">Back to the challenge</Link>
        </div>
      </section>
      <Steps challenge={challenge} />
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
