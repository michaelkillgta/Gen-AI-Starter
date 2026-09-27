import type { Metadata } from "next";

import { AdminMark, NotSetUp, Unreachable } from "@/components/admin/AdminBits";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminStatus } from "@/features/admin/server";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  const status = await getAdminStatus();

  return (
    <div className={styles.center}>
      <div className={styles.loginCard}>
        <AdminMark />
        <h1 className={styles.loginTitle}>Admin sign in</h1>
        {!status ? <Unreachable /> : !status.configured ? <NotSetUp /> : <LoginForm />}
      </div>
    </div>
  );
}
