import type { Block } from "@/lib/api-types/Block";
import { CodeBlock } from "./CodeBlock";
import styles from "./BlockRenderer.module.css";

/** Draws a deep dive or blog post body from its typed blocks. */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "paragraph":
            return (
              <p key={i} className={styles.p}>
                {b.text}
              </p>
            );
          case "heading":
            return (
              <h2 key={i} className={styles.h2}>
                {b.text}
              </h2>
            );
          case "compare":
            return (
              <div key={i} className={styles.compare}>
                {[b.left, b.right].map((side) => (
                  <div key={side.title} className={`${styles.side} ${side.tone === "good" ? styles.good : styles.bad}`}>
                    <span className={styles.sideTitle}>{side.title}</span>
                    <ol className={styles.steps}>
                      {side.steps.map((s) => (
                        <li key={s} className={styles.step}>
                          {s}
                        </li>
                      ))}
                      <li className={`${styles.step} ${styles.result}`}>{side.result}</li>
                    </ol>
                  </div>
                ))}
              </div>
            );
          case "cards":
            return (
              <ul key={i} className={styles.cards}>
                {b.items.map((c) => (
                  <li key={c.title} className={styles.card}>
                    <span className={styles.cardTitle}>{c.title}</span>
                    <span className={styles.cardText}>{c.text}</span>
                  </li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <aside key={i} className={styles.callout}>
                <span className={styles.calloutLabel}>{b.label}</span>
                <span className={styles.calloutText}>{b.text}</span>
              </aside>
            );
          case "code":
            return <CodeBlock key={i} language={b.language} code={b.code} />;
        }
      })}
    </>
  );
}
