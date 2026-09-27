import Link from "next/link";

import styles from "./SuggestRow.module.css";

/** One full-width invitation at the end of the directory. */
export function SuggestRow() {
  return (
    <aside className={styles.suggest} aria-labelledby="suggest-title">
      <span className={styles.suggestPlus} aria-hidden="true">
        +
      </span>
      <div className={styles.suggestText}>
        <h2 id="suggest-title" className={styles.suggestTitle}>
          Missing a tool?
        </h2>
        <p className={styles.suggestBody}>
          Suggest it. I&apos;ll try it myself, and if it&apos;s worth it, you&apos;ll see my verdict in Worth It? Weekly.
        </p>
      </div>
      <div className={styles.suggestLinks}>
        <Link href="/suggest?about=tool" className={styles.suggestMain}>
          Suggest a tool →
        </Link>
        <Link href="/weekly" className={styles.suggestSecondary}>
          See this week&apos;s verdicts
        </Link>
      </div>
    </aside>
  );
}
