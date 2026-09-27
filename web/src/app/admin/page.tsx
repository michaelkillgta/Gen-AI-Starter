import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminMark, NotSetUp, Unreachable } from "@/components/admin/AdminBits";
import { AdminTables } from "@/components/admin/AdminTables";
import { adminLogout } from "@/features/admin/actions";
import { getAdminData, getAdminStatus } from "@/features/admin/server";
import { TABLES, rowsOf } from "@/features/admin/tables";
import styles from "./admin.module.css";

export const metadata: Metadata = { title: "Sign-ups and messages" };

export default async function AdminPage() {
  const status = await getAdminStatus();
  if (!status || !status.configured) {
    return (
      <div className={styles.center}>
        <div className={styles.loginCard}>
          <AdminMark />
          <h1 className={styles.loginTitle}>Admin</h1>
          {!status ? <Unreachable /> : <NotSetUp />}
        </div>
      </div>
    );
  }

  const result = await getAdminData();
  if (!result.ok && result.reason === "signed-out") redirect("/admin/login");
  if (!result.ok) {
    return (
      <div className={styles.center}>
        <div className={styles.loginCard}>
          <AdminMark />
          <h1 className={styles.loginTitle}>Admin</h1>
          <Unreachable />
        </div>
      </div>
    );
  }
  const { data } = result;

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <AdminMark />
        <form action={adminLogout}>
          <button type="submit" className={styles.signOut}>
            Sign out
          </button>
        </form>
      </header>

      <div className={styles.head}>
        <h1 className={styles.title}>Sign-ups and messages</h1>
        <p className={styles.lead}>Newest first. Only you can see this page; it isn&apos;t linked from the site.</p>
      </div>

      <ul className={styles.counts} aria-label="Totals">
        {TABLES.map((t) => {
          const n = rowsOf(data, t.key).length;
          return (
            <li key={t.key}>
              <a href={`#${t.key}`} className={styles.count}>
                <span className={styles.countNum}>{n}</span>
                <span className={styles.countLabel}>{t.title}</span>
              </a>
            </li>
          );
        })}
      </ul>

      <AdminTables data={data} />
    </div>
  );
}
