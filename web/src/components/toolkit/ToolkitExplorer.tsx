"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Chip, ChipRow, SearchField, Segmented } from "@/components/ui";
import {
  GROUP_CHIPS,
  KIND_PLURAL,
  SORT_OPTIONS,
  baseFilter,
  filterTools,
  groupCounts,
  kindCounts,
  type GroupFilter,
  type KindFilter,
  type SortOrder,
} from "@/features/toolkit/filter";
import type { StartList } from "@/lib/api-types/StartList";
import type { ToolWithDives } from "@/lib/api-types/ToolWithDives";
import { KindExplainer } from "./KindExplainer";
import { SuggestRow } from "./SuggestRow";
import { ToolResults } from "./ToolResults";
import styles from "./ToolkitExplorer.module.css";

type Props = {
  tools: ToolWithDives[];
  startLists: StartList[];
  initial: { q: string; kind: KindFilter; group: GroupFilter; sort: SortOrder; tool: string | null };
};

/** Blocks per area before "Show all": keeps the page short however big the toolkit grows. */
const PER_AREA = 6;

/**
 * /toolkit: every tool as a block, grouped by area. Pick a block to see its details
 * (side panel on desktop, bottom sheet on tablet, opens in place on phones). Search,
 * type and area filters, sort and the picked tool are all kept in the web address.
 */
export function ToolkitExplorer({ tools, startLists, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initial.q);
  const [kind, setKind] = useState<KindFilter>(initial.kind);
  const [group, setGroup] = useState<GroupFilter>(initial.group);
  const [sort, setSort] = useState<SortOrder>(initial.sort);
  const [selected, setSelected] = useState<string | null>(initial.tool);

  // Mirror the filters into the address bar without adding history entries.
  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (kind !== "all") params.set("type", kind);
    if (group !== "all") params.set("track", group);
    if (sort !== "picks") params.set("sort", sort);
    if (selected) params.set("tool", selected);
    const qs = params.toString();
    const t = setTimeout(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }), 250);
    return () => clearTimeout(t);
  }, [q, kind, group, sort, selected, pathname, router]);

  const counts = kindCounts(baseFilter(tools, startLists, { q, group }));
  const areaCounts = groupCounts(tools, startLists, { q, kind });
  const searchRef = useRef<HTMLDivElement>(null);

  // Press "/" anywhere (outside a text field) to jump to search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || el.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      searchRef.current?.querySelector("input")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const shown = filterTools(tools, startLists, { q, kind, group, sort });
  const filtered = q.trim() !== "" || kind !== "all" || group !== "all";
  const clear = () => {
    setQ("");
    setKind("all");
    setGroup("all");
  };

  return (
    <section className={`container ${styles.wrap}`} aria-labelledby="toolkit-results">
      <KindExplainer value={kind} counts={counts} onChange={setKind} />

      <div className={styles.toolbar}>
        <div className={styles.searchRow} ref={searchRef}>
          <SearchField
            id="tk-search"
            label="Search the toolkit"
            className={styles.search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search, for example “PDF”, “agent”, “testing”"
          />
          <kbd className={styles.kbd} aria-hidden="true" title="Press / to search">
            /
          </kbd>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Area</span>
          <ChipRow label="Area">
            {GROUP_CHIPS.map((c) => (
              <Chip key={c.value} pressed={group === c.value} count={areaCounts[c.value]} onClick={() => setGroup(c.value)}>
                {c.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </div>

      <div className={styles.resultsHead}>
        <h2 id="toolkit-results" className={styles.resultsTitle}>
          <span aria-live="polite">
            {shown.length === tools.length ? `All ${tools.length} tools` : `${shown.length} of ${tools.length} tools`}
          </span>
          {kind !== "all" && <span className={styles.resultsKind}> · {KIND_PLURAL[kind]} only</span>}
        </h2>
        <div className={styles.resultsTools}>
          {filtered && (
            <button type="button" className={styles.clear} onClick={clear}>
              Clear filters
            </button>
          )}
          <Segmented label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
        </div>
      </div>

      <ToolResults
        // Start fresh (areas folded again) whenever the filters change.
        key={`${q}|${kind}|${group}|${sort}`}
        tools={shown}
        grouped={sort === "picks"}
        view="cards"
        selected={selected}
        onSelect={setSelected}
        onClear={clear}
        // Searching or filtering shows every match; the full list is folded per area.
        limit={filtered ? undefined : PER_AREA}
      />

      <SuggestRow />

    </section>
  );
}
