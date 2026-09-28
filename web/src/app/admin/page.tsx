import type { Metadata } from "next";
import Link from "next/link";

import { AdminNotice, AdminShell } from "@/components/admin/AdminShell";
import { loadAdmin } from "@/features/admin/server";
import { TABLES, isThisWeek, rowId, rowsOf, timeAgo } from "@/features/admin/tables";
import styles from "./admin.module.css";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverview() {
  const load = await loadAdmin();
  if (load.kind !== "ok") return <AdminNotice kind={load.kind} />;
  const { data } = load;

  // The newest entries from every section, newest first.
  const latest = TABLES.flatMap((t) =>
    rowsOf(data, t.key).map((row) => ({
      table: t,
      row,
      at: String(row.created_at),
    })),
  )
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  return (
    <AdminShell current="overview" data={data}>
      <div className={styles.page}>
        <div className={styles.head}>
          <h1 className={styles.title}>Overview</h1>
          <p className={styles.lead}>Everything people sent through the site, newest first. Only you can see this.</p>
        </div>

        <ul className={styles.cards} aria-label="Totals">
          {TABLES.map((t) => {
            const rows = rowsOf(data, t.key);
            const fresh = rows.filter((r) => isThisWeek(String(r.created_at))).length;
            return (
              <li key={t.key}>
                <Link href={`/admin/${t.key}`} className={styles.card}>
                  <span className={styles.cardLabel}>{t.title}</span>
                  <span className={styles.cardNum}>{rows.length}</span>
                  <span className={fresh ? `${styles.cardFresh} ${styles.cardFreshOn}` : styles.cardFresh}>
                    {fresh ? `+${fresh} this week` : "None new this week"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <section className={styles.latest} aria-labelledby="latest-title">
          <h2 id="latest-title" className={styles.latestTitle}>
            Latest activity
          </h2>
          {latest.length === 0 ? (
            <p className={styles.empty}>Nothing yet. Sign-ups, suggestions and messages will show up here.</p>
          ) : (
            <ul className={styles.feed}>
              {latest.map(({ table, row, at }) => (
                <li key={table.key + at}>
                  <Link
                    href={`/admin/${table.key}?open=${encodeURIComponent(rowId(row))}`}
                    className={styles.item}
                  >
                    <span className={styles.itemKind} data-kind={table.key}>
                      {table.single}
                    </span>
                    <span className={styles.itemText}>
                      <span className={styles.itemTitle}>{String(row[table.titleKey] || table.single)}</span>
                      <span className={styles.itemSub}>{String(row[table.subKey] ?? "")}</span>
                    </span>
                    <time className={styles.itemTime} dateTime={at}>
                      {timeAgo(at)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
