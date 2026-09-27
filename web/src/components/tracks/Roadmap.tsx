import Link from "next/link";

import type { Resource } from "@/lib/api-types/Resource";
import type { ResourceCost } from "@/lib/api-types/ResourceCost";
import type { ResourceKind } from "@/lib/api-types/ResourceKind";
import type { TrackDetail } from "@/lib/api-types/TrackDetail";
import type { TrackSummary } from "@/lib/api-types/TrackSummary";
import { links } from "@/lib/links";
import { DiveRowStatus } from "./ProgressWidgets";
import styles from "./Roadmap.module.css";
import { ContinueButton, StageChecklist, StageDot, TrackStageProgress } from "./StageProgress";

const KIND: Record<ResourceKind, string> = {
  course: "Course",
  video: "Video",
  book: "Read",
  docs: "Docs",
  paper: "Paper",
  practice: "Hands-on",
  community: "Community",
};

const COST: Record<ResourceCost, string> = {
  free: "Free",
  "free-audit": "Free to audit",
  "free-tier": "Free plan",
  paid: "Paid",
};

/** The two track tabs at the top of every track page. */
export function TrackTabs({ tracks, current }: { tracks: TrackSummary[]; current: string }) {
  return (
    <nav className={`container ${styles.tabsWrap}`} aria-label="Tracks">
      <ul className={styles.tabs}>
        {tracks.map((t) => {
          const on = t.slug === current;
          return (
            <li key={t.slug}>
              <Link
                href={links.track(t.slug)}
                aria-current={on ? "page" : undefined}
                className={on ? `${styles.tab} ${styles.tabOn}` : styles.tab}
                scroll={false}
              >
                <span className={styles.tabWho}>{t.who}</span>
                <span className={styles.tabLabel}>{t.name}</span>
                <span className={styles.tabSub}>
                  {t.stage_count} stages · {t.duration.replace(/^About /, "about ")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ResourceRow({ r }: { r: Resource }) {
  return (
    <li className={styles.resource}>
      <span className={styles.kind} data-kind={r.kind}>
        {KIND[r.kind]}
      </span>
      <span className={styles.resMain}>
        <a href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resTitle}>
          {r.title}
          <span className="visually-hidden"> (opens in a new tab)</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={styles.ext}>
            <path d="M4.5 2.5h5v5M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <span className={styles.resBy}>
          {r.by}
          {r.note && <span className={styles.resNote}> · {r.note}</span>}
        </span>
        {r.tool && (
          <Link href={links.tool(r.tool)} className={styles.resTool}>
            In the toolkit
          </Link>
        )}
      </span>
      <span className={styles.cost} data-cost={r.cost}>
        {COST[r.cost]}
      </span>
    </li>
  );
}

/** One track as a step-by-step plan: summary, stage list and every stage in full. */
export function Roadmap({ track }: { track: TrackDetail }) {
  const stageSlugs = track.stages.map((s) => s.slug);
  const resources = track.stages.reduce((n, s) => n + s.resources.length, 0);

  return (
    <div className={`container ${styles.layout}`}>
      <aside className={styles.side}>
        <div className={styles.summary}>
          <span className={styles.who}>{track.who}</span>
          <h2 className={styles.name}>{track.name}</h2>
          <p className={styles.blurb}>{track.blurb}</p>
          <dl className={styles.facts}>
            <div>
              <dt>Time</dt>
              <dd>{track.duration}</dd>
            </div>
            <div>
              <dt>Stages</dt>
              <dd>{track.stages.length}</dd>
            </div>
            <div>
              <dt>Resources</dt>
              <dd>{resources}, mostly free</dd>
            </div>
          </dl>
          <div className={styles.startIf}>{track.start_if}</div>
          <TrackStageProgress track={track.slug} stages={stageSlugs} />
          <ContinueButton track={track.slug} stages={track.stages} />
        </div>
        <nav className={styles.nav} aria-label="Stages">
          <ol>
            {track.stages.map((s) => (
              <li key={s.slug}>
                <a href={`#stage-${s.slug}`} className={styles.navLink}>
                  <StageDot track={track.slug} stage={s.slug} n={s.position} />
                  <span className={styles.navText}>
                    <span className={styles.navTitle}>{s.title}</span>
                    <span className={styles.navWeeks}>{s.weeks}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      <ol className={styles.stages} aria-label={`${track.name} stages`}>
        {track.stages.map((s) => {
          const dives = track.dives.filter((d) => d.stage === s.slug);
          return (
            <li key={s.slug} id={`stage-${s.slug}`} className={styles.stage}>
              <header className={styles.stageHead}>
                <span className={styles.stageNum} aria-hidden="true">
                  {String(s.position).padStart(2, "0")}
                </span>
                <div className={styles.stageHeadText}>
                  <span className={styles.stageMeta}>
                    Stage {s.position} · {s.weeks}
                  </span>
                  <h3 className={styles.stageTitle}>{s.title}</h3>
                  <p className={styles.stageWhy}>{s.why}</p>
                </div>
              </header>

              <div className={styles.block}>
                <span className={styles.blockTitle}>What you&apos;ll learn</span>
                <ul className={styles.topics}>
                  {s.topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.block}>
                <span className={styles.blockTitle}>Best resources, in order</span>
                <ol className={styles.resources}>
                  {s.resources.map((r) => (
                    <ResourceRow key={r.url + r.title} r={r} />
                  ))}
                </ol>
              </div>

              {dives.length > 0 && (
                <div className={styles.block}>
                  <span className={styles.blockTitle}>My deep dives for this stage</span>
                  <ul className={styles.dives}>
                    {dives.map((d, i) => (
                      <li key={d.slug}>
                        <Link href={links.dive(track.slug, d.slug)} className={styles.dive}>
                          <span className={styles.diveText}>
                            <span className={styles.diveTitle}>{d.title}</span>
                            <span className={styles.diveTldr}>{d.tldr}</span>
                          </span>
                          <DiveRowStatus slug={d.slug} first={i === 0 && s.position === 1} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.project}>
                <span className={styles.projectLabel}>Build this</span>
                <span className={styles.projectTitle}>{s.project.title}</span>
                <p className={styles.projectText}>{s.project.text}</p>
              </div>

              <StageChecklist track={track.slug} stage={s.slug} items={s.done_when} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
