import Link from "next/link";
import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { KindExplainer } from "@/components/toolkit/KindExplainer";
import { StatusLegend } from "@/components/toolkit/StatusLegend";
import { ToolkitExplorer } from "@/components/toolkit/ToolkitExplorer";
import { Card } from "@/components/ui";
import { isGroup, isKind } from "@/features/toolkit/filter";
import { getTools } from "@/lib/api";

export const metadata: Metadata = {
  title: "The toolkit",
  description:
    "AI tools, libraries, packages and MCP servers explained in plain words: what each does, when to use it, and when to skip it.",
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ToolkitPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const data = await getTools();
  const type = one(sp.type);
  const track = one(sp.track);

  return (
    <>
      <PageIntro
        title="The toolkit."
        lead="The tools, libraries, packages and MCP servers I'd actually point you to, explained in plain words: what each one does, when to use it, and when to skip it."
        aside={
          <Card padding="sm">
            <strong style={{ fontSize: 14 }}>What the labels mean</strong>
            <StatusLegend withTested />
          </Card>
        }
      />
      <KindExplainer />
      <ToolkitExplorer
        tools={data?.tools ?? []}
        startLists={data?.start_lists ?? []}
        initial={{
          q: one(sp.q) ?? "",
          kind: isKind(type) ? type : "all",
          group: isGroup(track) ? track : "all",
          tool: one(sp.tool) ?? null,
        }}
      />
      <SiteFooter variant="slim" message={<>Missing something useful? <Link href="/suggest?about=tool">Suggest a tool</Link></>} />
    </>
  );
}
