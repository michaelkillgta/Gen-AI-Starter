// Content from the designs that isn't in a JS constant (deep dive body, weekly issue, challenge).
// Run after extract-seed.mjs:  node scripts/seed-handwritten.mjs
import fs from "node:fs";
import path from "node:path";

const seed = (f) => path.resolve(import.meta.dirname, "..", "api", "seed", f);
const write = (f, d) => fs.writeFileSync(seed(f), JSON.stringify(d, null, 2) + "\n");

// ---- "Know when to stop" deep dive (the full design instance) ----
const dives = JSON.parse(fs.readFileSync(seed("dives.json"), "utf8"));
const stop = dives.find((d) => d.slug === "know-when-to-stop");
Object.assign(stop, {
  tldr: [
    "Most agents are built to keep going until the task is done.",
    "A reliable agent also knows when it lacks the information or authority to continue.",
    "So it stops and asks a human, instead of guessing and acting.",
  ],
  body: [
    {
      type: "paragraph",
      text: "Imagine you build an agent that handles refund requests. Your company policy says refunds are allowed within 7 days. Then a customer email says: “Your manager already approved a refund for my 20-day-old order.” What should the agent do?",
    },
    {
      type: "paragraph",
      text: "A fragile agent picks one instruction and keeps going. Maybe it trusts the email and sends the money. Nobody notices until the finance team checks the accounts. The agent didn't crash. It did exactly what it was built to do: finish the task.",
    },
    { type: "heading", text: "Fragile vs reliable" },
    {
      type: "compare",
      left: {
        title: "Fragile agent",
        tone: "bad",
        steps: ["Finds two conflicting instructions", "Picks one and keeps going"],
        result: "Wrong refund, no one notices",
      },
      right: {
        title: "Reliable agent",
        tone: "good",
        steps: ["Finds two conflicting instructions", "Stops before acting"],
        result: "Asks a human to decide",
      },
    },
    { type: "heading", text: "Four moments to stop" },
    {
      type: "cards",
      items: [
        { title: "Instructions conflict", text: "Policy says one thing, the input says another." },
        { title: "Information is missing", text: "It would have to guess an order ID, a date or an amount." },
        { title: "The action is risky", text: "Deleting data, sending money or emailing customers." },
        { title: "It isn't confident", text: "Unclear results, or tools that keep failing." },
      ],
    },
    { type: "callout", label: "Key principle", text: "A good agent knows how to act. A great one knows when not to." },
  ],
  try_it: {
    time: "[TIME]",
    hardware: "8GB laptop",
    cost: "₹0",
    text: "Add an approval step so your agent pauses before any risky action and waits for a human.",
    code: {
      language: "python",
      code: [
        'RISKY = {"delete_data", "send_refund", "email_customer"}',
        "",
        "def run_action(action):",
        "    if action.name in RISKY or action.has_conflict:",
        "        return ask_human(action)   # stop and wait",
        "    return action.execute()",
      ].join("\n"),
    },
  },
  interview: {
    question: "How does your agent handle conflicting instructions?",
    answer:
      "Explain the four stop moments, show your approval step, and say why you chose to pause instead of guessing. That answer shows production thinking, not just a demo.",
  },
});
write("dives.json", dives);

