import "server-only";

import type { Block } from "@/lib/api-types/Block";
import type { Category } from "@/lib/api-types/Category";
import type { Challenge } from "@/lib/api-types/Challenge";
import type { ChallengeResponse } from "@/lib/api-types/ChallengeResponse";
import type { Dive } from "@/lib/api-types/Dive";
import type { DiveDetail } from "@/lib/api-types/DiveDetail";
import type { DiveRef } from "@/lib/api-types/DiveRef";
import type { IssueDetail } from "@/lib/api-types/IssueDetail";
import type { IssueSummary } from "@/lib/api-types/IssueSummary";
import type { Post } from "@/lib/api-types/Post";
import type { PostDetail } from "@/lib/api-types/PostDetail";
import type { PostSummary } from "@/lib/api-types/PostSummary";
import type { PostsResponse } from "@/lib/api-types/PostsResponse";
import type { Project } from "@/lib/api-types/Project";
import type { StartList } from "@/lib/api-types/StartList";
import type { Tally } from "@/lib/api-types/Tally";
import type { Tool } from "@/lib/api-types/Tool";
import type { ToolWithDives } from "@/lib/api-types/ToolWithDives";
import type { ToolsResponse } from "@/lib/api-types/ToolsResponse";
import type { Track } from "@/lib/api-types/Track";
import type { TrackDetail } from "@/lib/api-types/TrackDetail";
import type { TrackSummary } from "@/lib/api-types/TrackSummary";
import type { WeeklyIssue } from "@/lib/api-types/WeeklyIssue";

import { db } from "./db";

/**
 * Read-only site content: what the Rust API's content endpoints returned, now read
 * straight from the database. Content is small, so each answer loads the tables it
 * needs and joins them up here; lib/api.ts caches the answers.
 *
 * Every function returns null when the thing asked for doesn't exist.
 */

// ---------------------------------------------------------------- table reads

async function loadTools(): Promise<Tool[]> {
  const rows = await db()`
    SELECT t.*, COALESCE(ARRAY(SELECT tag FROM tool_tags g WHERE g.tool_slug = t.slug ORDER BY g.position), '{}') AS tags
    FROM tools t ORDER BY t.position`;
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    kind: r.kind,
    group: r.grp,
    short: r.short,
    plain: r.plain,
    use_when: r.use_when,
    skip_when: r.skip_when,
    runs_on: r.runs_on,
    cost: r.cost,
    get_it: r.get_it,
    status: r.status,
    note: r.note,
    tags: r.tags,
    position: r.position,
  }));
}

async function loadStartLists(): Promise<StartList[]> {
  const rows = await db()`
    SELECT l.slug, l.label,
           COALESCE(ARRAY(SELECT tool_slug FROM start_list_tools s WHERE s.list_slug = l.slug ORDER BY s.position), '{}') AS tools
    FROM start_lists l ORDER BY l.position`;
  return rows.map((r) => ({ slug: r.slug, label: r.label, tools: r.tools }));
}

async function loadTracks(): Promise<Track[]> {
  const rows = await db()`SELECT * FROM tracks ORDER BY position`;
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    who: r.who,
    tone: r.tone,
    blurb: r.blurb,
    start_if: r.start_if,
    duration: r.duration,
    position: r.position,
    stages: r.stages,
    overview: r.overview,
  }));
}

/** Published deep dives, ordered by track then position. */
async function loadDives(): Promise<Dive[]> {
  const rows = await db()`
    SELECT d.*,
           COALESCE(ARRAY(SELECT tool_slug FROM dive_tools x WHERE x.dive_slug = d.slug ORDER BY x.position), '{}') AS tools
    FROM dives d JOIN tracks t ON t.slug = d.track_slug
    WHERE d.published
    ORDER BY t.position, d.position`;
  return rows.map((r) => ({
    slug: r.slug,
    track: r.track_slug,
    stage: r.stage,
    position: r.position,
    title: r.title,
    tldr: r.tldr,
    read_minutes: r.read_minutes,
    tools: r.tools,
    body: r.body,
    try_it: r.try_it,
    interview: r.interview,
    published: r.published,
  }));
}

