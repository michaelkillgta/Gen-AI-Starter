import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Blog post" };

export default function BlogPostPage() {
  return <ComingSoon title="Blog post" phase="phase 4 (Blog)" />;
}
