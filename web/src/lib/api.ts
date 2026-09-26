import "server-only";

import { connection } from "next/server";

import type { ChallengeResponse } from "./api-types/ChallengeResponse";
import type { DiveDetail } from "./api-types/DiveDetail";
import type { IssueDetail } from "./api-types/IssueDetail";
import type { IssueSummary } from "./api-types/IssueSummary";
import type { PostDetail } from "./api-types/PostDetail";
import type { PostsResponse } from "./api-types/PostsResponse";
import type { ToolWithDives } from "./api-types/ToolWithDives";
import type { ToolsResponse } from "./api-types/ToolsResponse";
import type { TrackDetail } from "./api-types/TrackDetail";
import type { TrackSummary } from "./api-types/TrackSummary";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8080";

/** Content changes rarely; cache API answers for five minutes. */
const REVALIDATE_SECONDS = 300;

export class ApiUnavailableError extends Error {}

/**
 * GET a JSON endpoint from the Rust API. Returns `null` on 404 so pages can call
 * `notFound()`. Pages are rendered per request (so builds don't need the API
 * running), while the fetch itself is cached for REVALIDATE_SECONDS.
 */
async function apiGet<T>(path: string, revalidate = REVALIDATE_SECONDS): Promise<T | null> {
  await connection();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { next: { revalidate, tags: ["content"] } });
  } catch (e) {
    throw new ApiUnavailableError(`API not reachable at ${API_URL}: ${(e as Error).message}`);
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${path} answered ${res.status}`);
  return (await res.json()) as T;
}

export const getTools = () => apiGet<ToolsResponse>("/tools");
export const getTool = (slug: string) => apiGet<ToolWithDives>(`/tools/${encodeURIComponent(slug)}`);

export const getTracks = () => apiGet<TrackSummary[]>("/tracks");
export const getTrack = (slug: string) => apiGet<TrackDetail>(`/tracks/${encodeURIComponent(slug)}`);
export const getDive = (slug: string) => apiGet<DiveDetail>(`/dives/${encodeURIComponent(slug)}`);

export const getIssues = () => apiGet<IssueSummary[]>("/weekly");
export const getLatestIssue = () => apiGet<IssueDetail>("/weekly/latest");
export const getIssue = (n: string) => apiGet<IssueDetail>(`/weekly/${encodeURIComponent(n)}`);

export const getPosts = (category?: string) =>
  apiGet<PostsResponse>(category ? `/posts?category=${encodeURIComponent(category)}` : "/posts");
export const getPost = (slug: string) => apiGet<PostDetail>(`/posts/${encodeURIComponent(slug)}`);

/** The waitlist count changes often, so it is cached for 15 seconds only. */
export const getChallenge = () => apiGet<ChallengeResponse>("/challenge", 15);
