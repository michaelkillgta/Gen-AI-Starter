import Link from "next/link";

import styles from "./TrustLine.module.css";

export function TrustLine() {
  return (
    <section className={`container ${styles.wrap}`}>
      <div className={styles.line}>
        <p className={styles.text}>Every pick is explained in plain words. Nobody pays to be listed.</p>
        <Link href="/about#how-i-choose" className={styles.link}>
          How I choose tools
        </Link>
      </div>
    </section>
  );
}
