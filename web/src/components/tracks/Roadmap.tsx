import Link from "next/link";

import type { Resource } from "@/lib/api-types/Resource";
import type { ResourceCost } from "@/lib/api-types/ResourceCost";
import type { ResourceKind } from "@/lib/api-types/ResourceKind";
import type { TrackDetail } from "@/lib/api-types/TrackDetail";
import type { TrackOverview } from "@/lib/api-types/TrackOverview";
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
  // Stage slug -> its phase, and the stages that open a phase (labels in the side list).
  const phaseOf = new Map<string, string>();
  const phaseStarts = new Map<string, string>();
  track.overview?.phases.forEach((p, i) => {
    p.stages.forEach((slug) => phaseOf.set(slug, p.title));
    if (p.stages[0]) phaseStarts.set(p.stages[0], `Phase ${i + 1} · ${p.title}`);
  });

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
                {phaseStarts.has(s.slug) && <span className={styles.navPhase}>{phaseStarts.get(s.slug)}</span>}
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

      <div className={styles.main}>
        {track.overview && <Overview overview={track.overview} stages={track.stages} />}
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
                      {phaseOf.has(s.slug) && <span className={styles.stagePhase}> · {phaseOf.get(s.slug)}</span>}
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

                {s.mistakes.length > 0 && (
                  <div className={styles.block}>
                    <span className={styles.blockTitle}>Common mistakes</span>
                    <ul className={styles.mistakes}>
                      {s.mistakes.map((m) => (
                        <li key={m}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 4.5v4.2M8 11.2v.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.project}>
                  <span className={styles.projectLabel}>Build this</span>
                  <span className={styles.projectTitle}>{s.project.title}</span>
                  <p className={styles.projectText}>{s.project.text}</p>
                  {s.project.check && (
                    <p className={styles.projectCheck}>
                      <span className={styles.projectCheckLabel}>How you&apos;ll know it works</span>
                      {s.project.check}
                    </p>
                  )}
                </div>

                <StageChecklist track={track.slug} stage={s.slug} items={s.done_when} />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/** The big picture above the stages: phases with their stages, target roles and self-checks. */
function Overview({ overview, stages }: { overview: TrackOverview; stages: TrackDetail["stages"] }) {
  const bySlug = new Map(stages.map((s) => [s.slug, s]));
  return (
    <section className={styles.overview} aria-labelledby="plan-title">
      <div className={styles.ovHead}>
        <h2 id="plan-title" className={styles.ovTitle}>
          The plan at a glance
        </h2>
        <p className={styles.ovNote}>{overview.pace_note}</p>
      </div>

      <ol className={styles.phases}>
        {overview.phases.map((p, i) => (
          <li key={p.title} className={styles.phase}>
            <div className={styles.phaseMeta}>
              <span className={styles.phaseNum}>Phase {i + 1}</span>
              <span className={styles.phaseWhen}>{p.when}</span>
            </div>
            <div className={styles.phaseBody}>
              <h3 className={styles.phaseTitle}>{p.title}</h3>
              <p className={styles.phaseText}>{p.text}</p>
              <ul className={styles.phaseStages}>
                {p.stages.map((slug) => {
                  const st = bySlug.get(slug);
                  if (!st) return null;
                  return (
                    <li key={slug}>
                      <a href={`#stage-${slug}`} className={styles.phaseStage}>
                        <span className={styles.phaseStageNum}>{st.position}</span>
                        {st.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className={styles.ovGrid}>
        <div className={styles.ovBlock}>
          <h3 className={styles.ovSub}>Where this track can take you</h3>
          <ul className={styles.cards}>
            {overview.roles.map((r) => (
              <li key={r.title} className={styles.card}>
                <span className={styles.cardTitle}>{r.title}</span>
                <span className={styles.cardText}>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.ovBlock}>
          <h3 className={styles.ovSub}>How to know you&apos;re really learning</h3>
          <ul className={styles.cards}>
            {overview.checks.map((c) => (
              <li key={c.title} className={`${styles.card} ${styles.cardCheck}`}>
                <span className={styles.cardTitle}>{c.title}</span>
                <span className={styles.cardText}>{c.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
