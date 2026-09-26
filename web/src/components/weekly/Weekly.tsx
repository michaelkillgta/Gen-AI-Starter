import Link from "next/link";

import { Badge } from "@/components/ui";
import { KIND_LABEL } from "@/features/toolkit/filter";
import type { IssueDetail } from "@/lib/api-types/IssueDetail";
import type { IssueSummary } from "@/lib/api-types/IssueSummary";
import type { Tally } from "@/lib/api-types/Tally";
import type { Verdict } from "@/lib/api-types/Verdict";
import { formatDate, links } from "@/lib/links";
import styles from "./Weekly.module.css";

const VERDICT_LABEL = { use: "Use it", wait: "Wait", skip: "Skip" } as const;

export function TallyPills({ tally, size = "lg" }: { tally: Tally; size?: "md" | "lg" }) {
  return (
    <span className={styles.tally}>
      <Badge tone="use" size={size}>{tally.use} Use it</Badge>
      <Badge tone="wait" size={size}>{tally.wait} Wait</Badge>
      <Badge tone="skip" size={size}>{tally.skip} Skip</Badge>
    </span>
  );
}

/** "This week · Issue 1 / Week of 21 Sep 2026" bar with the use/wait/skip count. */
export function IssueHeader({ issue, label }: { issue: IssueDetail; label: string }) {
  return (
    <div className={styles.issueHead}>
      <div className={styles.issueHeadText}>
        <span className={styles.issueLabel}>
          {label} · Issue {issue.number}
        </span>
        <h2 className={styles.issueTitle}>Week of {formatDate(issue.week_of)}</h2>
      </div>
      <TallyPills tally={issue.tally} />
    </div>
  );
}

export function VerdictCard({ v }: { v: Verdict }) {
  return (
    <article className={styles.verdict}>
      <span className={styles.num} aria-hidden="true">
        {String(v.position).padStart(2, "0")}
      </span>
      <div className={styles.what}>
        <Badge tone={v.kind}>{KIND_LABEL[v.kind]}</Badge>
        <h3 className={styles.name}>{v.name}</h3>
        <p className={styles.summary}>{v.summary}</p>
      </div>
      <div className={styles.why}>
        <p>
          <strong>Why: </strong>
          {v.why}
        </p>
        <p className={styles.bestFor}>
          <strong>{v.best_for_label}: </strong>
          {v.best_for}
        </p>
      </div>
      <div className={styles.call}>
        <Badge tone={v.verdict} size="lg" className={styles.callBadge}>
          <span className="visually-hidden">Verdict: </span>
          {VERDICT_LABEL[v.verdict]}
        </Badge>
        {v.qualifier && <span className={styles.qualifier}>{v.qualifier}</span>}
        {v.tool && (
          <Link href={links.tool(v.tool)} className={styles.toolLink}>
            See in toolkit
          </Link>
        )}
      </div>
    </article>
  );
}

export function IssueBody({ issue, label }: { issue: IssueDetail; label: string }) {
  return (
    <section className={`container ${styles.issue}`} aria-label={`Issue ${issue.number}`}>
      <IssueHeader issue={issue} label={label} />
      {issue.verdicts.map((v) => (
        <VerdictCard key={v.position} v={v} />
      ))}
      {(issue.prev || issue.next) && (
        <nav className={styles.pager} aria-label="Other issues">
          {issue.prev ? <Link href={links.issue(issue.prev)}>← Issue {issue.prev}</Link> : <span />}
          {issue.next ? <Link href={links.issue(issue.next)}>Issue {issue.next} →</Link> : <span />}
        </nav>
      )}
    </section>
  );
}

const principles = [
  { title: "On a normal laptop", text: "Tested on the kind of machine students actually have, not a powerful workstation." },
  { title: "On a real task", text: "Not just the demo. I try it on something a student would build." },
  { title: "No paid placements", text: "Nobody pays to be here, and nobody pays for a better verdict." },
];

export function HowIDecide() {
  return (
    <section className={`container ${styles.decideWrap}`} id="how-i-decide">
      <div className={styles.decide}>
        <h2 className={styles.decideTitle}>How I decide</h2>
        {principles.map((p) => (
          <div key={p.title} className={styles.principle}>
            <span className={styles.principleTitle}>{p.title}</span>
            <span className={styles.principleText}>{p.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ArchiveList({ issues }: { issues: IssueSummary[] }) {
  return (
    <ul className={styles.archive}>
      {issues.map((i) => (
        <li key={i.number}>
          <Link href={links.issue(i.number)} className={styles.archiveItem}>
            <span className={styles.archiveHead}>
              <span className={styles.archiveNum}>Issue {i.number}</span>
              <span className={styles.archiveDate}>Week of {formatDate(i.week_of)}</span>
            </span>
            <span className={styles.archiveNames}>{i.names.join(" · ")}</span>
            <TallyPills tally={i.tally} size="md" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
