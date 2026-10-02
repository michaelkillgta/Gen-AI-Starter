"""Adds (or updates) Uma's post "Hivemind: What If Your Coding Agents Could Learn From Each Other?" in
api/seed/posts.json, with her 4 visuals in web/public/blog/hivemind/ (converted to WebP by hand on 3 Oct 2026).

Text: Uma's draft rewritten in plain prose. Facts checked on 3 Oct 2026 against Activeloop's README: Apache 2.0;
captures prompts, tool calls and responses as traces in Deeplake (cloud-backed, or your own bucket); codifies
patterns into SKILL.md files; propagates them across agents; supports Claude Code, OpenClaw, Codex, Cursor,
Hermes and pi (Claude Cowork in alpha). Install: npm i -g @deeplake/hivemind && hivemind install.
Run from the repo root:  python scripts/seed-post-hivemind.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/hivemind"
SIZE = (1672, 941)
ROUTER_POST = "/blog/llm-routers-model-routing"
REPO = "https://github.com/activeloopai/hivemind"
README = "https://github.com/activeloopai/hivemind/blob/main/README.md"
ARCH = "https://github.com/activeloopai/hivemind/blob/main/docs/ARCHITECTURE.md"
GRAPH_SKILL = "https://github.com/activeloopai/hivemind/blob/main/harnesses/claude-code/skills/hivemind-graph/SKILL.md"
ILLUSTRATION = "An illustration of the idea; the app screens are mock-ups."


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, caption=None, size=SIZE):
    return {"type": "image", "src": f"{IMG}/{name}.webp", "alt": alt, "width": size[0], "height": size[1],
            "caption": caption}


def ul(*items):
    return {"type": "list", "ordered": False, "items": list(items)}


def flow(*items, repeat=None):
    return {"type": "flow", "items": list(items), "repeat": repeat}


def code(text, language="text"):
    return {"type": "code", "language": language, "code": text}


def box(label, text):
    return {"type": "callout", "label": label, "text": text}


def takeaway(text):
    return box("Takeaway", text)


def pair(*items):
    return {"type": "pair", "items": [{"label": a, "text": b} for a, b in items]}


BIG_IDEA = ("==Agent== = does the work. ==Skill== = reusable guidance. ==Hivemind== = helps agents share useful "
            "experience, so it compounds instead of vanishing after each session.")

COVER_ALT = (
    "Hivemind, agents learning together: coding agents such as Codex, Cursor and Claude Code are connected through "
    "Hivemind, which turns useful experience from one agent's work into reusable skills the others can use."
)

BODY = [
    *p("You're building a website. You use ==Codex== to fix a nasty login bug. It digs through the project, tries a "
       "few things, fixes it and checks everything works.",
       "A few days later you open ==Claude Code== for another part of the same project, and hit a weirdly similar "
       "problem. Wouldn't it be nice if Claude Code could ==benefit from what Codex already figured out==?",
       "That's the idea behind Hivemind."),
    box("The one idea to remember", BIG_IDEA),

    h("So what is Hivemind?", "part-1"),
    img("learning-together", COVER_ALT, ILLUSTRATION),
    *p(f"[Hivemind]({REPO}) is an open-source project from Activeloop that ==connects the coding agents you "
       "already use== and turns useful experience from their work into something reusable.",
       "It isn't another coding agent. It doesn't replace Codex, Cursor or Claude Code. It ==works around them==, "
       "as a shared layer for agent experience:"),
    flow("Codex, Cursor, Claude Code", "Hivemind", "Useful experience", "Reusable skills", "Future agent work"),
    *p("Right now it supports Claude Code, OpenClaw, Codex, Cursor, Hermes and pi, with Claude Cowork in alpha."),
    takeaway("Hivemind doesn't do the coding. It helps agents remember what worked."),

    h("How it actually works", "part-2"),
    img("agent-work",
        "Hivemind, from agent work to reusable experience in four steps: capture what the agent did, codify useful "
        "patterns into skills, propagate those skills to other agents, and let the experience compound over time.",
        ILLUSTRATION, size=(2048, 768)),
    *p("Say Codex solves a tricky problem. Hidden in that work there might be a useful pattern, like: \"When this "
       "kind of deployment fails, check these config files first.\" Hivemind describes four steps:"),
    {"type": "cards", "items": [
        {"title": "1. Capture", "text": "It records each session's prompts, tool calls and responses as structured "
                                        "traces."},
        {"title": "2. Codify", "text": "Repeated useful patterns become reusable skills, saved as SKILL.md files."},
        {"title": "3. Propagate", "text": "Those skills reach the other connected agents, across sessions, "
                                          "teammates and machines."},
        {"title": "4. Compound", "text": "Every session adds a bit more, so the whole setup gets sharper over time."},
    ]},
    box("Worth knowing", "Capture means your agents' prompts and responses are stored. By default that's in "
                         "Activeloop's Deeplake cloud (you sign in when you install), or you can keep it in your own "
                         "storage bucket. Check that fits your project before turning it on."),
    takeaway("Capture, codify, propagate, compound."),

    h("Here's the interesting part", "part-3"),
    img("one-learns",
        "One agent learns, another benefits: Codex solves a problem, Hivemind captures the useful pattern as a "
        "skill, and later Claude Code uses that skill on a similar problem.", ILLUSTRATION),
    *p("Picture three developers on one team, each using a different agent:"),
    ul("**Developer 1 (Codex)** cracks a hard database migration problem.",
       "**Developer 2 (Cursor)** later runs into a similar migration issue.",
       "**Developer 3 (Claude Code)** hits a related problem."),
    *p("Without shared experience, each agent ==starts from scratch==. With Hivemind, useful knowledge from earlier "
       "work can reach the others.",
       "The agents still do their own work. They're just ==no longer isolated== from experience earned elsewhere."),
    takeaway("One agent learns, the whole team gets sharper."),

    h("Is Hivemind an AI router?", "part-4"),
    img("vs-router",
        "Hivemind versus an LLM router. An LLM router asks which model should answer a request and sends it to a "
        "fast, reasoning or research model. Hivemind asks what useful experience from earlier agent work can help "
        "with a new task, and gives the agent that experience to use and verify.", ILLUSTRATION),
    *p(f"No, and the difference matters. An [LLM router]({ROUTER_POST}) asks: ==\"Which model should answer this "
       "request?\"=="),
    flow("Request", "Router", "Fast, reasoning or research model"),
    *p("Hivemind asks something else: ==\"What useful experience from earlier agent work can help here?\"=="),
    flow("New task", "Coding agent", "Hivemind", "Useful past experience", "Agent continues and verifies"),
    pair(("LLM router", "Picks the model."), ("Hivemind", "Brings the experience.")),
    takeaway("Different problem, different tool."),

    h("What are skills?", "part-5"),
    *p("A ==skill== is reusable guidance that helps an agent do one kind of work well, like authentication "
       "debugging, database migrations, testing, deployment or security checks.",
       "Instead of an agent rediscovering the same process again and again, that experience becomes guidance it "
       f"can reuse. Hivemind stores these as SKILL.md files. Here's [a real one from the project]({GRAPH_SKILL}): it "
       "teaches agents to query a graph of your codebase."),
    takeaway("A skill is a lesson an agent doesn't have to learn twice."),

    h("One important rule", "part-6"),
    box("Previous experience isn't automatically the truth",
        "If Codex solved something last week, Claude Code shouldn't blindly copy it today. The code may have "
        "changed, dependencies may be different, or the problem may only look similar. So: ==use the experience, "
        "investigate, verify, then act==."),
    *p("That's what makes shared experience ==useful instead of dangerous copy-paste memory==."),
    takeaway("Past experience is a hint, not an answer."),

    h("Where each tool fits", "part-7"),
    {"type": "cards", "items": [
        {"title": "Codex", "text": "OpenAI's coding agent that works on your project"},
        {"title": "Cursor", "text": "An AI-powered code editor"},
        {"title": "Claude Code", "text": "Anthropic's coding agent for local development"},
        {"title": "Skill", "text": "Reusable instructions for a kind of task"},
        {"title": "Hivemind", "text": "Helps useful experience and skills move between supported agents"},
    ]},
    box("Remember", BIG_IDEA),

    h("The idea in one sentence", "part-8"),
    *p("Hivemind helps your coding agents stop working like ==isolated developers== and start benefiting from what "
       "the agents around them have learned.",
       "One agent learns something useful. It becomes a reusable skill. Another agent benefits. Over time, your AI "
       "coding workflow's experience ==compounds instead of disappearing after each session==."),
    *p("To try it, the README's install is one line:"),
    code("npm i -g @deeplake/hivemind && hivemind install", "bash"),
    *p(f"**Also read:** [LLM Routers: Why Your AI App Doesn't Need One Model for Everything]({ROUTER_POST}), the "
       "tool people most often confuse with this one."),

    h("References"),
    ul(f"[Hivemind on GitHub]({REPO}): Activeloop's project, with supported agents, the capture, codify, propagate, "
       "compound loop, skills and setup.",
       f"[Hivemind README]({README}): how traces are captured, how patterns become SKILL.md files and how skills "
       "spread to connected agents.",
       f"[Hivemind architecture]({ARCH}): how it plugs into Codex, Cursor, Claude Code, OpenClaw and others through "
       "hooks, plugins and extensions.",
       f"[Hivemind graph skill]({GRAPH_SKILL}): a real example skill that lets agents query a codebase graph.",
       "[HiveMind in our Toolkit](/toolkit/hivemind): our quick verdict."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [{"label": "HiveMind", "href": "/toolkit/hivemind"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "hivemind-coding-agents-share-experience",
    "category": "agents",
    "title": "Hivemind: What If Your Coding Agents Could Learn From Each Other?",
    "excerpt": "Codex fixes a bug, then Claude Code hits the same one next week and starts from zero. Hivemind turns "
               "one agent's experience into skills the others can reuse. Here's how it works.",
    "cover": {"text": "Hivemind", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/learning-together.webp", "width": SIZE[0], "height": SIZE[1],
                        "alt": COVER_ALT}},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "Hivemind", "caption": "coding agents that learn from each other"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-03",
    "learn": [
        "What Hivemind is, and what it isn't",
        "Capture, codify, propagate, compound: how agent experience becomes skills",
        "Why Hivemind is not an LLM router",
        "Why past experience should be verified, not copied",
    ],
}


def main():
    with io.open(POSTS, encoding="utf-8") as f:
        posts = json.load(f)
    posts = [x for x in posts if x["slug"] != POST["slug"]]
    # Only one Featured post at a time.
    for x in posts:
        x["featured"] = None
    posts.insert(0, POST)
    with io.open(POSTS, "w", encoding="utf-8", newline="\n") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"posts: {len(posts)}; '{POST['slug']}' has {len(BODY)} blocks")


if __name__ == "__main__":
    main()
