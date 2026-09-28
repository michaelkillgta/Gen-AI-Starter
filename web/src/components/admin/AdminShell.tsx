import Link from "next/link";
import type { ReactNode } from "react";

import { adminLogout } from "@/features/admin/actions";
import { TABLES, isThisWeek, rowsOf, type TableKey } from "@/features/admin/tables";
import type { AdminData } from "@/lib/api-types/AdminData";
import { AdminMark, NotSetUp, Unreachable } from "./AdminBits";
import styles from "./AdminShell.module.css";

type Section = "overview" | TableKey;

const ICONS: Record<Section, ReactNode> = {
  overview: <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" strokeWidth="1.5" strokeLinejoin="round" />,
  waitlist: <path d="M8.5 1.5L3.5 9h4l-.8 5.5L12.5 7h-4l0-5.5Z" strokeWidth="1.4" strokeLinejoin="round" />,
  suggestions: (
    <path d="M8 2a4 4 0 0 0-2.5 7.1V11h5V9.1A4 4 0 0 0 8 2ZM6 13.5h4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  subscribers: <path d="M2.5 4h11v8h-11zM2.5 4.5 8 9l5.5-4.5" strokeWidth="1.4" strokeLinejoin="round" />,
  contacts: <path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" strokeWidth="1.4" strokeLinejoin="round" />,
};

function Icon({ name }: { name: Section }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

/**
 * The frame of every signed-in admin page: header with "Signed in" and Sign out,
 * a side menu (tabs on phones) and the page itself.
 */
export function AdminShell({ current, data, children }: { current: Section; data: AdminData; children: ReactNode }) {
  const items: { key: Section; label: string; href: string; count?: number; fresh?: number }[] = [
    { key: "overview", label: "Overview", href: "/admin" },
    ...TABLES.map((t) => {
      const rows = rowsOf(data, t.key);
      return {
        key: t.key,
        label: t.title,
        href: `/admin/${t.key}`,
        count: rows.length,
        fresh: rows.filter((r) => isThisWeek(String(r.created_at))).length,
      };
    }),
  ];

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.home} aria-label="Admin overview">
          <AdminMark />
        </Link>
        <div className={styles.account}>
          <span className={styles.signedIn}>
            <span className={styles.dot} aria-hidden="true" />
            Signed in
          </span>
          <form action={adminLogout}>
            <button type="submit" className={styles.signOut}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.nav} aria-label="Admin sections">
          <ul className={styles.navList}>
            {items.map((it) => {
              const on = it.key === current;
              return (
                <li key={it.key}>
                  <Link
                    href={it.href}
                    aria-current={on ? "page" : undefined}
                    className={on ? `${styles.navLink} ${styles.navOn}` : styles.navLink}
                  >
                    <Icon name={it.key} />
                    <span className={styles.navLabel}>{it.label}</span>
                    {it.count !== undefined && (
                      <span className={styles.navCount}>
                        {it.count}
                        {!!it.fresh && <span className="visually-hidden">, {it.fresh} new this week</span>}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <main id="main" className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}

/** Not set up yet, or the API is down: a single card instead of the dashboard. */
export function AdminNotice({ kind }: { kind: "not-set-up" | "unreachable" }) {
  return (
    <main id="main" className={styles.center}>
      <div className={styles.card}>
        <AdminMark />
        <h1 className={styles.cardTitle}>Admin</h1>
        {kind === "not-set-up" ? <NotSetUp /> : <Unreachable />}
      </div>
    </main>
  );
}
