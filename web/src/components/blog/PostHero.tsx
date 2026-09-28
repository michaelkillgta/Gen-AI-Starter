import { ZoomImage } from "@/components/deep-dive/ZoomImage";
import { Avatar, Badge } from "@/components/ui";
import type { Block } from "@/lib/api-types/Block";
import type { PostDetail } from "@/lib/api-types/PostDetail";
import { formatDate } from "@/lib/links";
import { site } from "@/lib/site";
import styles from "./PostHero.module.css";

export type PostStep = { n: number; id: string; title: string; word: "step" | "stage" };

/** Headings with an id like "step-3" or "stage-3" are the post's steps ("Step 3: Choose…" -> "Choose…"). */
export function stepsOf(body: Block[]): PostStep[] {
  return body.flatMap((b) => {
    if (b.type !== "heading" || !b.id) return [];
    const m = /^(step|stage)-(\d+)$/.exec(b.id);
    if (!m) return [];
    return [{ n: Number(m[2]), id: b.id, title: b.text.replace(/^Step \d+:\s*/, ""), word: m[1] as PostStep["word"] }];
  });
}

/**
 * The top block for posts with a cover picture: category, title, summary and
 * byline next to the picture, then the steps as numbered jump links.
 */
export function PostHero({ post }: { post: PostDetail }) {
  const image = post.cover.image!;
  const steps = stepsOf(post.body);
  const word = steps[0]?.word ?? "step";
  const facts = [steps.length > 0 && `${steps.length} ${word}s`, `${post.read_minutes} min read`].filter(Boolean);

  return (
    <header className={styles.hero} style={{ background: post.cover.bg }}>
      <div className={styles.top}>
        <div className={styles.text}>
          <div className={styles.meta}>
            <Badge size="md" colors={{ bg: post.category.bg, fg: post.category.fg }}>
              {post.category.label}
            </Badge>
            <span className={styles.facts} style={{ color: post.cover.fg }}>
              {facts.join(" · ")}
            </span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.lead}>{post.excerpt}</p>
          <span className={styles.byline}>
            <Avatar initial={site.author.initial} size={28} />
            {site.author.name} · {formatDate(post.published_on)}
          </span>
        </div>
        <div className={styles.picture}>
          <ZoomImage src={image.src} alt={image.alt} width={image.width} height={image.height} />
        </div>
      </div>

      {steps.length > 0 && (
        <nav className={styles.steps} aria-label={`Jump to a ${word}`}>
          <span className={styles.stepsLabel} style={{ color: post.cover.fg }}>
            The {steps.length} {word}s
          </span>
          <ol className={styles.stepList}>
            {steps.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={styles.step}>
                  <span className={styles.stepNum} style={{ background: post.cover.fg }}>
                    {s.n}
                  </span>
                  <span className={styles.stepTitle}>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </header>
  );
}

/** "What you'll learn": a short list above the body. */
export function LearnBox({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <aside className={styles.learn} aria-labelledby="learn-title">
      <h2 id="learn-title" className={styles.learnTitle}>
        What you&apos;ll learn
      </h2>
      <ul className={styles.learnList}>
        {items.map((it) => (
          <li key={it}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 8.4l2.6 2.6L12 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