/** Published issues, newest first. */
async function loadIssues(): Promise<WeeklyIssue[]> {
  const [issues, verdicts] = await Promise.all([
    db()`SELECT number, week_of, published FROM weekly_issues WHERE published ORDER BY number DESC`,
    db()`SELECT * FROM verdicts ORDER BY issue_number, position`,
  ]);
  return issues.map((i) => ({
    number: i.number,
    week_of: i.week_of,
    published: i.published,
    verdicts: verdicts
      .filter((v) => v.issue_number === i.number)
      .map((v) => ({
        position: v.position,
        name: v.name,
        kind: v.kind,
        summary: v.summary,
        why: v.why,
        best_for_label: v.best_for_label,
        best_for: v.best_for,
        verdict: v.verdict,
        qualifier: v.qualifier,
        tool: v.tool_slug,
      })),
  }));
}

async function loadCategories(): Promise<Category[]> {
  const rows = await db()`SELECT * FROM categories ORDER BY position`;
  return rows.map((r) => ({ slug: r.slug, label: r.label, bg: r.bg, fg: r.fg, position: r.position }));
}

/** Posts, newest first. */
async function loadPosts(): Promise<Post[]> {
  const rows = await db()`SELECT * FROM posts ORDER BY published_on DESC, slug`;
  return rows.map((r) => ({
    slug: r.slug,
    category: r.category_slug,
    title: r.title,
    excerpt: r.excerpt,
    cover: r.cover,
    featured: r.featured,
    dive: r.dive_slug,
    body: r.body,
    published_on: r.published_on,
    learn: r.learn,
  }));
}

/** The challenge currently shown on /challenge. */
export async function currentChallenge(): Promise<Challenge> {
  const [r] = await db()`SELECT * FROM challenges WHERE is_current LIMIT 1`;
  if (!r) throw new Error("no current challenge; run `pnpm db:seed`");
  return {
    slug: r.slug,
    status: r.status,
    goal: r.goal,
    title: r.title,
    blurb: r.blurb,
    facts: r.facts,
    date: r.date_text,
    time: r.time_text,
    meet_link: r.meet_link,
  };
}

async function loadProjects(): Promise<Project[]> {
  const rows = await db()`SELECT * FROM past_projects ORDER BY position`;
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    eyebrow: r.eyebrow,
    category: r.category,
    title: r.title,
    description: r.description,
    tags: r.tags,
    cover: r.cover,
    position: r.position,
  }));
}

export async function waitlistCount(challenge: string): Promise<number> {
  const [r] = await db()`SELECT COUNT(*)::int AS n FROM waitlist_signups WHERE challenge_slug = ${challenge}`;
  return r.n;
}

// ---------------------------------------------------------------- reading time

const WORDS_PER_MINUTE = 200;

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
const minutes = (n: number) => Math.max(1, Math.ceil(n / WORDS_PER_MINUTE));

function blocksWords(blocks: Block[]): number {
  return sum(
    blocks.map((b) => {
      switch (b.type) {
        case "paragraph":
        case "heading":
        case "pull":
          return words(b.text);
        // Looking at a picture takes a few seconds; links and videos aren't reading.
        case "image":
          return 20;
        case "video":
        case "links":
        case "cta":
          return 0;
        case "list":
        case "flow":
        case "lead":
          return sum(b.items.map(words));
        case "pair":
          return sum(b.items.map((p) => (p.label ? words(p.label) : 0) + words(p.text)));
        case "table":
          return sum([...b.header, ...b.rows.flat()].map(words));
        case "callout":
          return words(b.label) + words(b.text);
        case "compare":
          return sum([b.left, b.right].map((s) => words(s.title) + sum(s.steps.map(words)) + words(s.result)));
        case "cards":
          return sum(b.items.map((c) => words(c.title) + words(c.text)));
        case "code":
          return words(b.code);
        // Readers usually open the first tab and maybe one more.
        case "tabs":
          return sum(b.items.slice(0, 2).map((t) => words(t.title) + blocksWords(t.blocks)));
      }
    }),
  );
}

