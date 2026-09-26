import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SuggestForm } from "@/components/layout/SimpleForms";

export const metadata: Metadata = {
  title: "Suggest a tool or topic",
  description: "Tell me about a tool to test, a topic to write about, or a mistake to fix.",
};

type Props = { searchParams: Promise<{ about?: string }> };

export default async function SuggestPage({ searchParams }: Props) {
  const about = (await searchParams).about ?? "tool";
  return (
    <>
      <PageIntro
        title="Suggest something"
        lead="A tool I should test, a topic you want explained, or a mistake I should fix. I read every one."
      />
      <div className="container" style={{ paddingBottom: 72 }}>
        <SuggestForm about={about} />
      </div>
      <SiteFooter variant="slim" message="Suggestions shape what I test and write next." />
    </>
  );
}
