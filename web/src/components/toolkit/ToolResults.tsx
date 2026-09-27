"use client";

import { useState } from "react";

import { Badge, BottomSheet, Button, StatusDot } from "@/components/ui";
import { GROUPS, KIND_LABEL, STATUS_LABEL, monogram } from "@/features/toolkit/filter";
import type { ToolWithDives } from "@/lib/api-types/ToolWithDives";
import { site } from "@/lib/site";
import { ToolDetail } from "./ToolDetail";
import styles from "./ToolResults.module.css";

type Props = {
  tools: ToolWithDives[];
  /** Split the grid into the four toolkit groups with headings. */
  grouped: boolean;
  view: "cards" | "list";
  selected: string | null;
  onSelect: (slug: string) => void;
  onClear: () => void;
};

const PHONE = "(max-width: 639px)";
const TABLET = "(min-width: 640px) and (max-width: 1023px)";

/**
 * The tool grid (or list) plus the details, which show up differently per screen:
 * desktop: sticky side panel · tablet: bottom sheet · phone: the card opens in place.
 */
export function ToolResults({ tools, grouped, view, selected, onSelect, onClear }: Props) {
  const [openInline, setOpenInline] = useState<string | null>(null);
  const [sheet, setSheet] = useState<string | null>(null);

  const groups = grouped
    ? GROUPS.map((g) => ({ ...g, items: tools.filter((t) => t.group === g.value) })).filter((g) => g.items.length)
    : [{ value: "all", title: "", sub: "", label: "", items: tools }];
  // Nothing picked yet: show the first card on screen in the side panel.
  const firstShown = view === "list" ? tools[0] : groups[0]?.items[0];
  const current = tools.find((t) => t.slug === selected) ?? firstShown;
  const sheetTool = tools.find((t) => t.slug === sheet);

  function pick(slug: string) {
    onSelect(slug);
    if (window.matchMedia(PHONE).matches) setOpenInline((o) => (o === slug ? null : slug));
    else if (window.matchMedia(TABLET).matches) setSheet(slug);
  }

  if (tools.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyTitle}>Nothing matches that yet.</span>
        <span className={styles.emptyText}>Try a simpler word, or clear the filters to see everything.</span>
        <Button onClick={onClear}>Clear filters</Button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.results}>
        {view === "list" ? (
          <ul className={styles.list} aria-label="Tools">
            {tools.map((t) => (
              <li key={t.slug} className={styles.listItem}>
                <button
                  type="button"
                  className={styles.row}
                  aria-pressed={t.slug === current?.slug}
                  aria-expanded={openInline === t.slug}
                  onClick={() => pick(t.slug)}
                >
                  <span className={styles.rowName}>{t.name}</span>
                  <Badge tone={t.kind} className={styles.rowKind}>
                    {KIND_LABEL[t.kind]}
                  </Badge>
                  <span className={styles.rowShort}>{t.short}</span>
                  <StatusDot status={t.status} label={STATUS_LABEL[t.status]} />
                </button>
                {openInline === t.slug && (
                  <div className={styles.inlineWrap}>
                    <ToolDetail tool={t} variant="inline" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          groups.map((g, gi) => (
            <section key={g.value} className={styles.group} aria-label={g.title || "Tools"}>
              {grouped && (
                <div className={styles.groupHead}>
                  <span className={styles.groupNum}>{String(gi + 1).padStart(2, "0")}</span>
                  <h2 className={styles.groupTitle}>{g.title}</h2>
                  <span className={styles.groupSub}>{g.sub}</span>
                  <span className={styles.groupCount}>
                    {g.items.length} {g.items.length === 1 ? "tool" : "tools"}
                  </span>
                </div>
              )}
              <ul className={styles.grid}>
                {g.items.map((t) => {
                  const open = openInline === t.slug;
                  return (
                    <li key={t.slug} className={`${styles.card} ${t.slug === current?.slug ? styles.cardOn : ""}`}>
                      <button
                        type="button"
                        className={styles.cardMain}
                        aria-pressed={t.slug === current?.slug}
                        aria-expanded={open}
                        onClick={() => pick(t.slug)}
                      >
                        <span className={styles.cardTop}>
                          <span className={styles.mono} data-kind={t.kind} aria-hidden="true">
                            {monogram(t.name)}
                          </span>
                          <span className={styles.kind}>
                            {KIND_LABEL[t.kind]}
                            {t.status === "using" ? (
                              <span className={styles.usesBadge}>{site.author.name} uses this</span>
                            ) : (
                              <StatusDot status={t.status} label={STATUS_LABEL[t.status]} />
                            )}
                          </span>
                        </span>
                        <span className={styles.cardName}>{t.name}</span>
                        <span className={styles.cardShort}>{t.short}</span>
                        <span className={styles.cardFoot}>
                          <span className={styles.cost}>{t.cost}</span>
                          {t.dives.length > 0 && <span className={styles.diveTag}>Deep dive</span>}
                        </span>
                      </button>
                      {open && (
                        <div className={styles.inlineWrap}>
                          <ToolDetail tool={t} variant="inline" />
                        </div>
                      )}
                      <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={open}
                        onClick={() => setOpenInline(open ? null : t.slug)}
                      >
                        {open ? "Show less" : "When to use it"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>

      {current && (
        <aside className={styles.panel} aria-label={`${current.name} details`}>
          <ToolDetail tool={current} variant="panel" />
        </aside>
      )}

      <BottomSheet open={!!sheetTool} onClose={() => setSheet(null)} title={sheetTool ? `${sheetTool.name} details` : "Details"}>
        {sheetTool && <ToolDetail tool={sheetTool} variant="panel" />}
      </BottomSheet>
    </div>
  );
}
