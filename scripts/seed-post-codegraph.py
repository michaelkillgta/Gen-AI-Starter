"""Adds (or updates) Uma's post "CodeGraph: Give AI a Map of Your Codebase" in api/seed/posts.json, with her 3
visuals in web/public/blog/codegraph/ (converted to WebP by hand on 7 Oct 2026).

Text: Uma's draft rewritten in plain, shorter prose, same order. Facts checked on 7 Oct 2026: southerncoder/
codegraph-visualizer is MIT, static (no code execution), `pip install codegraph` then `codegraph <path>` opens an
interactive HTML graph; codegraph-ai/CodeGraph exposes a semantic code graph to AI agents through MCP and a VS Code
extension. Several unrelated projects share the name.
Run from the repo root:  python scripts/seed-post-codegraph.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/codegraph"
HIVEMIND_POST = "/blog/hivemind-coding-agents-share-experience"
VISUALIZER = "https://github.com/southerncoder/codegraph-visualizer"
AI_CODEGRAPH = "https://github.com/codegraph-ai/CodeGraph"
# Uma's own recording (YouTube title "codegraph", 6:11).
VIDEO = "q4nrbn99Hv0"
VIDEO_URL = f"https://youtu.be/{VIDEO}"


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, size, caption="An illustration of the idea."):
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


def cta(label, href):
    return {"type": "cta", "label": label, "href": href}


BIG_IDEA = ("A codebase isn't a pile of files. It's a ==network of relationships==. CodeGraph ==draws the map==; you "
            "(or your AI) still read the code.")

COVER_ALT = (
    "CodeGraph, visualising your codebase connections: files, modules, functions and classes drawn as a network, "
    "with lines showing which parts import, call or depend on each other."
)

BODY = [
    *p("You ask an AI coding assistant: ==\"Add a password reset feature.\"== Sounds easy.",
       "But your project has frontend, backend, auth, services, database and utils folders, plus hundreds of files. "
       "Before changing anything, the AI has to work out ==where the change belongs== and how the existing code is "
       "connected. That's where CodeGraph helps.",
       f"▶ [Watch my 6-minute CodeGraph walkthrough](#video-{VIDEO})"),
    box("The one idea to remember", BIG_IDEA),

    h("What is CodeGraph?", "part-1"),
    img("connections", COVER_ALT, (1536, 1024)),
    *p("Think of your codebase as a ==city==: files, packages, modules, functions, classes and dependencies. None of "
       "them live alone. Files import other files, functions call functions, classes get used all over.",
       f"CodeGraph turns those relationships into a picture. The [CodeGraph Visualizer]({VISUALIZER}) we use reads "
       "Python code and builds an ==interactive HTML graph== of it, without running your app."),
    takeaway("Your project is a network, not a list."),

    h("Your code isn't just files", "part-2"),
    img("files-to-map",
        "From files to a code map: a plain list of main.py, chatbot.py, rag.py, database.py and utils.py becomes a "
        "graph where main.py leads to chatbot.py, which uses rag.py and database.py, and rag.py uses utils.py.",
        (1672, 941)),
    *p("Five files named main.py, chatbot.py, rag.py, database.py and utils.py tell you very little. Their "
       "==connections== tell you how the app works: main.py starts chatbot.py, which uses rag.py and database.py, "
       "and rag.py leans on utils.py.",
       "Same code. But now ==the architecture is visible==."),
    takeaway("The relationships are the architecture."),

    h("Why AI needs the map", "part-3"),
    img("why-ai-needs-map",
        "Why AI needs a code map: without one, an AI searches everything, opens lots of files and works out the "
        "connections itself; with one, it reads the structure first, finds the relevant code and works on the "
        "feature.", (1672, 941)),
    *p("To add a feature, an AI needs to know where it belongs, what it depends on, and ==what else might break== if "
       "it changes something. Without that, it searches, guesses, opens lots of files and rebuilds the structure "
       "itself.",
       "It's like visiting a huge city. You could wander until you figure it out, or open ==Google Maps==. The map "
       "doesn't walk for you. It just shows the roads."),
    *p("For \"add password reset\", the map might point straight at this path:"),
    flow("Login page", "Authentication", "User service", "Database"),
    flow("Your request", "Read the code map", "Find the relevant area", "Read the actual code", "Make the change"),
    takeaway("A map turns guessing into navigating."),

    h("What CodeGraph is not", "part-4"),
    pair(("Not this", "CodeGraph = magic AI that writes the feature."),
         ("This", "Codebase → CodeGraph → relationship map → AI uses the structure → better navigation.")),
    *p("CodeGraph ==isn't the AI==. It's a code analysis tool. How much it helps an AI depends on how the graph is "
       "plugged into the AI's workflow.",
       "Same for tokens. An AI has a limited context window, and reading hundreds of unrelated files wastes it. So "
       "the honest claim isn't \"CodeGraph saves tokens\". It's: ==a code graph can help an AI focus on the relevant "
       "parts instead of rebuilding the whole structure from scratch==."),
    box("And it doesn't replace reading code", "The graph says ==what's connected==, not ==why== it was built that "
                                               "way. The graph is the map; the source code is the actual place."),
    takeaway("Use the map to decide where to look. Then read the code."),

    h("I tried it on a small AI app", "part-5"),
    *p("I built a tiny project, ==Codegraph-Demo==: a few Python files that work together. When it runs, the flow is "
       "Main, then Chatbot, then RAG, then Database. Looking at the files one by one doesn't show you that.",
       "So instead of drawing the architecture by hand, I ran CodeGraph on it:"),
    code("pip install codegraph\ncodegraph /path/to/Codegraph-Demo", "bash"),
    *p("It opens an interactive graph in your browser where you can explore modules, classes, functions and which "
       "parts connect to which. ==\"Which file talks to which?\" stops being a question.=="),
    *p(f"**Watch it run.** I recorded the whole walkthrough. You can also [watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "CodeGraph (Uma's walkthrough video)",
     "caption": "CodeGraph walkthrough · 6:11"},
    takeaway("Five minutes with the graph beats an hour of opening files."),

    h("Why it matters more as projects grow", "part-6"),
    *p("Five files? Easy. Fifty? Manageable. Five hundred? Your brain files for resignation. 🫠",
       "Developers know parts of a big system, never every connection. AI assistants have the same problem. ==The "
       "bigger the codebase, the more a map is worth.==",
       f"For AI agents, there are also CodeGraph projects built for them, like [codegraph-ai's CodeGraph]"
       f"({AI_CODEGRAPH}), which gives agents a graph of functions, classes, imports and call chains through MCP and "
       "a VS Code extension."),
    takeaway("Big codebase, bigger payoff."),

    h("In one picture", "part-7"),
    flow("Your codebase", "CodeGraph", "Relationship map: files, functions, classes", "Better navigation",
         "AI coding"),
    box("Remember", BIG_IDEA),
    *p("==Don't make AI search a pile of code. Give it a map.== 🗺️",
       f"**Also read:** [Hivemind]({HIVEMIND_POST}), which shares what coding agents learn, and ships a code-graph "
       "skill of its own."),

    h("Resources"),
    ul(f"[CodeGraph Visualizer on GitHub]({VISUALIZER}): the open-source (MIT) Python tool from this post.",
       f"[codegraph-ai/CodeGraph on GitHub]({AI_CODEGRAPH}): a code graph built for AI agents, through MCP and VS "
       "Code.",
       f"[My walkthrough video]({VIDEO_URL}): CodeGraph on my demo app, step by step.",
       "[CodeGraph in our Toolkit](/toolkit/codegraph): our quick verdict on another CodeGraph project for AI "
       "tools."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [{"label": "CodeGraph", "href": "/toolkit/codegraph"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "codegraph-map-of-your-codebase",
    "category": "agents",
    "title": "CodeGraph: Give AI a Map of Your Codebase",
    "excerpt": "Your project isn't a pile of files; it's a network. CodeGraph draws the map, so you and your AI "
               "coding assistant can find the right code instead of searching everything.",
    "cover": {"text": "CodeGraph", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/connections.webp", "width": 1536, "height": 1024, "alt": COVER_ALT}},
    # Was featured until the MCP post (7 Oct 2026).
    "featured": None,
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-07",
    "learn": [
        "Why a codebase is a network, not a list of files",
        "How a code map helps AI find where a change belongs",
        "What CodeGraph is not: not the AI, not a token saver by itself",
        "How to run CodeGraph on your own Python project",
    ],
}


def main():
    with io.open(POSTS, encoding="utf-8") as f:
        posts = json.load(f)
    posts = [x for x in posts if x["slug"] != POST["slug"]]
    posts.insert(0, POST)
    with io.open(POSTS, "w", encoding="utf-8", newline="\n") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"posts: {len(posts)}; '{POST['slug']}' has {len(BODY)} blocks")


if __name__ == "__main__":
    main()
