import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ArchiveList } from "@/components/weekly/Weekly";
import { getIssues } from "@/lib/api";

export const metadata: Metadata = {
  title: "Past weeks · Worth It? Weekly",
  description: "Every Worth It? Weekly issue, newest first.",
};

export default async function WeeklyArchivePage() {
  const issues = (await getIssues()) ?? [];
  return (
    <>
      <PageIntro title="Past weeks" lead="Every issue of Worth It? Weekly, newest first. Five tools each: use it, wait, or skip." />
      <div className="container" style={{ paddingBottom: 72 }}>
        {issues.length ? <ArchiveList issues={issues} /> : <p>No issues yet.</p>}
      </div>
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
