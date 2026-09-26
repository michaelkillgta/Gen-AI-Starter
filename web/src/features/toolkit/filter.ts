import type { StartList } from "@/lib/api-types/StartList";
import type { ToolGroup } from "@/lib/api-types/ToolGroup";
import type { ToolKind } from "@/lib/api-types/ToolKind";
import type { ToolStatus } from "@/lib/api-types/ToolStatus";
import type { ToolWithDives } from "@/lib/api-types/ToolWithDives";

export type KindFilter = "all" | ToolKind;
export type GroupFilter = "all" | ToolGroup;
export type SortOrder = "picks" | "az";

export const KIND_LABEL: Record<ToolKind, string> = {
  tool: "Tool",
  library: "Library",
  package: "Package",
  mcp: "MCP server",
};

export const KIND_CHIPS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tool", label: "Tools" },
  { value: "library", label: "Libraries" },
  { value: "package", label: "Packages" },
  { value: "mcp", label: "MCP servers" },
];

export const STATUS_LABEL: Record<ToolStatus, string> = {
  using: "I use this",
  notes: "In my notes",
  tested: "Tested",
};

/** Toolkit groups, in page order, with the headings from the design. */
export const GROUPS: { value: ToolGroup; label: string; title: string; sub: string }[] = [
  { value: "foundations", label: "Foundations", title: "Start here", sub: "Understand how AI works before you build." },
  { value: "rag", label: "RAG and documents", title: "Work with documents", sub: "Read PDFs, tables and papers for RAG apps." },
  { value: "agents", label: "Agents that don't break", title: "Build agents that don't break", sub: "Orchestrate, test and watch your agents." },
  { value: "ship", label: "Build and ship", title: "Build, host and connect", sub: "Databases, deploys, UI and MCP servers." },
];

export const GROUP_CHIPS: { value: GroupFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...GROUPS.map((g) => ({ value: g.value as GroupFilter, label: g.label })),
];

const STATUS_RANK: Record<ToolStatus, number> = { using: 0, tested: 1, notes: 2 };

export type ToolQuery = {
  q?: string;
  kind?: KindFilter;
  group?: GroupFilter;
  /** Slug of a "Start here" list, or "all". */
  start?: string;
  sort?: SortOrder;
};

export function matchesSearch(t: ToolWithDives, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [t.name, t.short, t.plain, t.tags.join(" "), KIND_LABEL[t.kind]].join(" ").toLowerCase();
  // Every word must appear somewhere, so "read pdfs" finds Docling.
  return needle.split(/\s+/).every((w) => hay.includes(w) || hay.includes(w.replace(/s$/, "")));
}

/** Everything except the kind filter, so kind chips can show counts. */
export function baseFilter(tools: ToolWithDives[], startLists: StartList[], query: ToolQuery): ToolWithDives[] {
  const start = query.start && query.start !== "all" ? startLists.find((l) => l.slug === query.start) : undefined;
  return tools.filter(
    (t) =>
      (!start || start.tools.includes(t.slug)) &&
      (!query.group || query.group === "all" || t.group === query.group) &&
      matchesSearch(t, query.q ?? ""),
  );
}

export function filterTools(tools: ToolWithDives[], startLists: StartList[], query: ToolQuery): ToolWithDives[] {
  const base = baseFilter(tools, startLists, query);
  const filtered = base.filter((t) => !query.kind || query.kind === "all" || t.kind === query.kind);
  return sortTools(filtered, query.sort ?? "picks");
}

export function sortTools(tools: ToolWithDives[], sort: SortOrder): ToolWithDives[] {
  const copy = [...tools];
  if (sort === "az") return copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.position - b.position);
}

export function kindCounts(base: ToolWithDives[]): Record<KindFilter, number> {
  const counts: Record<KindFilter, number> = { all: base.length, tool: 0, library: 0, package: 0, mcp: 0 };
  for (const t of base) counts[t.kind] += 1;
  return counts;
}

/** Tools per area for the Area chips (search and type applied, area not). */
export function groupCounts(tools: ToolWithDives[], startLists: StartList[], query: ToolQuery): Record<GroupFilter, number> {
  const base = baseFilter(tools, startLists, { ...query, group: "all" }).filter(
    (t) => !query.kind || query.kind === "all" || t.kind === query.kind,
  );
  const counts: Record<GroupFilter, number> = { all: base.length, foundations: 0, rag: 0, agents: 0, ship: 0 };
  for (const t of base) counts[t.group] += 1;
  return counts;
}

/** Two-letter badge from the name, e.g. "Vercel AI SDK" → "VA", "GitHub MCP" → "G". */
export function monogram(name: string): string {
  const parts = name.replace(/ MCP$/, "").split(/[\s-]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0]).toUpperCase();
}

export function isKind(v: string | null | undefined): v is ToolKind {
  return v === "tool" || v === "library" || v === "package" || v === "mcp";
}

export function isGroup(v: string | null | undefined): v is ToolGroup {
  return v === "foundations" || v === "rag" || v === "agents" || v === "ship";
}
