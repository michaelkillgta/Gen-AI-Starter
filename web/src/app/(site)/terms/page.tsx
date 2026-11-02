import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/layout/PageIntro";
import { Prose } from "@/components/layout/Prose";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = { title: "Terms", description: "The simple rules for using GenAI Starter." };

// TODO(uma): have this reviewed before launch.
export default function TermsPage() {
  return (
    <>
      <PageIntro title="Terms" lead="The simple rules for using GenAI Starter." />
      <Prose>
        <p className="note">Last updated: 26 September 2026. Draft, to be reviewed before launch.</p>

        <h2>Opinions, not guarantees</h2>
        <p>
          Verdicts and recommendations are my honest opinion from testing on a normal laptop. Tools change quickly, so
          check prices, licences and terms on each tool&apos;s own site before you rely on it.
        </p>

        <h2>Using the content</h2>
        <p>
          You&apos;re welcome to learn from, quote and share links to anything here. Code samples in deep dives are free to
          use in your own projects. Please don&apos;t republish whole articles as your own.
        </p>

        <h2>The build challenge</h2>
        <p>
          The build challenge is free. Joining the waitlist doesn&apos;t guarantee a place if more people join than we can
          guide at once; invites go out in the order people joined.
        </p>

        <h2>Links to other sites</h2>
        <p>Tools and resources link to other sites. I&apos;m not responsible for what those sites do with your data.</p>

        <h2>Changes</h2>
        <p>
          If these terms change, the date above changes too. Questions? <Link href="/contact">Get in touch</Link>.
        </p>
      </Prose>
      <SiteFooter variant="slim" message={<>Questions? <Link href="/contact">Contact me</Link></>} />
    </>
  );
}
