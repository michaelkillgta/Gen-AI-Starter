import type { Block } from "@/lib/api-types/Block";
import { CodeBlock } from "./CodeBlock";
import { InlineText } from "./InlineText";
import { ZoomImage } from "./ZoomImage";
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
                <InlineText text={b.text} />
              </p>
            );
          case "heading":
            return (
              <h2 key={i} id={b.id ?? undefined} className={styles.h2}>
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
          case "image":
            return <ZoomImage key={i} src={b.src} alt={b.alt} width={b.width} height={b.height} caption={b.caption} />;
          case "video":
            return (
              <figure key={i} className={styles.video}>
                <div className={styles.videoFrame}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.youtube_id)}?rel=0`}
                    title={b.title}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                {b.caption && <figcaption className={styles.videoCaption}>{b.caption}</figcaption>}
              </figure>
            );
          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag key={i} className={styles.list}>
                {b.items.map((item) => (
                  <li key={item}>
                    <InlineText text={item} />
                  </li>
                ))}
              </Tag>
            );
          }
          case "flow":
            return (
              <ol key={i} className={styles.flow}>
                {b.items.map((item) => (
                  <li key={item} className={styles.flowStep}>
                    <InlineText text={item} />
                  </li>
                ))}
              </ol>
            );
          case "links":
            return (
              <nav key={i} className={styles.links} aria-label={b.label ?? "Links"}>
                {b.label && <span className={styles.linksLabel}>{b.label}</span>}
                <ul className={styles.linkRow}>
                  {b.items.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className={styles.linkPill}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            );
        }
      })}
    </>
  );
}
