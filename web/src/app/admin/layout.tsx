import type { Metadata } from "next";

import { site } from "@/lib/site";
import styles from "./admin.module.css";

// Private: never indexed, never linked from the site, not in the sitemap.
export const metadata: Metadata = {
  title: { default: "Admin", template: `%s · Admin · ${site.name}` },
  robots: { index: false, follow: false, nocache: true },
};

/** A plain shell for the admin area: no site menu, just the name. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <main id="main" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
