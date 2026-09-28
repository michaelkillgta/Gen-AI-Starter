import type { Metadata } from "next";

import { site } from "@/lib/site";

// Private: never indexed, never linked from the site, not in the sitemap.
export const metadata: Metadata = {
  title: { default: "Admin", template: `%s · Admin · ${site.name}` },
  robots: { index: false, follow: false, nocache: true },
};

/** Each admin page brings its own frame: the sign-in card, or the menu and header (AdminShell). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
