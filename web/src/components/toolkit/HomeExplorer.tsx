"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { Avatar, Chip, ChipRow, SearchField, Segmented } from "@/components/ui";
import {
  KIND_CHIPS,
  baseFilter,
  filterTools,
  kindCounts,
  type KindFilter,
  type SortOrder,
} from "@/features/toolkit/filter";
import type { StartList } from "@/lib/api-types/StartList";
import type { ToolWithDives } from "@/lib/api-types/ToolWithDives";
import { site } from "@/lib/site";
import styles from "./HomeExplorer.module.css";
import { StatusLegend } from "./StatusLegend";
import { ToolResults } from "./ToolResults";

type Props = {
  tools: ToolWithDives[];
  startLists: StartList[];
  /** Server-rendered "this week" strip that sits between the hero and the toolkit. */
  thisWeek: ReactNode;
};

/** Homepage hero + the full toolkit. Everything filters in the browser (28 tools). */
export function HomeExplorer({ tools, startLists, thisWeek }: Props) {
  const [q, setQ] = useState("");
  const [start, setStart] = useState("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [sort, setSort] = useState<SortOrder>("picks");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [selected, setSelected] = useState<string | null>(null);

  const query = { q, start, kind, sort };
  const base = useMemo(() => baseFilter(tools, startLists, { q, start }), [tools, startLists, q, start]);
  const counts = kindCounts(base);
  const shown = filterTools(tools, startLists, query);

  const clear = () => {
    setQ("");
    setStart("all");
    setKind("all");
  };

  return (
    <>
      <section className={`container ${styles.hero}`}>
        <span className={styles.byline}>
          <Avatar initial={site.author.initial} size={24} />
          Curated by {site.author.name}, an {site.author.role}
        </span>
        <h1 className={styles.title}>Find the right AI tool, explained simply.</h1>
        <p className={styles.lead}>
          What each AI tool does, when to use it, and when to skip it. Made for freshers and students in India.
        </p>
        <SearchField
          id="home-search"
          label="Search tools"
          variant="hero"
          className={styles.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you want to do? Try “read PDFs”, “build an agent”, “testing”"
        />
        <div className={styles.start}>
          <span className={styles.startLabel}>Start here:</span>
          <ChipRow label="Start here" className={styles.startChips}>
            <Chip tone="accent" pressed={start === "all"} onClick={() => setStart("all")}>
              Show everything
            </Chip>
            {startLists.map((l) => (
              <Chip key={l.slug} tone="accent" pressed={start === l.slug} onClick={() => setStart(l.slug)}>
                {l.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </section>

      {thisWeek}

      <section className={`container ${styles.toolkit}`} aria-labelledby="toolkit-heading">
        <h2 id="toolkit-heading" className="visually-hidden">
          The toolkit
        </h2>
        <div className={styles.toolbar}>
          <ChipRow label="Type of tool">
            {KIND_CHIPS.map((c) => (
              <Chip key={c.value} pressed={kind === c.value} count={counts[c.value]} onClick={() => setKind(c.value)}>
                {c.label}
              </Chip>
            ))}
          </ChipRow>
          <div className={styles.segments}>
            <Segmented
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                { value: "picks", label: "My picks first" },
                { value: "az", label: "A to Z" },
              ]}
            />
            <Segmented
              label="View"
              value={view}
              onChange={setView}
              className={styles.viewToggle}
              options={[
                { value: "cards", label: "Cards" },
                { value: "list", label: "List" },
              ]}
            />
          </div>
        </div>
        <div className={styles.countRow}>
          <span className={styles.count} aria-live="polite">
            {shown.length} of {tools.length} tools
          </span>
          <StatusLegend />
        </div>
        <ToolResults
          tools={shown}
          grouped={sort === "picks"}
          view={view}
          selected={selected}
          onSelect={setSelected}
          onClear={clear}
        />
        <Link href="/toolkit" className={styles.allTools}>
          See every tool with full details in the Toolkit →
        </Link>
      </section>
    </>
  );
}
