import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui";
import { ArchiveList, HowIDecide, IssueBody } from "@/components/weekly/Weekly";
import { getIssues, getLatestIssue } from "@/lib/api";
import { site } from "@/lib/site";
import styles from "./weekly.module.css";

export const metadata: Metadata = {
  title: "Worth It? Weekly",
  description: "Every week, five new AI tools, libraries or repos, tried and judged honestly: use it, wait, or skip.",
};

export default async function WeeklyPage() {
  const [issue, issues] = await Promise.all([getLatestIssue(), getIssues()]);
  const past = (issues ?? []).filter((i) => i.number !== issue?.number).slice(0, 3);

  return (
    <>
      <PageIntro
        title="Worth It? Weekly"
        lead="Every week I try five new AI tools, libraries or repos that people are talking about, and tell you honestly: use it, wait, or skip."
        aside={
          <div className={styles.subscribe}>
            <Button href={site.social.whatsappChannel} size="lg">
              Get it every week on WhatsApp
            </Button>
            <span className={styles.subNote}>New issue every {site.placeholders.weeklyDay}</span>
          </div>
        }
      />
      {issue ? (
        <IssueBody issue={issue} label="This week" />
      ) : (
        <p className="container">The first issue is on its way.</p>
      )}
      <HowIDecide />
      <section className={`container ${styles.past}`} aria-labelledby="past-weeks">
        <div className={styles.pastHead}>
          <h2 id="past-weeks" className={styles.pastTitle}>
            Past weeks
          </h2>
          {past.length > 0 && <Link href="/weekly/archive">See all issues</Link>}
        </div>
        {past.length > 0 ? (
          <ArchiveList issues={past} />
        ) : (
          <div className={styles.empty}>Earlier issues appear here, newest first, after the second week.</div>
        )}
      </section>
      <SiteFooter
        variant="slim"
        message={
          <>
            Seen a tool you want reviewed? <Link href="/suggest?about=weekly">Suggest it</Link>
          </>
        }
      />
    </>
  );
}
