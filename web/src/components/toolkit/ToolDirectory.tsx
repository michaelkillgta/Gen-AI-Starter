import Link from "next/link";
import { Fragment } from "react";

import { Badge, StatusDot } from "@/components/ui";
import { GROUPS, KIND_LABEL, STATUS_LABEL, monogram } from "@/features/toolkit/filter";
import type { ToolWithDives } from "@/lib/api-types/ToolWithDives";
import { links } from "@/lib/links";
import { site } from "@/lib/site";
import { CopyButton } from "./CopyButton";
import styles from "./ToolDirectory.module.css";

export type DirectorySection = { id: string; num: string; title: string; sub: string; tools: ToolWithDives[] };

/** Split into the four numbered Area sections, or one plain section for other sort orders. */
export function directorySections(tools: ToolWithDives[], grouped: boolean): DirectorySection[] {
  if (!grouped) return [{ id: "all-tools", num: "", title: "", sub: "", tools }];
  return GROUPS.map((g) => ({ id: `area-${g.value}`, title: g.title, sub: g.sub, tools: tools.filter((t) => t.group === g.value) }))
    .filter((s) => s.tools.length > 0)
    .map((s, i) => ({ ...s, num: String(i + 1).padStart(2, "0") }));
}

function Status({ tool }: { tool: ToolWithDives }) {
  if (tool.status === "using") return <span className={styles.uses}>{site.author.name} uses this</span>;
  return (
    <span className={styles.status}>
      <StatusDot status={tool.status} label="" />
      {STATUS_LABEL[tool.status]}
    </span>
  );
}

function Name({ tool }: { tool: ToolWithDives }) {
  return (
    <Link href={links.tool(tool.slug)} className={styles.name}>
      <span className={styles.mono} data-kind={tool.kind} aria-hidden="true">
        {monogram(tool.name)}
      </span>
      <span className={styles.nameText}>{tool.name}</span>
    </Link>
  );
}

function GetIt({ tool }: { tool: ToolWithDives }) {
  return (
    <span className={styles.getIt}>
      <code className={styles.code}>{tool.get_it}</code>
      <CopyButton text={tool.get_it} label={`how to get ${tool.name}`} />
    </span>
  );
}

