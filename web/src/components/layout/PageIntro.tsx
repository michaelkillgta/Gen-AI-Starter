import type { ReactNode } from "react";

import styles from "./PageIntro.module.css";

type Props = {
  title: string;
  lead?: ReactNode;
  /** Right-hand side on desktop (legend, author, CTA); drops below on phone. */
  aside?: ReactNode;
};

/** The big page title block used at the top of every inner page. */
export function PageIntro({ title, lead, aside }: Props) {
  return (
    <section className={`container ${styles.intro}`}>
      <div className={styles.text}>
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
      </div>
      {aside && <div className={styles.aside}>{aside}</div>}
    </section>
  );
}
