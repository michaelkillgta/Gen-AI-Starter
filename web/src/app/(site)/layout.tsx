import { SiteHeader } from "@/components/layout/SiteHeader";
import styles from "./layout.module.css";

/** Shared shell for every public page. Each page renders its own footer variant. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