/** Everything else about a tool: the second line of every row. Nothing in the data is left out. */
function Details({ tool }: { tool: ToolWithDives }) {
  const area = GROUPS.find((g) => g.value === tool.group);
  return (
    <div className={styles.details}>
      <div className={styles.plain}>
        <p className={styles.short}>{tool.short}</p>
        <p>{tool.plain}</p>
      </div>
      <div className={styles.useSkip}>
        <div className={styles.use}>
          <span className={styles.boxTitle}>Use it when</span>
          <span>{tool.use_when}</span>
        </div>
        <div className={styles.skip}>
          <span className={styles.boxTitle}>Skip it when</span>
          <span>{tool.skip_when}</span>
        </div>
      </div>
      <div className={styles.extras}>
        <div className={styles.dives}>
          <span className={styles.extraLabel}>Deep dives</span>
          {tool.dives.length ? (
            tool.dives.map((d) => (
              <Link key={d.slug} href={links.dive(d.track_slug, d.slug)} className={styles.dive}>
                {d.title}
              </Link>
            ))
          ) : (
            <span className={styles.soon}>Coming soon</span>
          )}
        </div>
        {tool.note && (
          <p className={styles.note}>
            <span className={styles.extraLabel}>From my notes </span>
            {tool.note}
          </p>
        )}
        <div className={styles.meta}>
          {area && (
            <span>
              <span className={styles.extraLabel}>Area </span>
              {area.label}
            </span>
          )}
          {tool.tags.length > 0 && (
            <span className={styles.tags}>
              <span className={styles.extraLabel}>Good for </span>
              {tool.tags.map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The full toolkit, one tool per row with everything visible.
 * Desktop: a real table (two rows per tool). Tablet and phone: a list of blocks.
 */
export function ToolDirectory({ sections }: { sections: DirectorySection[] }) {
  return (
    <>
      <table className={styles.table}>
        <caption className="visually-hidden">Every tool in the toolkit with full details</caption>
        <thead>
          <tr>
            <th scope="col">Tool</th>
            <th scope="col">Type</th>
            <th scope="col">Status</th>
            <th scope="col">Runs on</th>
            <th scope="col">Cost</th>
            <th scope="col">Get it</th>
          </tr>
        </thead>
        {sections.map((s) => (
          <Fragment key={s.id}>
            {s.title && (
              <tbody className={styles.sectionBody}>
                <tr>
                  <th scope="colgroup" colSpan={6} data-section={s.id} className={styles.sectionHead}>
                    <span className={styles.sectionNum}>{s.num}</span>
                    <span className={styles.sectionTitle}>{s.title}</span>
                    <span className={styles.sectionSub}>{s.sub}</span>
                    <span className={styles.sectionCount}>
                      {s.tools.length} {s.tools.length === 1 ? "tool" : "tools"}
                    </span>
                  </th>
                </tr>
              </tbody>
            )}
            {s.tools.map((t) => (
              <tbody key={t.slug} className={styles.toolBody}>
                <tr className={styles.lineOne}>
                  <th scope="row">
                    <Name tool={t} />
                  </th>
                  <td>
                    <Badge tone={t.kind}>{KIND_LABEL[t.kind]}</Badge>
                  </td>
                  <td>
                    <Status tool={t} />
                  </td>
                  <td>{t.runs_on}</td>
                  <td>{t.cost}</td>
                  <td>
                    <GetIt tool={t} />
                  </td>
                </tr>
                <tr className={styles.lineTwo}>
                  <td colSpan={6}>
                    <Details tool={t} />
                  </td>
                </tr>
              </tbody>
            ))}
          </Fragment>
        ))}
      </table>

      <div className={styles.list}>
        {sections.map((s) => (
          <section
            key={s.id}
            aria-labelledby={s.title ? `${s.id}-list` : undefined}
            data-section={s.id}
            className={styles.listSection}
          >
            {s.title && (
              <h2 id={`${s.id}-list`} className={styles.listHead}>
                <span className={styles.sectionNum}>{s.num}</span>
                <span className={styles.sectionTitle}>{s.title}</span>
                <span className={styles.sectionCount}>
                  {s.tools.length} {s.tools.length === 1 ? "tool" : "tools"}
                </span>
              </h2>
            )}
            <ul className={styles.listItems}>
              {s.tools.map((t) => (
                <li key={t.slug} className={styles.item}>
                  <div className={styles.itemTop}>
                    <Name tool={t} />
                    <Badge tone={t.kind}>{KIND_LABEL[t.kind]}</Badge>
                  </div>
                  <dl className={styles.facts}>
                    <div>
                      <dt>Status</dt>
                      <dd>
                        <Status tool={t} />
                      </dd>
                    </div>
                    <div>
                      <dt>Runs on</dt>
                      <dd>{t.runs_on}</dd>
                    </div>
                    <div>
                      <dt>Cost</dt>
                      <dd>{t.cost}</dd>
                    </div>
                    <div className={styles.factWide}>
                      <dt>Get it</dt>
                      <dd>
                        <GetIt tool={t} />
                      </dd>
                    </div>
                  </dl>
                  <Details tool={t} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

/** One full-width invitation at the end of the directory. */
export function SuggestRow() {
  return (
    <aside className={styles.suggest} aria-labelledby="suggest-title">
      <span className={styles.suggestPlus} aria-hidden="true">
        +
      </span>
      <div className={styles.suggestText}>
        <h2 id="suggest-title" className={styles.suggestTitle}>
          Missing a tool?
        </h2>
        <p className={styles.suggestBody}>
          Suggest it. I&apos;ll try it myself, and if it&apos;s worth it, you&apos;ll see my verdict in Worth It? Weekly.
        </p>
      </div>
      <div className={styles.suggestLinks}>
        <Link href="/suggest?about=tool" className={styles.suggestMain}>
          Suggest a tool →
        </Link>
        <Link href="/weekly" className={styles.suggestSecondary}>
          See this week&apos;s verdicts
        </Link>
      </div>
    </aside>
  );
}
