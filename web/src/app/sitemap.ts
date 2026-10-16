import type { MetadataRoute } from "next";

import { getIssues, getPosts, getTools, getTrack, getTracks } from "@/lib/api";
import { links } from "@/lib/links";
import { site } from "@/lib/site";

const staticPaths = [
  "/", "/toolkit", "/tracks", "/weekly", "/weekly/archive", "/challenge", "/blog", "/python",
  "/about", "/suggest", "/contact", "/privacy", "/terms",
];

/** Every public page, built from the API so new content appears automatically. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: `${site.url}${path}`,
    ...(lastModified ? { lastModified } : {}),
  });

  const [tools, tracks, issues, posts] = await Promise.all([getTools(), getTracks(), getIssues(), getPosts()]);
  const trackDetails = await Promise.all((tracks ?? []).map((t) => getTrack(t.slug)));

  return [
    ...staticPaths.map((p) => url(p)),
    ...(tools?.tools ?? []).map((t) => url(links.tool(t.slug))),
    ...(tracks ?? []).map((t) => url(links.track(t.slug))),
    ...trackDetails.flatMap((t) => (t ? t.dives.map((d) => url(links.dive(t.slug, d.slug))) : [])),
    ...(issues ?? []).map((i) => url(links.issue(i.number), i.week_of)),
    ...(posts?.categories ?? []).map((c) => url(links.category(c.slug))),
    ...(posts?.posts ?? []).map((p) => url(links.post(p.slug), p.published_on)),
  ];
}