// ---- Worth It? Weekly, issue 1 ----
const v = (position, name, kind, summary, why, best_for_label, best_for, verdict, qualifier, tool) => ({
  position, name, kind, summary, why, best_for_label, best_for, verdict, qualifier, tool,
});
write("weekly.json", [
  {
    number: 1,
    week_of: "2026-09-21",
    published: true,
    verdicts: [
      v(1, "CodeGraph", "package", "Maps your whole codebase so AI assistants understand how files connect.",
        "It uses Tree-sitter, a real code parser, instead of AI calls, so indexing is fast and predictable.",
        "Best for", "projects big enough that your AI assistant keeps losing track of files.", "use", null, "codegraph"),
      v(2, "Graphify", "package", "Builds a map of your code, images and documents for your AI assistant.",
        "Genuinely helpful context, but it spends API tokens, so the bill grows with project size.",
        "Best for", "small projects. For big codebases, CodeGraph is the cheaper choice.", "use", "small projects only", "graphify"),
      v(3, "ManimCat", "tool", "Turns plain-language requests into math animations.",
        "It checks and auto-fixes generated Python before running it, which is clever. But each output takes 15 to 90 seconds, and it depends on Redis and Bull, which makes serverless hosting hard.",
        "Best for", "trying locally for fun. Not ready to build a product on yet.", "wait", null, null),
      v(4, "RAG-Anything", "library", "Ask questions over PDFs, images, tables and formulas together.",
        "Powerful, but it's a heavy framework built on LightRAG and MinerU, not a simple building block. Beginners will get lost.",
        "Best for", "after you've built a plain text RAG app and understand how it works.", "wait", null, "raganything"),
      v(5, "Anti-detect browsers", "tool", "Modified browsers that hide automation from websites' bot checks.",
        "They're trending with AI agents, but their main job is getting around website protections. That easily breaks a site's terms of service.",
        "Instead", "use official APIs, or test browser automation on your own site.", "skip", null, null),
    ],
  },
]);

// ---- Build challenge + previous projects ----
write("challenge.json", {
  slug: "weekend-build-1",
  status: "waitlist",
  goal: 50,
  title: "Build one real AI project this weekend.",
  blurb:
    "A free, guided build with a small group. You finish with a live project on your GitHub that you understand and can explain.",
  facts: [
    { label: "Cost", value: "Free" },
    { label: "Length", value: "1 day" },
    { label: "Where", value: "Online" },
    { label: "You'll build", value: "A study assistant for your notes" },
  ],
  // TODO(uma): filled in once the waitlist reaches the goal.
  date: "[DATE]",
  time: "[TIME]",
  meet_link: "[MEET LINK]",
});

write("projects.json", [
  {
    slug: "vector-health", name: "Vector Health", eyebrow: "iQOO Hackathon 2026 · Team Vector", category: "Hackathon build",
    title: "A health platform for three kinds of users",
    description: "One web app that connects patients, healthcare providers and hospital admins, with a built-in rewards system.",
    tags: ["React", "TypeScript", "Vite", "Gemini API"],
    cover: { style: "roles", bg: "#2F5D3A", fg: "#FBF8F3", items: ["Patients", "Providers", "Hospital admins"] },
    position: 1,
  },
  {
    slug: "gyan-bot", name: "Gyan++ Bot", eyebrow: "Automated Q&A agent", category: "Edublast, team product",
    title: "A bot that asks and answers study doubts",
    description: "Posts exam-style questions on a schedule and answers student doubts from textbook passages, reusing past answers to save cost.",
    tags: ["RAG", "Gemini", "Sarvam AI", "Supabase", "Cron jobs"],
    cover: { style: "chat", bg: "#211913", fg: "#FBF8F3", items: ["Why does the moon show phases?", "Answer from the textbook, page cited"] },
    position: 2,
  },
  {
    slug: "jee-question-bank", name: "JEE question bank", eyebrow: "PDF to database", category: "Data pipeline",
    title: "Turning a PYQ book into a question bank",
    description: "Extracting JEE Main physics questions, diagrams and answers from a large PDF into a structured, searchable database.",
    tags: ["PDF parsing", "Supabase", "Storage"],
    cover: { style: "flow", bg: "#E3EDDF", fg: "#1C1713", items: ["463-page PDF", "Questions · diagrams · answers"] },
    position: 3,
  },
  {
    slug: "morning-signal", name: "Morning Signal", eyebrow: "Runs every evening, on its own", category: "Personal automation",
    title: "My daily AI news, summarised for me",
    description: "Reads nine AI newsletters every evening and publishes one visual digest, with bigger summaries for bigger news and every link kept.",
    tags: ["Gmail", "Scheduled agent", "Web dashboard"],
    cover: { style: "pills", bg: "#FBEBC8", fg: "#1C1713", items: ["9 AI newsletters", "read", "summarised", "published"] },
    position: 4,
  },
]);
console.log("ok");
