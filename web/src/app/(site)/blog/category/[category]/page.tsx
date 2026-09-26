import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogIndex } from "@/components/blog/BlogIndex";
import { getPosts } from "@/lib/api";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).category;
  const data = await getPosts(slug);
  const cat = data?.categories.find((c) => c.slug === slug);
  return { title: cat ? `${cat.label} · Blog` : "Blog" };
}

export default async function BlogCategoryPage({ params }: Props) {
  const slug = (await params).category;
  const data = await getPosts(slug);
  if (!data) notFound();
  return <BlogIndex data={data} category={slug} />;
}
