import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

// Fixed pages for now. Tools, deep dives, posts and issues are added from the API in phase 6.
const staticPaths = [
  "/", "/toolkit", "/tracks", "/weekly", "/weekly/archive", "/challenge", "/blog",
  "/about", "/suggest", "/contact", "/privacy", "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPaths.map((path) => ({ url: `${site.url}${path}` }));
}
