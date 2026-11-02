import { site } from "@/lib/site";
import styles from "./AdminBits.module.css";

/** "GenAI Starter · Admin", without a link back into the site. */
export function AdminMark() {
  return (
    <span className={styles.mark}>
      <span className={styles.logo} aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none">
          <path d="M6.75 10.5L12.25 16L6.75 21.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20.75 10C21.35 14.5 22.25 15.4 26.75 16C22.25 16.6 21.35 17.5 20.75 22C20.15 17.5 19.25 16.6 14.75 16C19.25 15.4 20.15 14.5 20.75 10Z" fill="currentColor" />
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
        Run it in a terminal in the <code>field-tested</code> folder and choose a password (at least 12 characters), then
        restart the site. On Vercel, add the hash it prints as <code>ADMIN_PASSWORD_HASH</code> and redeploy.
      </span>
    </div>
  );
}

export function Unreachable() {
  return (
    <div className={styles.notice} role="alert">
      <strong>The database isn&apos;t reachable.</strong>
      <span>
        Locally, start it with <code>pnpm dev</code> in the <code>field-tested</code> folder. On Vercel, check{" "}
        <code>DATABASE_URL</code>. Then reload this page.
      </span>
    </div>
  );
}
