import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BlockRenderer } from "@/components/deep-dive/BlockRenderer";
import { CodeBlock } from "@/components/deep-dive/CodeBlock";
import { DiveSidebar } from "@/components/deep-dive/DiveSidebar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MarkDone } from "@/components/tracks/ProgressWidgets";
import { Avatar, Badge } from "@/components/ui";
import { getDive } from "@/lib/api";
import { links } from "@/lib/links";
import { site } from "@/lib/site";
import styles from "./dive.module.css";

type Props = { params: Promise<{ track: string; dive: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dive = await getDive((await params).dive);
  if (!dive) return { title: "Deep dive not found" };
  return {
    title: dive.title,
    description: dive.tldr.join(" "),
    openGraph: { type: "article", title: dive.title, description: dive.tldr[0] },
  };
}

export default async function DivePage({ params }: Props) {
  const { track: trackSlug, dive: slug } = await params;
  const dive = await getDive(slug);
  if (!dive) notFound();
  // A dive lives in exactly one track; fix up old or mistyped track addresses.
  if (dive.track.slug !== trackSlug) redirect(links.dive(dive.track.slug, dive.slug));

  const total = dive.track.dives.length;
  const nextHref = dive.next ? links.dive(dive.next.track_slug, dive.next.slug) : undefined;

  return (
    <>
      <div className={`container ${styles.layout}`}>
        <DiveSidebar track={dive.track} current={dive.slug} />

        <article className={styles.article}>
          <header className={styles.head}>
            <Badge tone="dark" size="md">
              Deep dive {dive.position} of {total}
            </Badge>
            <h1 className={styles.title}>{dive.title}</h1>
            <span className={styles.byline}>
              <Avatar initial={site.author.initial} size={28} />
              Written by {site.author.name}, {dive.read_minutes} min read
            </span>
          </header>

          <section className={styles.tldr} aria-label="TL;DR">
            <span className={styles.tldrTitle}>TL;DR</span>
            {dive.tldr.map((line) => (
              <span key={line} className={styles.tldrLine}>
                {line}
              </span>
            ))}
          </section>

          {dive.body.length > 0 ? (
            <BlockRenderer blocks={dive.body} />
          ) : (
            <div className={styles.soon}>
              <strong>The full deep dive is being written.</strong>
              <span>
                The TL;DR above is the core idea. Mark it as done when it clicks, or come back soon for the full
                explanation and a build step.
              </span>
            </div>
          )}

          {dive.try_it && (
            <section className={styles.tryIt} aria-labelledby="try-it">
              <div className={styles.tryHead}>
                <h2 id="try-it" className={styles.tryTitle}>
                  Try it
                </h2>
                <span className={styles.tryMeta}>
                  About {dive.try_it.time}, {dive.try_it.hardware}, {dive.try_it.cost}
                </span>
              </div>
              <p className={styles.tryText}>{dive.try_it.text}</p>
              {dive.try_it.code && <CodeBlock language={dive.try_it.code.language} code={dive.try_it.code.code} />}
              {dive.tools.length > 0 && <ToolsUsed tools={dive.tools} />}
            </section>
          )}
          {!dive.try_it && dive.tools.length > 0 && <ToolsUsed tools={dive.tools} />}

          {dive.interview && (
            <section className={styles.interview} aria-labelledby="interview">
              <h2 id="interview" className={styles.interviewTitle}>
                Interview angle
              </h2>
              <p className={styles.question}>“{dive.interview.question}”</p>
              <p className={styles.answer}>{dive.interview.answer}</p>
            </section>
          )}

          <div className={styles.end}>
            <MarkDone slug={dive.slug} nextHref={nextHref} />
            {dive.next ? (
              <Link href={nextHref!} className={styles.next}>
                <span className={styles.nextLabel}>Next deep dive</span>
                <span className={styles.nextTitle}>{dive.next.title}</span>
              </Link>
            ) : (
              <Link href={links.track(dive.track.slug)} className={styles.next}>
                <span className={styles.nextLabel}>End of the track</span>
                <span className={styles.nextTitle}>Back to {dive.track.name}</span>
              </Link>
            )}
          </div>
          {dive.prev && (
            <Link href={links.dive(dive.prev.track_slug, dive.prev.slug)} className={styles.prev}>
              ← Previous: {dive.prev.title}
            </Link>
          )}
          {dive.blog_post && (
            <span className={styles.alsoOn}>
              Also on the <Link href={links.post(dive.blog_post.slug)}>Blog</Link>.
            </span>
          )}
        </article>
      </div>
      <SiteFooter
        variant="slim"
        message={
          <>
            Questions about this deep dive? <a href={site.social.whatsappChannel}>Ask in the WhatsApp channel</a>
          </>
        }
      />
    </>
  );
}

function ToolsUsed({ tools }: { tools: { slug: string; name: string; kind: "tool" | "library" | "package" | "mcp" }[] }) {
  return (
    <div className={styles.tools}>
      <span>Tools used:</span>
      {tools.map((t) => (
        <Link key={t.slug} href={links.tool(t.slug)} className={`${styles.toolChip} ${styles[t.kind]}`}>
          {t.name}
        </Link>
      ))}
    </div>
  );
}
