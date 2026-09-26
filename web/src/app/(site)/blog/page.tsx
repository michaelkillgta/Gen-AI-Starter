import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/BlogIndex";
import { getPosts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blog",
  description: "An honest perspective on AI for freshers and students: what I'm learning, building, and what you should know.",
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

export default async function BlogPage() {
  const data = await getPosts();
  return <BlogIndex data={data ?? { categories: [], posts: [] }} category={null} />;
}