/** Reading time: the hand-set value if there is one, otherwise worked out from the text. */
function readMinutes(d: Dive): number {
  if (d.read_minutes !== null) return d.read_minutes;
  let n = sum(d.tldr.map(words)) + blocksWords(d.body);
  if (d.try_it) n += words(d.try_it.text) + (d.try_it.code ? words(d.try_it.code.code) : 0);
  if (d.interview) n += words(d.interview.question) + words(d.interview.answer);
  return minutes(n);
}

function diveRef(d: Dive, tracks: Track[]): DiveRef {
  return {
    slug: d.slug,
    title: d.title,
    position: d.position,
    track_slug: d.track,
    track_name: tracks.find((t) => t.slug === d.track)?.name ?? "",
  };
}

// ---------------------------------------------------------------- tools

/** The id of the post's heading for this tool, when it has one (`id` = the tool's slug). */
function sectionId(p: Post, slug: string): string | null {
  for (const b of p.body) if (b.type === "heading" && b.id === slug) return b.id;
  return null;
}

/** If the post's "Tools used" row links to `href` (e.g. "/toolkit/docling"), how many tools that row lists. */
function toolsUsedCount(p: Post, href: string): number | null {
  for (const b of p.body) {
    if (b.type === "links" && b.label === "Tools used" && b.items.some((i) => i.href === href)) return b.items.length;
  }
  return null;
}

export async function tools(): Promise<ToolsResponse> {
  const [all, tracks, dives, posts, startLists] = await Promise.all([
    loadTools(),
    loadTracks(),
    loadDives(),
    loadPosts(),
    loadStartLists(),
  ]);
  const toolsWithDives: ToolWithDives[] = all.map((tool) => {
    const href = `/toolkit/${tool.slug}`;
    // Most specific first (fewest tools in its "Tools used" row), then newest.
    const matched = posts
      .map((p) => ({ n: toolsUsedCount(p, href), p }))
      .filter((m): m is { n: number; p: Post } => m.n !== null)
      .sort((a, b) => a.n - b.n);
    return {
      ...tool,
      dives: dives.filter((d) => d.tools.includes(tool.slug)).map((d) => diveRef(d, tracks)),
      posts: matched.map(({ p }) => ({ slug: p.slug, title: p.title, anchor: sectionId(p, tool.slug) })),
    };
  });
  return { tools: toolsWithDives, start_lists: startLists };
}

export async function tool(slug: string): Promise<ToolWithDives | null> {
  return (await tools()).tools.find((t) => t.slug === slug) ?? null;
}

// ---------------------------------------------------------------- tracks and deep dives

export async function tracks(): Promise<TrackSummary[]> {
  const [all, dives] = await Promise.all([loadTracks(), loadDives()]);
  return all.map((track) => {
    const mine = dives.filter((d) => d.track === track.slug);
    return {
      ...track,
      dive_count: mine.length,
      first_dive: mine[0]?.slug ?? null,
      stage_count: track.stages.length,
      resource_count: sum(track.stages.map((s) => s.resources.length)),
    };
  });
}

export async function track(slug: string): Promise<TrackDetail | null> {
  const [all, dives] = await Promise.all([loadTracks(), loadDives()]);
  const t = all.find((x) => x.slug === slug);
  if (!t) return null;
  return {
    ...t,
    dives: dives
      .filter((d) => d.track === t.slug)
      .map((d) => ({
        slug: d.slug,
        stage: d.stage,
        position: d.position,
        title: d.title,
        tldr: d.tldr[0] ?? "",
        read_minutes: readMinutes(d),
        has_body: d.body.length > 0,
      })),
  };
}

