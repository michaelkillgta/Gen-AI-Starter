import Link from "next/link";
import type { ReactNode } from "react";

import { footerNav, site } from "@/lib/site";
import styles from "./SiteFooter.module.css";

type Props =
  | { variant: "full" }
  /** Inner pages: one line with a page-specific call to action, e.g. "Suggest a tool". */
  | { variant: "slim"; message: ReactNode };

const year = 2026;

export function SiteFooter(props: Props) {
  if (props.variant === "slim") {
    return (
      <footer className={styles.slim}>
        <div className={`container ${styles.slimInner}`}>
          <span className={styles.message}>{props.message}</span>
          <span className={styles.legal}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span>© {year} {site.name}</span>
          </span>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.full}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.brandName}>{site.name}</span>
            <p className={styles.blurb}>
              Clear paths, the best resources and real projects for freshers and college students in India.
            </p>
          </div>
          <div className={styles.columns}>
            <FooterColumn title="Learn" links={footerNav.learn} />
            <FooterColumn title="Follow" links={footerNav.follow} />
            <FooterColumn title="About" links={footerNav.about} />
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© {year} {site.name}</span>
          <span>Made in India</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className={styles.column}>
      <span className={styles.columnTitle}>{title}</span>
      {links.map((l) => (
        <Link key={l.label} href={l.href} className={styles.link}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}
