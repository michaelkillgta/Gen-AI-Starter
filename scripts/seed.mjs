// Loads the site content from api/seed/*.json into the database (local or Supabase).
// Safe to run again and again: content tables are replaced, form submissions are
// never touched. Runs the migrations first.
//
//   pnpm db:seed
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

import { databaseUrl, root } from "./env.mjs";
import { migrate } from "./migrate.mjs";

const seedDir = path.join(root, "api", "seed");
const read = (file) => JSON.parse(fs.readFileSync(path.join(seedDir, file), "utf8"));

// The seed files leave out empty optional fields; the site expects them present
// (null, false or []), as the Rust API used to fill them in.
const nul = (v) => (v === undefined ? null : v);

function block(b) {
  switch (b.type) {
    case "heading":
      return { ...b, id: nul(b.id) };
    case "image":
    case "video":
      return { ...b, caption: nul(b.caption) };
    case "list":
      return { ...b, ordered: b.ordered ?? false };
    case "flow":
      return { ...b, repeat: nul(b.repeat) };
    case "links":
      return { ...b, label: nul(b.label) };
    case "pair":
      return { ...b, items: b.items.map((i) => ({ ...i, label: nul(i.label) })) };
    case "tabs":
      return { ...b, label: nul(b.label), items: b.items.map((t) => ({ ...t, blocks: t.blocks.map(block) })) };
    default:
      return b;
  }
}
const blocks = (list) => (list ?? []).map(block);

const stage = (s) => ({
  ...s,
  mistakes: s.mistakes ?? [],
  project: { ...s.project, check: nul(s.project.check) },
  resources: s.resources.map((r) => ({ ...r, note: nul(r.note), tool: nul(r.tool) })),
});

export function loadSeed() {
  const tools = read("tools.json").map((t) => ({ ...t, note: nul(t.note) }));
  const tracks = read("tracks.json").map((t) => ({ ...t, overview: nul(t.overview), stages: t.stages.map(stage) }));
  const dives = read("dives.json").map((d) => ({
    ...d,
    read_minutes: nul(d.read_minutes),
    body: blocks(d.body),
    try_it: d.try_it ? { ...d.try_it, code: nul(d.try_it.code) } : null,
    interview: nul(d.interview),
  }));
  const issues = read("weekly.json").map((i) => ({
    ...i,
    verdicts: i.verdicts.map((v) => ({ ...v, qualifier: nul(v.qualifier), tool: nul(v.tool) })),
  }));
  const posts = read("posts.json").map((p) => ({
    ...p,
    cover: { ...p.cover, image: nul(p.cover.image) },
    featured: nul(p.featured),
    dive: nul(p.dive),
    body: blocks(p.body),
    learn: p.learn ?? [],
  }));
  return {
    tools,
    startLists: read("start_lists.json"),
    tracks,
    dives,
    issues,
    categories: read("categories.json"),
    posts,
    challenge: read("challenge.json"),
    projects: read("projects.json"),
  };
}

const json = (v) => (v === null || v === undefined ? null : JSON.stringify(v));

