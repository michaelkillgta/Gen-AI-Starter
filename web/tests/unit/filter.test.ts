import { describe, expect, it } from "vitest";

import { filterTools, kindCounts, baseFilter, matchesSearch, monogram } from "@/features/toolkit/filter";
import type { ToolWithDives } from "@/lib/api-types/ToolWithDives";

const tool = (over: Partial<ToolWithDives>): ToolWithDives => ({
  slug: "x", name: "X", kind: "tool", group: "ship", short: "", plain: "", use_when: "", skip_when: "",
  runs_on: "", cost: "", get_it: "", status: "notes", note: null, tags: [], position: 1, dives: [], posts: [],
  ...over,
});

const tools = [
  tool({ slug: "docling", name: "Docling", kind: "package", group: "rag", tags: ["pdf", "tables"], position: 1 }),
  tool({ slug: "supabase", name: "Supabase", kind: "tool", status: "using", tags: ["database"], position: 2 }),
  tool({ slug: "langgraph", name: "LangGraph", kind: "library", group: "agents", position: 3 }),
];
const lists = [{ slug: "new", label: "New", tools: ["docling"] }];

describe("toolkit filters", () => {
  it("search matches plural words", () => {
    expect(matchesSearch(tools[0], "read pdfs")).toBe(false); // "read" isn't in Docling's text here
    expect(matchesSearch(tools[0], "pdfs")).toBe(true);
  });

  it("puts tools I use first", () => {
    expect(filterTools(tools, lists, {}).map((t) => t.slug)).toEqual(["supabase", "docling", "langgraph"]);
    expect(filterTools(tools, lists, { sort: "az" }).map((t) => t.slug)).toEqual(["docling", "langgraph", "supabase"]);
  });

  it("filters by kind, group and start list", () => {
    expect(filterTools(tools, lists, { kind: "library" }).map((t) => t.slug)).toEqual(["langgraph"]);
    expect(filterTools(tools, lists, { group: "rag" }).map((t) => t.slug)).toEqual(["docling"]);
    expect(filterTools(tools, lists, { start: "new" }).map((t) => t.slug)).toEqual(["docling"]);
  });

  it("counts kinds before the kind filter", () => {
    expect(kindCounts(baseFilter(tools, lists, {}))).toEqual({ all: 3, tool: 1, library: 1, package: 1, mcp: 0 });
  });

  it("makes monograms", () => {
    expect(monogram("Vercel AI SDK")).toBe("VA");
    expect(monogram("GitHub MCP")).toBe("G");
    expect(monogram("n8n")).toBe("N");
  });
});
