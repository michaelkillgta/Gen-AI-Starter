import { getIssues, getPosts } from "@/lib/api";
import { links } from "@/lib/links";
import { site } from "@/lib/site";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS feed of blog posts and Worth It? Weekly issues, newest first. */
export async function GET() {
  const [posts, issues] = await Promise.all([getPosts(), getIssues()]);

  const items = [
    ...(posts?.posts ?? []).map((p) => ({
      title: p.title,
      link: `${site.url}${links.post(p.slug)}`,
      description: p.excerpt,
      date: p.published_on,
      category: p.category.label,
    })),
    ...(issues ?? []).map((i) => ({
      title: `Worth It? Weekly, issue ${i.number}`,
      link: `${site.url}${links.issue(i.number)}`,
      description: `This week: ${i.names.join(", ")}. ${i.tally.use} use, ${i.tally.wait} wait, ${i.tally.skip} skip.`,
      date: i.week_of,
      category: "Worth It? Weekly",
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${site.url}</link>
    <description>${esc(site.description)}</description>
    <language>en-in</language>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${i.link}</link>
      <guid>${i.link}</guid>
      <pubDate>${new Date(`${i.date}T06:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(i.category)}</category>
      <description>${esc(i.description)}</description>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=900" },
  });
}
