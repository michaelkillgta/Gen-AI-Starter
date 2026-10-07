"""Adds (or updates) Uma's post "Graphify: CodeGraph, but for Your Whole Project" in api/seed/posts.json.

Text: built on Uma's CodeGraph vs Graphify notes (her comparison table and two city diagrams), written as a short
follow-up to the CodeGraph post. Facts checked on 7 Oct 2026: Graphify-Labs/graphify (moved from
safishamsi/graphify) is Apache-2.0; PyPI package `graphifyy` (double y) is at 0.9.79; install with
`uv tool install graphifyy` (or pipx), then `graphify install` registers the skill with your AI assistant, and
`/graphify .` writes graphify-out/graph.html, GRAPH_REPORT.md and graph.json. Code is parsed locally with tree-sitter
(no LLM); docs, PDFs, images and video use the assistant's model for a semantic pass. Other products share the name.
Run from the repo root:  python scripts/seed-post-graphify.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
CODEGRAPH_POST = "/blog/codegraph-map-of-your-codebase"
MCP_POST = "/blog/mcp-explained"
REPO = "https://github.com/Graphify-Labs/graphify"
PYPI = "https://pypi.org/project/graphifyy/"
DOCS = "https://docs.graphify.com"


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


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


def cta(label, href):
    return {"type": "cta", "label": label, "href": href}


BIG_IDEA = ("CodeGraph asks ==\"How is my code connected?\"== Graphify asks ==\"How is everything in my project "
            "connected?\"== Same graph idea, bigger map.")

# Uma's two diagrams, as she drew them.
CODEGRAPH_ROADS = "main.py\n   ↓\napi.py\n   ↓\ndatabase.py"
GRAPHIFY_CITY = """                README.md
                    │
                    ▼
main.py ──────► api.py ──────► database.py
   │                │
   ▼                ▼
