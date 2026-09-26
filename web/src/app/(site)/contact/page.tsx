import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ContactForm } from "@/components/layout/SimpleForms";

export const metadata: Metadata = {
  title: "Contact",
  description: "Run the build challenge at your college, ask a question, or send a correction.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="Get in touch"
        lead="Want to run the build challenge at your college, or have a question? Send a message and I'll reply by email."
      />
      <div className="container" style={{ paddingBottom: 72 }}>
        <ContactForm />
      </div>
      <SiteFooter variant="slim" message="I usually reply within a few days." />
    </>
  );
}
