import { getPosts } from "@/lib/api";
import { json } from "@/server/rest";

/** GET /api/posts, or /api/posts?category=<slug> */
export async function GET(req: Request) {
  const category = new URL(req.url).searchParams.get("category");
  return json(await getPosts(category ?? undefined));
}