export async function dive(slug: string): Promise<DiveDetail | null> {
  const [tracks, all, toolList, posts] = await Promise.all([loadTracks(), loadDives(), loadTools(), loadPosts()]);
  const d = all.find((x) => x.slug === slug);
  if (!d) return null;
  const t = tracks.find((x) => x.slug === d.track);
  if (!t) return null;
  const siblings = all.filter((x) => x.track === d.track);
  const idx = Math.max(0, siblings.findIndex((x) => x.slug === d.slug));
  const stage = t.stages.find((s) => s.slug === d.stage);
  const blogPost = posts.find((p) => p.dive === d.slug);
  return {
    slug: d.slug,
    title: d.title,
    position: d.position,
    tldr: d.tldr,
    read_minutes: readMinutes(d),
    body: d.body,
    try_it: d.try_it,
    interview: d.interview,
    tools: d.tools
      .map((s) => toolList.find((x) => x.slug === s))
      .filter((x): x is Tool => x !== undefined)
      .map((x) => ({ slug: x.slug, name: x.name, kind: x.kind })),
    track: {
      slug: t.slug,
      name: t.name,
      tone: t.tone,
      stage_slug: d.stage,
      stage_title: stage?.title ?? "",
      stage_position: stage?.position ?? 0,
      dives: siblings.filter((x) => x.stage === d.stage).map((x) => diveRef(x, tracks)),
    },
    prev: idx > 0 ? diveRef(siblings[idx - 1], tracks) : null,
    next: idx + 1 < siblings.length ? diveRef(siblings[idx + 1], tracks) : null,
    blog_post: blogPost ? { slug: blogPost.slug, title: blogPost.title, anchor: null } : null,
  };
}

// ---------------------------------------------------------------- weekly

function tally(issue: WeeklyIssue): Tally {
  const t: Tally = { use: 0, wait: 0, skip: 0 };
  for (const v of issue.verdicts) t[v.verdict] += 1;
  return t;
}

export async function issues(): Promise<IssueSummary[]> {
  return (await loadIssues()).map((i) => ({
    number: i.number,
    week_of: i.week_of,
    tally: tally(i),
    names: i.verdicts.map((v) => v.name),
  }));
}

/** `number = null` means the latest issue. */
export async function issue(number: number | null): Promise<IssueDetail | null> {
  const all = await loadIssues(); // newest first
  const idx = number === null ? (all.length ? 0 : -1) : all.findIndex((i) => i.number === number);
  if (idx < 0) return null;
  const i = all[idx];
  return {
    ...i,
    tally: tally(i),
    next: idx > 0 ? all[idx - 1].number : null,
    prev: idx + 1 < all.length ? all[idx + 1].number : null,
  };
}

// ---------------------------------------------------------------- blog

function postSummary(p: Post, cats: Category[], dives: Dive[], tracks: Track[]): PostSummary {
  const d = p.dive ? dives.find((x) => x.slug === p.dive) : undefined;
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover: p.cover,
    featured: p.featured,
    category: cats.find((c) => c.slug === p.category) ?? {
      slug: p.category,
      label: p.category,
      bg: "#F3ECE1",
      fg: "#3E352E",
      position: 0,
    },
    published_on: p.published_on,
    has_body: p.body.length > 0 || p.dive !== null,
    read_minutes: minutes(blocksWords(p.body)),
    dive: d ? diveRef(d, tracks) : null,
  };
}

export async function posts(category: string | null): Promise<PostsResponse | null> {
  const [categories, dives, tracks, all] = await Promise.all([loadCategories(), loadDives(), loadTracks(), loadPosts()]);
  if (category !== null && !categories.some((c) => c.slug === category)) return null;
  return {
    categories,
    posts: all.filter((p) => category === null || p.category === category).map((p) => postSummary(p, categories, dives, tracks)),
  };
}

export async function post(slug: string): Promise<PostDetail | null> {
  const [categories, dives, tracks, all] = await Promise.all([loadCategories(), loadDives(), loadTracks(), loadPosts()]);
  const p = all.find((x) => x.slug === slug);
  if (!p) return null;
  const others = all.filter((x) => x.slug !== p.slug);
  const related = [...others.filter((x) => x.category === p.category), ...others.filter((x) => x.category !== p.category)]
    .slice(0, 3)
    .map((x) => postSummary(x, categories, dives, tracks));
  return { ...postSummary(p, categories, dives, tracks), body: p.body, learn: p.learn, related };
}

// ---------------------------------------------------------------- challenge

export async function challenge(): Promise<ChallengeResponse> {
  const [c, projects] = await Promise.all([currentChallenge(), loadProjects()]);
  return { challenge: c, joined: await waitlistCount(c.slug), projects };
}
