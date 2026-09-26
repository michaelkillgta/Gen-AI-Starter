import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { ToolDetail } from "@/components/toolkit/ToolDetail";
import { Badge } from "@/components/ui";
import { KIND_LABEL } from "@/features/toolkit/filter";
import { getTool, getTools } from "@/lib/api";
import { links } from "@/lib/links";
import styles from "./tool.module.css";

type Props = { params: Promise<{ tool: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getTool((await params).tool);
  if (!tool) return { title: "Tool not found" };
  return { title: `${tool.name}: when to use it`, description: `${tool.short} ${tool.use_when}` };
}

export default async function ToolPage({ params }: Props) {
  const slug = (await params).tool;
  const [tool, all] = await Promise.all([getTool(slug), getTools()]);
  if (!tool) notFound();

  const related = (all?.tools ?? []).filter((t) => t.group === tool.group && t.slug !== tool.slug).slice(0, 4);

  return (
    <>
      <div className={`container ${styles.page}`}>
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <Link href="/toolkit">Toolkit</Link>
          <span aria-hidden="true">/</span>
          <span>{tool.name}</span>
        </nav>
        <article className={styles.article}>
          <Badge tone={tool.kind}>{KIND_LABEL[tool.kind]}</Badge>
          <ToolDetail tool={tool} variant="page" headingLevel="h1" />
        </article>

        {related.length > 0 && (
          <aside className={styles.related} aria-labelledby="related-heading">
            <h2 id="related-heading" className={styles.relatedTitle}>
              More in this area
            </h2>
            <ul className={styles.relatedList}>
              {related.map((t) => (
                <li key={t.slug}>
                  <Link href={links.tool(t.slug)} className={styles.relatedItem}>
                    <span className={styles.relatedName}>{t.name}</span>
                    <span className={styles.relatedShort}>{t.short}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
      <SiteFooter variant="slim" message={<>Missing something useful? <Link href="/suggest?about=tool">Suggest a tool</Link></>} />
    </>
  );
}
