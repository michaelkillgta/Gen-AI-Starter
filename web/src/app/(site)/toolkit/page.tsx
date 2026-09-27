import Link from "next/link";
import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StatusLegend } from "@/components/toolkit/StatusLegend";
import { ToolkitExplorer } from "@/components/toolkit/ToolkitExplorer";
import { Card } from "@/components/ui";
import { isGroup, isKind, isSort, type SortOrder } from "@/features/toolkit/filter";
import { getTools } from "@/lib/api";
import { formatDate } from "@/lib/links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "The toolkit",
  description:
    "Every AI tool, library, package and MCP server I recommend, with all the details on one page: what it does, when to use it, when to skip it, what it costs and how to get it.",
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
        lead={
          <>
            Every tool I recommend, with all the details on one page: what it does, when to use it, when to skip it, what
            it costs and how to get it.
            <span className="trust-line">
              {data?.tools.length ?? 0} tools <span aria-hidden="true">·</span> Last reviewed {formatDate(site.toolkitReviewed)}{" "}
              <span aria-hidden="true">·</span> Nobody pays to be listed
            </span>
          </>
        }
        aside={
          <Card padding="sm">
            <strong style={{ fontSize: 14 }}>What the labels mean</strong>
            <StatusLegend withTested />
          </Card>
        }
      />
      <ToolkitExplorer
        tools={data?.tools ?? []}
        startLists={data?.start_lists ?? []}
        initial={{
          q: one(sp.q) ?? "",
          kind: isKind(type) ? type : "all",
          group: isGroup(track) ? track : "all",
          sort: isSort(one(sp.sort)) ? (one(sp.sort) as SortOrder) : "picks",
        }}
      />
      <SiteFooter variant="slim" message={<>Missing something useful? <Link href="/suggest?about=tool">Suggest a tool</Link></>} />
    </>
  );
}