export async function loadIntoDatabase(client, seed) {
  await client.query("BEGIN");
  try {
    for (const table of [
      "verdicts",
      "weekly_issues",
      "posts",
      "categories",
      "dive_tools",
      "dives",
      "tracks",
      "start_list_tools",
      "start_lists",
      "tool_tags",
      "tools",
      "past_projects",
    ]) {
      // Table names come from the fixed list above, never from input.
      await client.query(`DELETE FROM ${table}`);
    }
    for (const t of seed.tools) {
      await client.query(
        `INSERT INTO tools (slug, name, kind, grp, short, plain, use_when, skip_when, runs_on, cost, get_it, status, note, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [t.slug, t.name, t.kind, t.group, t.short, t.plain, t.use_when, t.skip_when, t.runs_on, t.cost, t.get_it, t.status, t.note, t.position],
      );
      for (const [i, tag] of t.tags.entries()) {
        await client.query("INSERT INTO tool_tags (tool_slug, tag, position) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [t.slug, tag, i]);
      }
    }
    for (const [i, l] of seed.startLists.entries()) {
      await client.query("INSERT INTO start_lists (slug, label, position) VALUES ($1, $2, $3)", [l.slug, l.label, i]);
      for (const [j, tool] of l.tools.entries()) {
        await client.query("INSERT INTO start_list_tools (list_slug, tool_slug, position) VALUES ($1, $2, $3)", [l.slug, tool, j]);
      }
    }
    for (const t of seed.tracks) {
      await client.query(
        `INSERT INTO tracks (slug, name, who, tone, blurb, start_if, duration, position, stages, overview)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [t.slug, t.name, t.who, t.tone, t.blurb, t.start_if, t.duration, t.position, json(t.stages), json(t.overview)],
      );
    }
    for (const d of seed.dives) {
      await client.query(
        `INSERT INTO dives (slug, track_slug, position, title, tldr, read_minutes, body, try_it, interview, published, stage)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [d.slug, d.track, d.position, d.title, d.tldr, d.read_minutes, json(d.body), json(d.try_it), json(d.interview), d.published, d.stage],
      );
      for (const [i, tool] of d.tools.entries()) {
        await client.query("INSERT INTO dive_tools (dive_slug, tool_slug, position) VALUES ($1, $2, $3)", [d.slug, tool, i]);
      }
    }
    for (const i of seed.issues) {
      await client.query("INSERT INTO weekly_issues (number, week_of, published) VALUES ($1, $2, $3)", [i.number, i.week_of, i.published]);
      for (const v of i.verdicts) {
        await client.query(
          `INSERT INTO verdicts (issue_number, position, name, kind, summary, why, best_for_label, best_for, verdict, qualifier, tool_slug)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [i.number, v.position, v.name, v.kind, v.summary, v.why, v.best_for_label, v.best_for, v.verdict, v.qualifier, v.tool],
        );
      }
    }
    for (const c of seed.categories) {
      await client.query("INSERT INTO categories (slug, label, bg, fg, position) VALUES ($1,$2,$3,$4,$5)", [c.slug, c.label, c.bg, c.fg, c.position]);
    }
    for (const p of seed.posts) {
      await client.query(
        `INSERT INTO posts (slug, category_slug, title, excerpt, cover, featured, dive_slug, body, published_on, learn)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [p.slug, p.category, p.title, p.excerpt, json(p.cover), json(p.featured), p.dive, json(p.body), p.published_on, json(p.learn)],
      );
    }
    const c = seed.challenge;
    // Challenges are upserted, never deleted: waitlist signups point at them.
    await client.query("UPDATE challenges SET is_current = FALSE WHERE slug <> $1", [c.slug]);
    await client.query(
      `INSERT INTO challenges (slug, status, goal, title, blurb, facts, date_text, time_text, meet_link, is_current)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE)
       ON CONFLICT (slug) DO UPDATE SET status = EXCLUDED.status, goal = EXCLUDED.goal, title = EXCLUDED.title,
         blurb = EXCLUDED.blurb, facts = EXCLUDED.facts, date_text = EXCLUDED.date_text,
         time_text = EXCLUDED.time_text, meet_link = EXCLUDED.meet_link, is_current = TRUE`,
      [c.slug, c.status, c.goal, c.title, c.blurb, json(c.facts), c.date, c.time, c.meet_link],
    );
    for (const p of seed.projects) {
      await client.query(
        `INSERT INTO past_projects (slug, name, eyebrow, category, title, description, tags, cover, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [p.slug, p.name, p.eyebrow, p.category, p.title, p.description, p.tags, json(p.cover), p.position],
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const seed = loadSeed();
  const client = new pg.Client({ connectionString: databaseUrl() });
  await client.connect();
  try {
    await migrate(client);
    if (process.argv.includes("--test-reset")) {
      // The browser tests start from an empty test database. Never on a real one.
      const { rows } = await client.query("SELECT current_database() AS name");
      if (!rows[0].name.endsWith("_test")) throw new Error(`--test-reset only runs on a *_test database, not ${rows[0].name}`);
      await client.query(
        "TRUNCATE waitlist_signups, subscribers, suggestions, contact_messages, admin_sessions, admin_login_fails, form_hits",
      );
    }
    await loadIntoDatabase(client, seed);
    console.log(
      `seeded: ${seed.tools.length} tools, ${seed.tracks.length} tracks, ${seed.dives.length} dives, ` +
        `${seed.issues.length} issues, ${seed.posts.length} posts, ${seed.projects.length} projects`,
    );
  } finally {
    await client.end();
  }
}
