import Link from "next/link";

import { Badge } from "@/components/ui";
import type { Category } from "@/lib/api-types/Category";
import type { PostSummary } from "@/lib/api-types/PostSummary";
import { formatDate, links } from "@/lib/links";
import styles from "./Blog.module.css";

/** Category filter as links, so each category has its own address. */
export function CategoryNav({ categories, current }: { categories: Category[]; current: string | null }) {
  const items = [{ slug: null as string | null, label: "All posts" }, ...categories];
  return (
    <nav className={`container ${styles.catsWrap}`} aria-label="Blog topics">
      <ul className={styles.cats}>
        {items.map((c) => {
          const on = c.slug === current;
          return (
            <li key={c.slug ?? "all"}>
              <Link
                href={c.slug ? links.category(c.slug) : "/blog"}
                aria-current={on ? "page" : undefined}
                className={on ? `${styles.cat} ${styles.catOn}` : styles.cat}
                scroll={false}
              >
                {c.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <section className={`container ${styles.featuredWrap}`} aria-label="Featured post">
      <Link href={links.post(post.slug)} className={styles.featured}>
        <div className={styles.featuredStat}>
          <span className={styles.featuredEyebrow}>Featured</span>
          <span className={styles.stat}>{post.featured?.stat ?? post.cover.text}</span>
          {post.featured && <span className={styles.statCaption}>{post.featured.caption}</span>}
        </div>
        <div className={styles.featuredBody}>
          <Badge size="md" colors={{ bg: post.category.bg, fg: post.category.fg }}>
            {post.category.label}
          </Badge>
          <h2 className={styles.featuredTitle}>{post.title}</h2>
          <p className={styles.featuredExcerpt}>{post.excerpt}</p>
          <span className={styles.readMore}>Read the post</span>
        </div>
      </Link>
    </section>
  );
}

export function PostCard({ post, headingLevel = "h2" }: { post: PostSummary; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <Link href={links.post(post.slug)} className={styles.card}>
      <div className={styles.cover} style={{ background: post.cover.bg, color: post.cover.fg }} aria-hidden="true">
        <span className={styles.coverText}>{post.cover.text}</span>
      </div>
      <div className={styles.cardBody}>
        <Badge colors={{ bg: post.category.bg, fg: post.category.fg }}>{post.category.label}</Badge>
        <H className={styles.cardTitle}>{post.title}</H>
        <p className={styles.cardExcerpt}>{post.excerpt}</p>
        <span className={styles.cardDate}>{formatDate(post.published_on)}</span>
      </div>
    </Link>
  );
}

export function PostGrid({ posts, headingLevel }: { posts: PostSummary[]; headingLevel?: "h2" | "h3" }) {
  if (!posts.length) {
    return <div className={styles.empty}>No posts in this topic yet. New posts are on the way.</div>;
  }
  return (
    <ul className={styles.grid}>
      {posts.map((p) => (
        <li key={p.slug}>
          <PostCard post={p} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
