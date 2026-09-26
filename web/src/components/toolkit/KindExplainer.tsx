"use client";

import { Badge } from "@/components/ui";
import type { KindFilter } from "@/features/toolkit/filter";
import type { ToolKind } from "@/lib/api-types/ToolKind";
import styles from "./KindExplainer.module.css";

const kinds: { tone: ToolKind; label: string; plural: string; text: string }[] = [
  { tone: "tool", label: "Tool", plural: "tools", text: "An app or service you open and use, like a website or dashboard." },
  { tone: "library", label: "Library", plural: "libraries", text: "Building blocks you import into your own code to save writing them yourself." },
  { tone: "package", label: "Package", plural: "packages", text: "A ready-made program you install with pip or npm and run from your terminal." },
  { tone: "mcp", label: "MCP server", plural: "MCP servers", text: "A plug that lets your AI assistant use another app, like GitHub or Notion." },
];

type Props = {
  value: KindFilter;
  counts: Record<KindFilter, number>;
  onChange: (kind: KindFilter) => void;
};

/**
 * What "Tool", "Library", "Package" and "MCP server" mean, in plain words.
 * Each card doubles as the type filter: click to show only that kind, again to show all.
 */
export function KindExplainer({ value, counts, onChange }: Props) {
  return (
    <div className={styles.wrap}>
      <div role="group" aria-label="Filter by type" className={styles.grid}>
        {kinds.map((k) => {
          const on = value === k.tone;
          return (
            <button
              key={k.tone}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? "all" : k.tone)}
              className={on ? `${styles.item} ${styles.on}` : styles.item}
            >
              <span className={styles.top}>
                <Badge tone={k.tone}>{k.label}</Badge>
                <span className={styles.count}>
                  {counts[k.tone]} {counts[k.tone] === 1 ? "tool" : "tools"}
                </span>
              </span>
              <span className={styles.text}>{k.text}</span>
              <span className={styles.cta} aria-hidden="true">
                {on ? "Showing only these · show all" : `Show only ${k.plural}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
