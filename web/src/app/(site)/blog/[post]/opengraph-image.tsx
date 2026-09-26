import { getPost } from "@/lib/api";
import { ogCard, ogSize } from "@/lib/og";

export const alt = "Field Tested blog post";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ post: string }> }) {
  const post = await getPost((await params).post);
  return ogCard({ eyebrow: post ? `Blog · ${post.category.label}` : "Blog", title: post?.title ?? "Field Tested" });
}
