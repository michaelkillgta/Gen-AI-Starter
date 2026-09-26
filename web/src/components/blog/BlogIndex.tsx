import Link from "next/link";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Avatar } from "@/components/ui";
import type { PostsResponse } from "@/lib/api-types/PostsResponse";
import { site } from "@/lib/site";
import { CategoryNav, FeaturedPost, PostGrid } from "./Blog";
import styles from "./BlogIndex.module.css";
import { SubscribeBox } from "./SubscribeBox";

/** Shared body of /blog and /blog/category/[category]. */
export function BlogIndex({ data, category }: { data: PostsResponse; category: string | null }) {
  const featured = data.posts.find((p) => p.featured);
  const rest = featured ? data.posts.filter((p) => p !== featured) : data.posts;
  const current = data.categories.find((c) => c.slug === category);

  return (
    <>
      <PageIntro
        title={current ? current.label : "Blog"}
        lead={
          current
            ? `Posts about ${current.label.toLowerCase()}, newest first.`
            : "My honest perspective on AI: what I'm learning, what I'm building, and what I think freshers and students should know before they get lost in the noise."
        }
        aside={
          <div className={styles.author}>
            <Avatar initial={site.author.initial} size={52} />
            <span className={styles.authorText}>
              <strong>Written by {site.author.name}</strong>
              <span>AI lead, builds AI agents for a living</span>
            </span>
          </div>
        }
      />
      <CategoryNav categories={data.categories} current={category} />
      {featured && <FeaturedPost post={featured} />}
      <section className={`container ${styles.posts}`} aria-label="Posts">
        <PostGrid posts={rest} />
      </section>
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
