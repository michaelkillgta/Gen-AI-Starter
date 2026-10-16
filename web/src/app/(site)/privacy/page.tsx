import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/layout/PageIntro";
import { Prose } from "@/components/layout/Prose";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = { title: "Privacy", description: "What Field Tested collects and why." };

// TODO(uma): have this reviewed before launch (India's DPDP Act 2023 applies).
export default function PrivacyPage() {
  return (
    <>
      <PageIntro title="Privacy" lead="Short version: I only collect what I need to send you what you asked for." />
      <Prose>
        <p className="note">Last updated: 26 September 2026. Draft, to be reviewed before launch.</p>

        <h2>What I collect</h2>
        <ul>
          <li>
            <strong>Build challenge waitlist:</strong> your name, WhatsApp number and email, so I can send your invite.
          </li>
          <li>
            <strong>New post alerts:</strong> the WhatsApp number or email you give me.
          </li>
          <li>
            <strong>Suggestions and messages:</strong> what you write, and an email if you add one so I can reply.
          </li>
          <li>
            <strong>Your progress in tracks</strong> is saved only in your own browser. It never reaches me.
          </li>
          <li>
            <strong>Your Python course progress</strong> (lessons learned, labs tried, your last lesson and the days you
            studied) is saved in a small cookie called <code>ft_py</code> and in your browser&apos;s storage, for one
            year. It only helps the Python page pick up where you left off. Use &ldquo;Reset my progress&rdquo; on that
            page to clear it.
          </li>
        </ul>

        <h2>What I don&apos;t do</h2>
        <ul>
          <li>I don&apos;t sell or share your details with anyone.</li>
          <li>I don&apos;t show your number or email anywhere on the site.</li>
          <li>I don&apos;t use advertising trackers.</li>
        </ul>

        <h2>Keeping you safe from bots</h2>
        <p>
          Forms use Cloudflare Turnstile to block automated spam, and your IP address is used briefly to limit how often
          a form can be sent. It isn&apos;t stored with your details.
        </p>

        <h2>Removing your details</h2>
        <p>
          Ask any time through the <Link href="/contact">contact form</Link> and I&apos;ll delete your details within 7
          days.
        </p>
      </Prose>
      <SiteFooter variant="slim" message={<>Questions? <Link href="/contact">Contact me</Link></>} />
    </>
  );
}
