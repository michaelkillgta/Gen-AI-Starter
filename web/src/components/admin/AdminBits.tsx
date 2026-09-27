import { site } from "@/lib/site";
import styles from "./AdminBits.module.css";

/** "Field Tested · Admin", without a link back into the site. */
export function AdminMark() {
  return (
    <span className={styles.mark}>
      <span className={styles.logo} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3.5 8.5l2.8 2.8L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={styles.word}>{site.name}</span>
      <span className={styles.tag}>Admin</span>
    </span>
  );
}

export function NotSetUp() {
  return (
    <div className={styles.notice} role="status">
      <strong>Admin not set up yet: run pnpm admin:password</strong>
      <span>
        Run it in a terminal in the <code>field-tested</code> folder, choose a password (at least 12 characters), then
        restart with <code>pnpm dev</code>.
      </span>
    </div>
  );
}

export function Unreachable() {
  return (
    <div className={styles.notice} role="alert">
      <strong>The API isn&apos;t reachable.</strong>
      <span>
        Start everything with <code>pnpm dev</code> in the <code>field-tested</code> folder, then reload this page.
      </span>
    </div>
  );
}
