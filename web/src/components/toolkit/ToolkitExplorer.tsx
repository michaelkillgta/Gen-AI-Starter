"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Chip, ChipRow, SearchField } from "@/components/ui";
import {
  GROUP_CHIPS,
  KIND_CHIPS,
  filterTools,
  type GroupFilter,
  type KindFilter,
} from "@/features/toolkit/filter";
import type { StartList } from "@/lib/api-types/StartList";
import type { ToolWithDives } from "@/lib/api-types/ToolWithDives";
import styles from "./ToolkitExplorer.module.css";
import { ToolResults } from "./ToolResults";

type Props = {
  tools: ToolWithDives[];
  startLists: StartList[];
  initial: { q: string; kind: KindFilter; group: GroupFilter; tool: string | null };
};

/** /toolkit: search plus type and area filters, all kept in the web address so a view can be shared. */
export function ToolkitExplorer({ tools, startLists, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initial.q);
  const [kind, setKind] = useState<KindFilter>(initial.kind);
  const [group, setGroup] = useState<GroupFilter>(initial.group);
  const [selected, setSelected] = useState<string | null>(initial.tool);

  // Mirror the filters into the address bar without adding history entries.
  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (kind !== "all") params.set("type", kind);
    if (group !== "all") params.set("track", group);
    if (selected) params.set("tool", selected);
    const qs = params.toString();
    const t = setTimeout(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }), 250);
    return () => clearTimeout(t);
  }, [q, kind, group, selected, pathname, router]);

  const shown = filterTools(tools, startLists, { q, kind, group });

  return (
    <section className={`container ${styles.wrap}`} aria-labelledby="toolkit-results">
      <h2 id="toolkit-results" className="visually-hidden">
        Tools
      </h2>
      <div className={styles.searchRow}>
        <SearchField
          id="tk-search"
          label="Search the toolkit"
          className={styles.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search, for example “PDF”, “agent”, “testing”"
        />
        <span className={styles.count} aria-live="polite">
          Showing {shown.length} of {tools.length}
        </span>
      </div>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Type</span>
          <ChipRow label="Type">
            {KIND_CHIPS.map((c) => (
              <Chip key={c.value} pressed={kind === c.value} onClick={() => setKind(c.value)}>
                {c.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Area</span>
          <ChipRow label="Area">
            {GROUP_CHIPS.map((c) => (
              <Chip key={c.value} pressed={group === c.value} onClick={() => setGroup(c.value)}>
                {c.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </div>
      <ToolResults
        tools={shown}
        grouped={false}
        view="cards"
        selected={selected}
        onSelect={setSelected}
        onClear={() => {
          setQ("");
          setKind("all");
          setGroup("all");
        }}
      />
    </section>
  );
}
