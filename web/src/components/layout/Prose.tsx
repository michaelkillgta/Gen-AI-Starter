import type { ReactNode } from "react";

import styles from "./Prose.module.css";

/** Readable long-form text column for About, Privacy and Terms. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className={`container ${styles.wrap}`}><div className={styles.prose}>{children}</div></div>;
}
