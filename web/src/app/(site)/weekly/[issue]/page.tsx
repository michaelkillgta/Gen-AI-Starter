import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HowIDecide, IssueBody } from "@/components/weekly/Weekly";
import { getIssue } from "@/lib/api";
import { formatDate } from "@/lib/links";

type Props = { params: Promise<{ issue: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const issue = await getIssue((await params).issue);
  if (!issue) return { title: "Issue not found" };
  return {
    title: `Issue ${issue.number} · Worth It? Weekly`,
    description: `Week of ${formatDate(issue.week_of)}: ${issue.verdicts.map((v) => v.name).join(", ")}.`,
  };
}

export default async function IssuePage({ params }: Props) {
  const issue = await getIssue((await params).issue);
  if (!issue) notFound();
  return (
    <>
      <PageIntro title={`Issue ${issue.number}`} lead={<>Worth It? Weekly · <Link href="/weekly/archive">all issues</Link></>} />
      <IssueBody issue={issue} label="Worth It? Weekly" />
      <HowIDecide />
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
