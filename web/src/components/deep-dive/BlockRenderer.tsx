import type { ReactNode } from "react";

import type { Block } from "@/lib/api-types/Block";
import { CodeBlock } from "./CodeBlock";
import { Tabs } from "./Tabs";
import { InlineText } from "./InlineText";
import { ZoomImage } from "./ZoomImage";
import styles from "./BlockRenderer.module.css";

const STEP_ID = /^(step|stage|part)-\d+$/;
const isStep = (b: Block) => b.type === "heading" && !!b.id && STEP_ID.test(b.id);

/**
 * Draws a deep dive or blog post body from its typed blocks.
 *
 * `post` (blog posts): article sizes from styles/reading.css, and each
 * numbered step with a picture becomes one row, picture on the left and the
 * step's text on the right on wide screens, stacked on phones.
 */
export function BlockRenderer({ blocks, post = false }: { blocks: Block[]; post?: boolean }) {
  // Headings with an id like "step-3" are numbered steps.
  const stepTotal = blocks.filter(isStep).length;
  const draw = (b: Block, i: number) => renderBlock(b, i, stepTotal);
  if (!post) return <>{blocks.map(draw)}</>;

  const out: ReactNode[] = [];
  for (let i = 0; i < blocks.length; ) {
    const b = blocks[i];
    // A step runs until the next heading of any kind.
    let end = i + 1;
    if (isStep(b)) while (end < blocks.length && blocks[end].type !== "heading") end++;
    const pic = isStep(b) ? blocks.slice(i + 1, end).findIndex((x) => x.type === "image") : -1;
    if (pic < 0) {
      out.push(
        b.type === "image" ? (
          <div key={i} className={styles.wideMedia}>
            {draw(b, i)}
          </div>
        ) : (
          draw(b, i)
        ),
      );
      i++;
      continue;
    }
    const p = i + 1 + pic;
    out.push(
      <section key={i} className={styles.stageRow}>
        <div className={styles.stageHead}>{draw(b, i)}</div>
        <div className={styles.stageMedia}>{draw(blocks[p], p)}</div>
        <div className={styles.stageText}>
          {blocks.slice(i + 1, end).map((x, n) => (i + 1 + n === p ? null : draw(x, i + 1 + n)))}
        </div>
      </section>,
    );
    i = end;
  }
  return <div className={styles.reading}>{out}</div>;
}

function renderBlock(b: Block, i: number, stepTotal: number) {
  switch (b.type) {
    case "paragraph":
      return (
        <p key={i} className={styles.p}>
          <InlineText text={b.text} />
        </p>
      );
    case "heading": {
      const step = b.id ? /^(step|stage|part)-(\d+)$/.exec(b.id) : null;
      if (step) {
        return (
          <h2 key={i} id={b.id ?? undefined} className={`${styles.h2} ${styles.stepHeading}`}>
            <span className={styles.stepBadge} aria-hidden="true">
              {step[2]}
            </span>
            <span className={styles.stepText}>
              <span className={styles.stepOf}>
                {step[1][0].toUpperCase() + step[1].slice(1)} {step[2]} of {stepTotal}
              </span>
              <span className="visually-hidden">: </span>
              {b.text.replace(/^Step \d+:\s*/, "")}
            </span>
          </h2>
        );
      }
      return (
        <h2 key={i} id={b.id ?? undefined} className={styles.h2}>
          {b.text}
        </h2>
      );
    }
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
        // A paragraph reads better in body text than in the big display font.
        <aside key={i} className={b.text.length > 140 ? `${styles.callout} ${styles.calloutLong}` : styles.callout}>
          <span className={styles.calloutLabel}>{b.label}</span>
          <span className={styles.calloutText}>
            <InlineText text={b.text} />
          </span>
        </aside>
      );
    case "code":
      return <CodeBlock key={i} language={b.language} code={b.code} />;
    case "image":
      return <ZoomImage key={i} src={b.src} alt={b.alt} width={b.width} height={b.height} caption={b.caption} />;
    case "video":
      return (
        // The id lets a post link straight to its video ("#video-<id>").
        <figure key={i} id={`video-${b.youtube_id}`} className={styles.video}>
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
          {b.items.map((item, n) => {
            // "3. Create classes" -> badge 3, text "Create classes".
            const m = /^(\d+)\.\s+(.*)$/.exec(item);
            return (
              <li key={item} className={styles.flowStep}>
                <span className={styles.flowNum} aria-hidden="true">
                  {m ? m[1] : n + 1}
                </span>
                <span className={styles.flowText}>
                  <InlineText text={m ? m[2] : item} />
                </span>
              </li>
            );
          })}
          {b.repeat != null && (
            <li className={`${styles.flowStep} ${styles.flowRepeat}`}>
              <span className={styles.flowNum} aria-hidden="true">
                ↺
              </span>
              <span className={styles.flowText}>{b.repeat || "Back to the start"}</span>
            </li>
          )}
        </ol>
      );
    case "lead":
      return (
        <div key={i} className={styles.lead}>
          {b.items.map((line) => (
            <p key={line}>
              <InlineText text={line} />
            </p>
          ))}
        </div>
      );
    case "pull":
      return (
        <p key={i} className={styles.pull}>
          <InlineText text={b.text} />
        </p>
      );
    case "pair":
      return (
        <div key={i} className={styles.pair}>
          {b.items.map((p, n) => (
            <div key={p.text} className={n === b.items.length - 1 ? `${styles.pairItem} ${styles.pairOn}` : styles.pairItem}>
              {p.label && <span className={styles.pairLabel}>{p.label}</span>}
              <span className={styles.pairText}>
                <InlineText text={p.text} />
              </span>
            </div>
          ))}
        </div>
      );
    case "cta": {
      const external = /^https?:/.test(b.href);
      return (
        <p key={i} className={styles.ctaWrap}>
          <a
            href={b.href}
            className={styles.cta}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {b.label}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {external && <span className="visually-hidden"> (opens in a new tab)</span>}
          </a>
        </p>
      );
    }
    case "tabs":
      return (
        <Tabs
          key={i}
          label={b.label}
          titles={b.items.map((t) => t.title)}
          panels={b.items.map((t) => t.blocks.map((x, n) => renderBlock(x, n, stepTotal)))}
        />
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
}
