import type { Metadata } from "next";

import { AdminMark } from "@/components/admin/AdminBits";
import { AdminNotice } from "@/components/admin/AdminShell";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminStatus } from "@/features/admin/server";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  const status = await getAdminStatus();
  if (!status) return <AdminNotice kind="unreachable" />;
  if (!status.configured) return <AdminNotice kind="not-set-up" />;

  return (
    <main id="main" className={styles.center}>
      <div className={styles.loginCard}>
        <AdminMark />
        <h1 className={styles.loginTitle}>Admin sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
