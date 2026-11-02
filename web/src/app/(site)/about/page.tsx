import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/layout/PageIntro";
import { Prose } from "@/components/layout/Prose";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Avatar } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Who curates GenAI Starter, how tools are chosen, and why nobody pays to be listed.",
};

export default function AboutPage() {
  return (
    <>
      <PageIntro
        title="About GenAI Starter"
        lead="Clear paths, the best resources and real projects for freshers and college students in India."
        aside={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12, fontWeight: 600 }}>
            <Avatar initial={site.author.initial} size={52} />
            {site.author.name}, {site.author.role}
          </span>
        }
      />
      <Prose>
        <p>
          Hi, I&apos;m {site.author.name}. I lead AI work and build AI agents for a living. Every week I see students
          lose days to tools that look great in a demo and fall apart on a normal laptop, or to tutorials that skip the
          part that matters in a real job.
        </p>
        <p>
          GenAI Starter is the site I wish I had when I started: a short list of tools explained in plain words, clear
          tracks so you always know what to learn next, and honest verdicts on the new things everyone is talking about.
        </p>

        <h2 id="how-i-choose">How I choose tools</h2>
        <ul>
          <li>
            <strong>On a normal laptop.</strong> I test on the kind of machine students actually have, not a powerful
            workstation.
          </li>
          <li>
            <strong>On a real task.</strong> Not just the demo. I try it on something a student would build.
          </li>
          <li>
            <strong>No paid placements.</strong> Nobody pays to be listed, and nobody pays for a better verdict.
          </li>
          <li>
            <strong>Labelled honestly.</strong> &ldquo;I use this&rdquo; means I use it in real projects. &ldquo;In my
            notes&rdquo; means I&apos;ve researched it and a hands-on test is coming.
          </li>
        </ul>

        <h2>What&apos;s here</h2>
        <ul>
          <li>
            <Link href="/toolkit">The toolkit</Link>: what each tool does, when to use it, when to skip it.
          </li>
          <li>
            <Link href="/tracks">Tracks</Link>: deep dives in order, from your first AI call to agents that don&apos;t
            break.
          </li>
          <li>
            <Link href="/weekly">Worth It? Weekly</Link>: five new tools a week, judged honestly.
          </li>
          <li>
            <Link href="/challenge">Build challenge</Link>: one real AI project in a weekend, free, with a small group.
          </li>
        </ul>

        <p className="note">
          Spotted a mistake, or a tool I should look at? <Link href="/suggest">Tell me</Link>. Want to run the build
          challenge at your college? <Link href="/contact">Get in touch</Link>.
        </p>
      </Prose>
      <SiteFooter variant="full" />
    </>
  );
}