config.py       API Docs
                    │
                    ▼
                architecture.png"""

BODY = [
    *p("Read our CodeGraph post? Then you already know ==90% of Graphify==. This one is the pinch of salt on top. 🧂"),
    cta("New here? Read the CodeGraph post first", CODEGRAPH_POST),
    box("The one idea to remember", BIG_IDEA),

    h("Same idea, bigger scope", "part-1"),
    *p(f"Quick recap from [CodeGraph]({CODEGRAPH_POST}): your project is a ==network==, not a pile of files. Imports, "
       "calls and dependencies are the architecture, and a map of them helps an AI find the right code.",
       "Graphify keeps all of that. Then it adds the stuff that ==isn't code==: your README, docs, PDFs, diagrams, "
       "screenshots, even videos. They all land in ==the same graph== as your code."),
    pair(("CodeGraph", "\"How is my code connected?\" A code graph."),
         ("Graphify", "\"How is everything in my project connected?\" A knowledge graph.")),
    takeaway("Code graph vs knowledge graph. That's the whole upgrade."),

    h("The city, mapped twice", "part-2"),
    *p("Picture your project as a city. ==CodeGraph maps the roads between buildings==: which file leads to which."),
    code(CODEGRAPH_ROADS),
    *p("==Graphify maps the whole city==: the roads, plus the signs, guidebooks and blueprints that explain them. The "
       "README points at the API, the API docs and the architecture diagram hang off the code they describe."),
    code(GRAPHIFY_CITY),
    takeaway("Roads only, or the whole city."),

    h("Side by side", "part-3"),
    *p("Everything CodeGraph does, Graphify does too:"),
    ul("✅ Builds a graph of the codebase",
       "✅ Code relationships",
       "✅ Imports, calls and dependencies",
       "✅ Helps AI understand the codebase"),
    *p("Here's where they split:"),
    pair(("CodeGraph", "Images and visual assets: not the focus. Documents and other non-code knowledge: not the "
                       "focus. Overall: ==mostly a code graph==."),
         ("Graphify", "Images and visual assets: ✅. Documents and other non-code knowledge: ✅. Overall: ==a broader "
                      "knowledge graph==.")),
    box("The real difference isn't images", "It's whether ==non-code information becomes part of the connected "
                                            "graph==. A diagram on its own is just a picture. Linked to the code it "
                                            "explains, it's context your AI can follow."),
    takeaway("Not \"with images vs without\". Connected knowledge vs code only."),

    h("How Graphify works", "part-4"),
    *p("Graphify runs as a ==skill inside your AI coding assistant== (Claude Code, Cursor, Codex, Gemini CLI, "
       "GitHub Copilot and more). Point it at a folder and it does two passes:"),
    ul("**Code:** parsed ==locally== with tree-sitter. No AI model, nothing leaves your machine.",
       "**Everything else** (docs, PDFs, images, video): read by ==your assistant's AI model==, which pulls out the "
       "concepts and links them to the code."),
    flow("Your folder", "Code parsed locally", "Docs and media read by the AI", "One knowledge graph",
         "Your AI queries it"),
    *p("Every connection is tagged ==EXTRACTED== (written in the source) or ==INFERRED== (worked out by Graphify), so "
       "you can tell facts from guesses. You get three files: ==graph.html== to click around in, ==GRAPH_REPORT.md== "
       "with the highlights, and ==graph.json== your AI can query later without re-reading everything."),
    takeaway("Code is mapped for free. Docs and media cost AI tokens."),

    h("Try it", "part-5"),
    *p("You need Python 3.10+ and an AI coding assistant. Install it (note the ==double y== in the package name; "
       "pipx works too), then register it with your assistant:"),
    code("uv tool install graphifyy\ngraphify install", "bash"),
    *p("Then, inside your assistant, run it on your project:"),
    code("/graphify ."),
    *p("Open graphify-out/graph.html in your browser and see your code and docs as one map. Start with a ==small "
       "project==: the docs-and-media pass uses your AI's tokens, so bigger folders cost more."),
    box("Which Graphify?", "Several products share the name. This post is about the open-source ==Graphify-Labs/"
                           "graphify== (Apache-2.0, version 0.9.79 when we checked), which started as "
                           "safishamsi/graphify."),
    takeaway("Two commands, one slash command, one map."),

    h("Which one should you use?", "part-6"),
    pair(("Use CodeGraph", "Your question is about code: where a change goes, what calls what. Cheap, and fine for "
                           "big codebases."),
         ("Use Graphify", "The answer lives in docs and diagrams too: why it was built this way, what the "
                          "architecture says. Best on small and medium projects.")),
    box("Remember", BIG_IDEA),
    *p("==CodeGraph shows the roads. Graphify shows the whole city.== 🏙️",
       f"**Also read:** [CodeGraph]({CODEGRAPH_POST}) for the basics, and [MCP]({MCP_POST}), since Graphify can "
       "also serve its graph to AI tools as an MCP server."),

    h("Resources"),
    ul(f"[Graphify on GitHub]({REPO}): the open-source (Apache-2.0) tool from this post.",
       f"[Graphify docs]({DOCS}): setup for each AI assistant, plus every command.",
       f"[graphifyy on PyPI]({PYPI}): the package, with the latest version.",
       f"[CodeGraph: Give AI a Map of Your Codebase]({CODEGRAPH_POST}): the post this one builds on.",
       "[Graphify in our Toolkit](/toolkit/graphify): our quick verdict."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [
    {"label": "Graphify", "href": "/toolkit/graphify"},
    {"label": "CodeGraph", "href": "/toolkit/codegraph"},
]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "graphify-whole-project-graph",
    "category": "agents",
    "title": "Graphify: CodeGraph, but for Your Whole Project",
    "excerpt": "CodeGraph maps how your code connects. Graphify puts your docs, diagrams and other non-code stuff "
               "in the same graph, so your AI sees the whole project. Here's the difference and how to try it.",
    "cover": {"text": "Graphify", "bg": "#211913", "fg": "#F2A93B", "image": None},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "Graphify", "caption": "map your code and your docs in one graph"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-07",
    "learn": [
        "How Graphify differs from CodeGraph: knowledge graph vs code graph",
        "Why the real difference is connected non-code knowledge, not images",
        "How Graphify builds its graph, and what it costs",
        "How to try it in your AI coding assistant",
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
