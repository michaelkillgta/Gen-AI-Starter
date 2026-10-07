import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostGrid } from "@/components/blog/Blog";
import { LearnBox, PostHero } from "@/components/blog/PostHero";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { SubscribeBox } from "@/components/blog/SubscribeBox";
import { BlockRenderer } from "@/components/deep-dive/BlockRenderer";
import { JsonLd } from "@/components/layout/JsonLd";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Avatar, Badge, Button } from "@/components/ui";
import { getPost } from "@/lib/api";
import { formatDate, links } from "@/lib/links";
import { site } from "@/lib/site";
import styles from "./post.module.css";

type Props = { params: Promise<{ post: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).post);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.published_on },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).post);
  if (!post) notFound();
  const firstHeading = post.body.findIndex((b) => b.type === "heading");
  const intro = firstHeading === -1 ? post.body : post.body.slice(0, firstHeading);
  const rest = firstHeading === -1 ? [] : post.body.slice(firstHeading);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.published_on,
          author: { "@type": "Person", name: site.author.name },
          publisher: { "@type": "Organization", name: site.name },
          url: `${site.url}${links.post(post.slug)}`,
        }}
      />
      <article className={styles.article}>
        <nav
          aria-label="Breadcrumb"
          className={post.cover.image ? styles.crumbs : `${styles.crumbs} ${styles.crumbsNarrow}`}
        >
          <Link href="/blog">Blog</Link>
          <span aria-hidden="true">/</span>
          <Link href={links.category(post.category.slug)}>{post.category.label}</Link>
        </nav>
        {post.cover.image ? (
          // Posts with a cover picture get the big top block (title, picture, steps).
          <PostHero post={post} />
        ) : (
          <>
            <header className={styles.head}>
              <Badge size="md" colors={{ bg: post.category.bg, fg: post.category.fg }}>
                {post.category.label}
              </Badge>
              <h1 className={styles.title}>{post.title}</h1>
              <span className={styles.byline}>
                <Avatar initial={site.author.initial} size={28} />
                {site.author.name} · {formatDate(post.published_on)}
              </span>
            </header>

            <div className={styles.cover} style={{ background: post.cover.bg, color: post.cover.fg }}>
              <span className={styles.coverText}>{post.featured?.stat ?? post.cover.text}</span>
              {post.featured && <span className={styles.coverCaption}>{post.featured.caption}</span>}
            </div>
          </>
        )}

        <div className={post.cover.image ? `${styles.body} ${styles.bodyWide}` : styles.body} id="post-body">
          {post.body.length > 0 && <ReadingProgress target="post-body" />}
          {!post.cover.image && <p className={styles.lead}>{post.excerpt}</p>}
          {/* The intro (everything before the first heading) hooks the reader first;
              "What you'll learn" follows it, then the rest of the post. */}
          {intro.length > 0 && <BlockRenderer blocks={intro} post />}
          <LearnBox items={post.learn} />
          {rest.length > 0 && <BlockRenderer blocks={rest} post />}
          {post.dive ? (
            <div className={styles.diveBox}>
              <span className={styles.diveLabel}>
                This post is a deep dive in the {post.dive.track_name} track
              </span>
              <span className={styles.diveTitle}>{post.dive.title}</span>
              <Button href={links.dive(post.dive.track_slug, post.dive.slug)} variant="dark">
                Read the full deep dive
              </Button>
            </div>
          ) : (
            post.body.length === 0 && (
              <div className={styles.soon}>
                <strong>The full post is on its way.</strong>
                <span>Subscribe below and I&apos;ll message you when it goes live.</span>
              </div>
            )
          )}
        </div>
      </article>

      {post.related.length > 0 && (
        <section className={`container ${styles.related}`} aria-labelledby="related">
          <h2 id="related" className={styles.relatedTitle}>
            Keep reading
          </h2>
          <PostGrid posts={post.related} headingLevel="h3" />
        </section>
      )}
      <SubscribeBox />
      <SiteFooter
        variant="slim"
        message={
          <>
            Want me to write about something? <Link href="/suggest?about=topic">Suggest a topic</Link>
          </>
        }
      />
    </>
  );
}
