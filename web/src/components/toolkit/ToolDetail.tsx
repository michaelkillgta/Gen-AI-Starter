import Link from "next/link";

import { Badge, Button, StatusDot } from "@/components/ui";
import { GROUPS, KIND_LABEL, STATUS_LABEL, monogram } from "@/features/toolkit/filter";
import type { ToolWithDives } from "@/lib/api-types/ToolWithDives";
import { links } from "@/lib/links";
import { site } from "@/lib/site";
import { CopyButton } from "./CopyButton";
import styles from "./ToolDetail.module.css";

type Props = {
  tool: ToolWithDives;
  /** "panel": desktop side panel / bottom sheet. "inline": inside a phone card (no header). "page": /toolkit/[tool]. */
  variant?: "panel" | "inline" | "page";
  headingLevel?: "h1" | "h2" | "h3";
};

/** Everything we say about one tool: what it is, when to use or skip it, how to get it. */
export function ToolDetail({ tool, variant = "panel", headingLevel = "h2" }: Props) {
  const Heading = headingLevel;
  const group = GROUPS.find((g) => g.value === tool.group);
  const blog = tool.posts[0];
  return (
    <div className={`${styles.detail} ${styles[variant]}`}>
      {variant !== "inline" && (
        <div className={styles.head}>
          <span className={styles.mono} data-kind={tool.kind} aria-hidden="true">
            {monogram(tool.name)}
          </span>
          <span className={styles.headText}>
            <Heading className={styles.name}>{tool.name}</Heading>
            <span className={styles.meta}>
              {KIND_LABEL[tool.kind]} · <StatusDot status={tool.status} label={STATUS_LABEL[tool.status]} />
              {STATUS_LABEL[tool.status]}
            </span>
          </span>
        </div>
      )}

      <p className={styles.plain}>{tool.plain}</p>

      <div className={styles.boxes}>
        <div className={styles.use}>
          <span className={styles.boxTitle}>Use it when</span>
          <span>{tool.use_when}</span>
        </div>
        <div className={styles.skip}>
          <span className={styles.boxTitle}>Skip it when</span>
          <span>{tool.skip_when}</span>
        </div>
      </div>

      <dl className={styles.facts}>
        {group && (
          <div>
            <dt>Area</dt>
            <dd>{group.label}</dd>
          </div>
        )}
        <div>
          <dt>Runs on</dt>
          <dd>{tool.runs_on}</dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>{tool.cost}</dd>
        </div>
      </dl>

      <div className={styles.getIt}>
        <span className={styles.label}>Get it</span>
        <div className={styles.codeRow}>
          <code className={styles.code}>{tool.get_it}</code>
          <CopyButton text={tool.get_it} label={`how to get ${tool.name}`} />
        </div>
      </div>

      {/* The tool's main blog post (most specific first). It's Uma's own take, so it sits high up. */}
      {blog && (
        <div className={styles.fromBlog}>
          <span className={styles.label}>From {site.author.name}&rsquo;s blog</span>
          {/* Straight to the post's section about this tool, when it has one. */}
          <Link href={links.post(blog.slug) + (blog.anchor ? `#${blog.anchor}` : "")} className={styles.blogCard}>
            <span className={styles.blogIcon} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                <path
                  d="M10.5 2.5l3 3L6 13H3v-3l7.5-7.5ZM9 4l3 3"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.blogTitle}>{blog.title}</span>
            <svg className={styles.blogArrow} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      )}

      <div className={styles.dives}>
        <span className={styles.label}>Learn it in a deep dive</span>
        {tool.dives.length > 0 ? (
          tool.dives.map((d) => (
            <Link
              key={d.slug}
              href={links.dive(d.track_slug, d.slug)}
              className={styles.dive}
              title={`${d.track_name}, deep dive ${d.position}`}
            >
              <span className={styles.diveTrack}>
                {d.track_name}, deep dive {d.position}
              </span>
              <span className={styles.diveTitle}>{d.title}</span>
            </Link>
          ))
        ) : (
          <span className={styles.soon}>Deep dive coming soon.</span>
        )}
      </div>

      {/* Tools without a blog post yet keep the short note. */}
      {!blog && tool.note && (
        <div className={styles.note}>
          <span className={styles.label}>From my notes</span>
          <span>{tool.note}</span>
        </div>
      )}

      {/* No blog post yet: link to the tool's own page instead. */}
      {!blog && variant === "panel" && (
        <Button href={links.tool(tool.slug)} variant="light" block>
          Open the {tool.name} page
        </Button>
      )}
      {variant === "page" && tool.tags.length > 0 && (
        <div className={styles.tags}>
          {tool.tags.map((t) => (
            <Badge key={t} tone="neutral">
              {t}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
