"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { SearchField } from "@/components/ui";
import { contactHref, formatWhen, rowId, tableDef, type Row, type TableKey } from "@/features/admin/tables";
import styles from "./DataTable.module.css";

type Sort = { key: string; dir: "asc" | "desc" };

/**
 * One admin section: search, sortable columns (newest first by default), a
 * row click (or Enter) for all the details, and a CSV download.
 */
export function DataTable({ table, rows, openId }: { table: TableKey; rows: Row[]; openId?: string | null }) {
  const def = tableDef(table);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "created_at", dir: "desc" });
  // Opened straight away when linked from the Overview (?open=<id>).
  const [open, setOpen] = useState<Row | null>(() => (openId ? (rows.find((r) => rowId(r) === openId) ?? null) : null));
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const col = def.columns.find((c) => c.key === sort.key);
    const filtered = needle
      ? rows.filter((r) => def.columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(needle)))
      : rows;
    return [...filtered].sort((a, b) => {
      const x = a[sort.key] ?? "";
      const y = b[sort.key] ?? "";
      const cmp = col?.numeric ? Number(x) - Number(y) : String(x).localeCompare(String(y), "en", { sensitivity: "base" });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, q, sort, def.columns]);

  const plural = (n: number) => `${n} ${n === 1 ? def.single : `${def.single}s`}`;
  const toggle = (key: string) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "created_at" ? "desc" : "asc" }));

  return (
    <section className={styles.section} aria-labelledby={`${table}-title`}>
      <div className={styles.head}>
        <div className={styles.titleWrap}>
          <h1 id={`${table}-title`} className={styles.title}>
            {def.title}
          </h1>
          <span className={styles.count} aria-live="polite">
            {q.trim() ? `${shown.length} of ${plural(rows.length)}` : plural(rows.length)}
          </span>
        </div>
        <a href={`/admin/export/${table}`} className={styles.csv} download>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2.5v7.5M4.8 7 8 10.2 11.2 7M3 13h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download CSV
        </a>
      </div>

      {rows.length > 0 && (
        <div className={styles.tools}>
          <SearchField
            id={`${table}-search`}
            label={`Search ${def.title}`}
            className={styles.search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${def.title.toLowerCase()}`}
          />
          {/* Phones have no column headers to click, so sorting is a menu there. */}
          <label className={styles.sortPick}>
            <span className="visually-hidden">Sort by</span>
            <select
              value={`${sort.key}:${sort.dir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(":");
                setSort({ key, dir: dir as Sort["dir"] });
              }}
            >
              <option value="created_at:desc">Newest first</option>
              <option value="created_at:asc">Oldest first</option>
              {def.columns
                .filter((c) => !c.date && !c.long)
                .map((c) => (
                  <option key={c.key} value={`${c.key}:asc`}>
                    {c.label} (A to Z)
                  </option>
                ))}
            </select>
          </label>
        </div>
      )}

      {rows.length === 0 ? (
        <p className={styles.empty}>{def.empty}</p>
      ) : shown.length === 0 ? (
        <p className={styles.empty}>Nothing matches &ldquo;{q}&rdquo;.</p>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                {def.columns.map((c) => {
                  const on = sort.key === c.key;
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    >
                      <button type="button" className={styles.sortBtn} onClick={() => toggle(c.key)}>
                        {c.label}
                        <span className={on ? styles.arrowOn : styles.arrow} aria-hidden="true">
                          {on && sort.dir === "asc" ? "↑" : "↓"}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr
                  key={rowId(r) + String(r[def.titleKey])}
                  className={styles.row}
                  tabIndex={0}
                  aria-label={`${String(r[def.titleKey] || def.single)}: open details`}
                  onClick={() => setOpen(r)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpen(r);
                    }
                  }}
                >
                  {def.columns.map((c) => {
                    const v = String(r[c.key] ?? "");
                    return (
                      <td key={c.key} data-label={c.label} className={c.long ? styles.long : undefined}>
                        {c.date ? (
                          <time dateTime={v}>{formatWhen(v)}</time>
                        ) : v ? (
                          v
                        ) : (
                          <span className={styles.none}>n/a</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${table}-detail-title`} onClose={() => setOpen(null)}>
        {open && (
          <div className={styles.detail}>
            <div className={styles.detailHead}>
              <div>
                <span className={styles.detailKind}>{def.single}</span>
                <h2 id={`${table}-detail-title`} className={styles.detailTitle}>
                  {String(open[def.titleKey] || def.single)}
                </h2>
              </div>
              <button type="button" className={styles.close} onClick={() => setOpen(null)} autoFocus>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="visually-hidden">Close</span>
              </button>
            </div>
            <dl className={styles.fields}>
              {def.columns.map((c) => {
                const v = String(open[c.key] ?? "");
                const href = c.contact ? contactHref(v, c.contact) : null;
                return (
                  <div key={c.key} className={styles.field}>
                    <dt>{c.label}</dt>
                    <dd>
                      {!v ? (
                        <span className={styles.none}>n/a</span>
                      ) : c.date ? (
                        formatWhen(v)
                      ) : href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                          {v}
                        </a>
                      ) : /^https?:\/\//.test(v) ? (
                        <a href={v} target="_blank" rel="noopener noreferrer">
                          {v}
                        </a>
                      ) : (
                        v
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        )}
      </dialog>
    </section>
  );
}
