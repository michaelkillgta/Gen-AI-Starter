// One-off: pull the sample content out of the design-canvas files into api/seed/*.json.
// Run: node scripts/extract-seed.mjs   (re-running overwrites the generated files)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const canvas = (f) => fs.readFileSync(path.join(root, "design-canvas", f), "utf8");
const scriptOf = (html) => html.split('data-dc-script')[1].split(">").slice(1).join(">").split("</script>")[0];

function evalConsts(src, names) {
  const body = src.split(/\nclass Component/)[0];
  const ctx = {};
  vm.runInNewContext(body + "\n;globalThis.__out = {" + names.join(",") + "};", ctx);
  return ctx.__out;
}

const slugify = (s) =>
  s.toLowerCase().replace(/[“”"'’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const out = (name, data) => {
  fs.writeFileSync(path.join(root, "api", "seed", name), JSON.stringify(data, null, 2) + "\n");
  console.log("wrote", name);
};

// ---- tools + start lists ----
const main = evalConsts(scriptOf(canvas("Main.dc.html")), ["TK_ITEMS", "TK_DIVES", "HOME_START"]);
const trackSlug = { foundations: "foundations", agents: "agents-that-dont-break", rag: "rag-and-documents", ship: "build-and-ship" };
out(
  "tools.json",
  main.TK_ITEMS.map((t, i) => ({
    slug: t.id,
    name: t.name,
    kind: t.type,
    group: t.track, // toolkit grouping: foundations | rag | agents | ship
    short: t.short,
    plain: t.plain,
    use_when: t.useWhen,
    skip_when: t.skipWhen,
    runs_on: t.runsOn,
    cost: t.cost,
    get_it: t.get,
    status: t.status,
    note: t.note || null,
    tags: t.tags.split(/\s+/).filter(Boolean),
    position: i + 1,
  })),
);
out("start_lists.json", [
  { slug: "new", label: "I'm new to AI", tools: main.HOME_START.new },
  { slug: "project", label: "I'm building a project", tools: main.HOME_START.project },
]);

// ---- tracks + dives ----
const tr = evalConsts(scriptOf(canvas("Tracks.dc.html")), ["TRACKS"]).TRACKS;
const toolsForDive = (title) => (main.TK_DIVES.find((d) => d.t === title) || { tools: [] }).tools;
const tracks = [];
const dives = [];
Object.entries(tr).forEach(([key, t], ti) => {
  const slug = trackSlug[key];
  tracks.push({ slug, name: t.name, who: t.who, tone: t.tone, blurb: t.blurb, start_if: t.startIf, position: ti + 1 });
  t.dives.forEach((d, di) => {
    dives.push({
      slug: slugify(d.t),
      track: slug,
      position: di + 1,
      title: d.t,
      tldr: [d.tldr],
      read_minutes: null,
      tools: toolsForDive(d.t),
      body: [],
      try_it: null,
      interview: null,
      published: true,
    });
  });
});
out("tracks.json", tracks);
out("dives.json", dives);

// ---- blog ----
const blog = evalConsts(scriptOf(canvas("Blog.dc.html")), ["BLOG_CATS", "BLOG_POSTS"]);
const catOrder = ["learning", "agents", "rag", "careers", "ideas", "safety"];
const catSlug = { learning: "learning-with-ai", agents: "agents", rag: "rag-and-documents", careers: "careers", ideas: "ideas", safety: "staying-safe" };
out(
  "categories.json",
  catOrder.map((k, i) => ({ slug: catSlug[k], label: blog.BLOG_CATS[k].label, bg: blog.BLOG_CATS[k].bg, fg: blog.BLOG_CATS[k].fg, position: i + 1 })),
);
const posts = [
  {
    slug: "does-ai-make-you-a-lazy-learner",
    category: "learning-with-ai",
    title: "Does AI make you a lazy learner, or a faster one?",
    excerpt:
      "A study of 52 junior engineers found that how you use AI matters more than whether you use it. Here's what the high learners did differently, and how I'd use AI if I were starting today.",
    cover: { text: "17%", bg: "#211913", fg: "#F2A93B" },
    featured: { stat: "17%", caption: "lower understanding scores for engineers who let AI write their code" },
    dive: null,
    body: [],
    published_on: "2026-09-20",
  },
  ...blog.BLOG_POSTS.map((p, i) => ({
    slug: slugify(p.title),
    category: catSlug[p.cat],
    title: p.title,
    excerpt: p.excerpt,
    cover: { text: p.cover, bg: p.coverBg, fg: p.coverFg },
    featured: null,
    dive: p.href ? "know-when-to-stop" : null,
    body: [],
    published_on: `2026-09-${String(19 - i).padStart(2, "0")}`,
  })),
];
out("posts.json", posts);
