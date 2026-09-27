"use client";

import { useState } from "react";

import { SearchField } from "@/components/ui";
import { TABLES, formatWhen, rowsOf, type Column, type Row } from "@/features/admin/tables";
import type { AdminData } from "@/lib/api-types/AdminData";
import styles from "./AdminTables.module.css";

/** Every admin table: search, a CSV download, a table on wide screens and cards on phones. */
export function AdminTables({ data }: { data: AdminData }) {
  return (
    <div className={styles.tables}>
      {TABLES.map((t) => (
        <DataTable
          key={t.key}
          id={t.key}
          title={t.key === "waitlist" ? `${t.title} (${data.challenge})` : t.title}
          single={t.single}
          empty={t.empty}
          columns={t.columns}
          rows={rowsOf(data, t.key)}
        />
      ))}
    </div>
  );
}

function DataTable(props: { id: string; title: string; single: string; empty: string; columns: Column[]; rows: Row[] }) {
  const { id, title, single, empty, columns, rows } = props;
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? rows.filter((r) => columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(needle)))
    : rows;
  const plural = (n: number) => `${n} ${n === 1 ? single : `${single}s`}`;

  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.head}>
        <div className={styles.titleWrap}>
          <h2 id={`${id}-title`} className={styles.title}>
            {title}
          </h2>
          <span className={styles.count} aria-live="polite">
            {needle ? `${shown.length} of ${plural(rows.length)}` : plural(rows.length)}
          </span>
        </div>
        <div className={styles.tools}>
          {rows.length > 0 && (
            <SearchField
              id={`${id}-search`}
              label={`Search ${title}`}
              className={styles.search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
            />
          )}
          {/* A plain link: the browser downloads the file, the cookie proves who you are. */}
          <a href={`/admin/export/${id}`} className={styles.csv} download>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2.5v7.5M4.8 7 8 10.2 11.2 7M3 13h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download CSV
          </a>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : shown.length === 0 ? (
        <p className={styles.empty}>Nothing matches &ldquo;{q}&rdquo;.</p>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} scope="col">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => {
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
    </section>
  );
}
