import "server-only";

import { unstable_cache } from "next/cache";
import { connection } from "next/server";

import * as content from "@/server/content";

/**
 * Site content for the pages, read from the database (src/server/content.ts).
 * Returns `null` when something doesn't exist so pages can call `notFound()`.
 * Pages are rendered per request (so builds don't need the database), while the
 * answers themselves are cached for REVALIDATE_SECONDS.
 */

/** Content changes rarely; cache answers for five minutes. */
const REVALIDATE_SECONDS = 300;

function cached<A extends unknown[], T>(
  name: string,
  fn: (...args: A) => Promise<T>,
  revalidate = REVALIDATE_SECONDS,
  tags: string[] = [],
) {
  const load = unstable_cache(fn, ["content", name], { revalidate, tags: ["content", ...tags] });
  return async (...args: A): Promise<T> => {
    await connection();
    return load(...args);
  };
}

export const getTools = cached("tools", content.tools);
export const getTool = cached("tool", content.tool);

export const getTracks = cached("tracks", content.tracks);
export const getTrack = cached("track", content.track);
export const getDive = cached("dive", content.dive);

export const getIssues = cached("issues", content.issues);
export const getLatestIssue = cached("latest-issue", () => content.issue(null));
export const getIssue = cached("issue", async (n: string) => (/^\d+$/.test(n) ? content.issue(Number(n)) : null));

export const getPosts = cached("posts", (category?: string) => content.posts(category ?? null));
export const getPost = cached("post", content.post);

/** The waitlist count changes often, so it is cached for 15 seconds only. */
export const getChallenge = cached("challenge", content.challenge, 15, ["challenge"]);
