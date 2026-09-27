import Link from "next/link";
import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/PageIntro";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ToolkitExplorer } from "@/components/toolkit/ToolkitExplorer";
import { Button, Card } from "@/components/ui";
import { isGroup, isKind, isSort, type SortOrder } from "@/features/toolkit/filter";
import { getTools } from "@/lib/api";
import { formatDate } from "@/lib/links";
import { site } from "@/lib/site";
import styles from "./toolkit.module.css";

export const metadata: Metadata = {
  title: "The toolkit",
  description:
    "Every AI tool, library, package and MCP server I recommend. Pick one to see what it does, when to use it, when to skip it, what it costs and how to get it.",
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ToolkitPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const data = await getTools();
  const type = one(sp.type);
  const track = one(sp.track);
  const tool = one(sp.tool);

  return (
    <>
      <PageIntro
        title="The toolkit."
        lead={
          <>
            Every tool I recommend. Pick one to see what it does, when to use it, when to skip it, what it costs and how to
            get it.
            <span className="trust-line">
              {data?.tools.length ?? 0} tools <span aria-hidden="true">·</span> Last reviewed {formatDate(site.toolkitReviewed)}{" "}
              <span aria-hidden="true">·</span> Nobody pays to be listed
            </span>
          </>
        }
        aside={
          <Card padding="md" className={styles.suggest}>
            <strong className={styles.suggestTitle}>Know a tool I should try?</strong>
            <span className={styles.suggestText}>I test it myself. If it&apos;s worth it, it shows up in Worth It? Weekly.</span>
            <Button href="/suggest?about=tool" block>
              Suggest a tool
            </Button>
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
          tool: data?.tools.some((t) => t.slug === tool) ? tool! : null,
        }}
      />
      <SiteFooter variant="slim" message={<>Missing something useful? <Link href="/suggest?about=tool">Suggest a tool</Link></>} />
    </>
  );
}
