import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Showcase } from "./Showcase";

export const metadata: Metadata = { title: "Style guide", robots: { index: false } };

/** Every shared building block on one page, for review at each screen size. Dev only. */
export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production" && process.env.SHOW_STYLEGUIDE !== "1") notFound();
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <main id="main">
        <Showcase />
      </main>
      <SiteFooter variant="full" />
    </div>
  );
}
