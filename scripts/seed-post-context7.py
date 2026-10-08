"""Adds (or updates) Uma's post "Context7 MCP: What If Your AI Could Check the Docs Before Coding?" in
api/seed/posts.json, with her visual and two cropped screenshots in web/public/blog/context7/ (9 Oct 2026; crops
remove her folder path and account name).

Text: Uma's draft rewritten in plain, shorter prose, with a "pick your app" tabs block for Antigravity, Cursor,
Codex and the ChatGPT desktop app. Facts checked on 9 Oct 2026: Context7 (Upstash, MIT) server URL
https://mcp.context7.com/mcp, free API key recommended for higher limits; its tools are resolve-library-id and
query-docs (older versions called the second get-library-docs). Codex docs: `codex mcp add context7 -- npx -y
@upstash/context7-mcp`, config in ~/.codex/config.toml, and the ChatGPT desktop app shares Codex's MCP config.
Run from the repo root:  python scripts/seed-post-context7.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/context7"
MCP_POST = "/blog/mcp-explained"
PLAYWRIGHT_POST = "/blog/playwright-mcp-ai-controls-a-browser"
AI_SDK_POST = "/blog/vercel-ai-sdk-more-than-a-prompt"
SITE = "https://context7.com"
REPO = "https://github.com/upstash/context7"
CODEX_MCP = "https://developers.openai.com/codex/mcp"


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, size, caption=None):
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


def tab(title, *blocks):
    return {"title": title, "blocks": list(blocks)}


BIG_IDEA = ("Context7 is the ==\"check the docs first\" button== for your AI coding agent. It doesn't make the AI "
            "smarter; it gives it ==the right docs at the right moment==.")

COVER_ALT = (
    "Context7 MCP, one server, many AI tools: coding agents like Antigravity, Cursor, Codex and Claude connect to "
    "the Context7 MCP server, which looks up current library documentation and hands the relevant part back "
    "before the agent writes code."
)

CONNECT = {"type": "tabs", "label": "Pick your app", "items": [
    tab("Antigravity",
        *p("Open the ==Extensions== marketplace, search for ==Context7 MCP Server== and install the one from "
           "Upstash. That's it: the agent can now call Context7's tools."),
        img("antigravity-extension",
            "The Context7 MCP Server extension by Upstash in Antigravity's Extensions marketplace, with Install, "
            "Disable and Uninstall buttons and a list of its tools.", (903, 778),
            "Uma's screenshot: Context7 MCP Server installed in Antigravity.")),
    tab("Cursor",
        *p("Add Context7 to your project's ==.cursor/mcp.json== (or through Cursor's MCP settings):"),
        img("mcp-json", "A .cursor/mcp.json file with an mcpServers entry named context7 pointing to "
                        "https://mcp.context7.com/mcp.", (431, 192), "Uma's Cursor setup."),
        code('{\n  "mcpServers": {\n    "context7": { "url": "https://mcp.context7.com/mcp" }\n  }\n}'),
        *p("Some apps call the field \"serverUrl\" instead of \"url\", like in the screenshot; follow your app's "
           "docs.")),
    tab("Codex",
        *p("OpenAI's own Codex docs use Context7 as their example. One command in your terminal:"),
        code("codex mcp add context7 -- npx -y @upstash/context7-mcp", "bash"),
        *p("Codex saves it in ==~/.codex/config.toml==. Run ==codex mcp list== to check it's there.")),
    tab("ChatGPT",
        *p("The ==ChatGPT desktop app== shares its MCP setup with Codex on the same computer, so once you've added "
           "Context7 with the Codex command, the desktop app can use it too.",
           "The ChatGPT website works differently: it can only reach MCP servers through its own connector settings, "
           "so check what your plan supports there.")),
]}

BODY = [
    *p("You ask your AI coding agent: ==\"Build this feature using the latest Next.js API.\"== It writes beautiful "
       "code. You run it. 💥 ==Deprecated API.==",
       "The AI knows a lot. But knowing a lot isn't the same as ==having today's docs open in front of you==. That's "
       "where Context7 comes in."),
    box("The one idea to remember", BIG_IDEA),

    h("The \"check the docs\" button for AI", "part-1"),
    img("one-server", COVER_ALT, (1536, 1024), "An illustration of the idea."),
    *p("Picture coding with a friend. You ask how the latest Supabase API works. Instead of guessing, they say "
       "==\"wait, let me check the docs\"==, open the right page and carry on.",
       f"[Context7]({SITE}) gives your AI agent that same habit. It's an ==MCP server== (made by Upstash) that lets "
       "coding agents fetch the relevant library docs when they need them."),
    flow("You", "AI agent", "\"Let me check the docs\"", "Context7", "Relevant docs", "AI writes the code"),
    takeaway("Check first, then code."),

    h("Why we need it", "part-2"),
    *p("Libraries change. APIs change. Methods get deprecated. The code that worked two years ago might not be the "
       "recommended way today.",
       "Your AI learned from ==older tutorials, answers and docs==. Meanwhile the library moved on to a new API. "
       "So the AI might confidently write ==the old way==."),
    box("Does Context7 update the AI?", "==No.== It doesn't retrain the AI or change what it knows. It adds the "
                                        "relevant docs to the current task: the AI's knowledge plus fresh docs, "
                                        "only for this job."),
    takeaway("A docs lookup tool, not a new brain."),

    h("Where MCP comes in", "part-3"),
    *p(f"New to MCP? Our [MCP post]({MCP_POST}) explains it simply. For Context7, the roles are:"),
    {"type": "cards", "items": [
        {"title": "AI agent", "text": "Decides what to do and writes the code."},
        {"title": "MCP", "text": "The communication rules that connect the agent to the tool."},
        {"title": "Context7", "text": "Finds the library and returns its relevant documentation."},
    ]},
    *p("Context7 gives the agent two tools: ==resolve-library-id== finds the library you mean, and ==query-docs== "
       "fetches the relevant part of its docs. (Older versions, like the extension in the screenshot, call the "
       "second one get-library-docs.)"),
    takeaway("Find the library, then get the docs. Two tools, one job."),

    h("Connect it to your AI app", "part-4"),
    *p("The server lives at ==https://mcp.context7.com/mcp==. How you connect depends on your app. Pick yours:"),
    CONNECT,
    box("Free API key", "Context7 works without one, but a free key from your Context7 dashboard gives ==higher rate "
                        "limits==. Keep it in your app's settings or an environment variable, never in code you "
                        "share."),
    takeaway("One server, many AI apps."),

    h("Now test it", "part-5"),
    *p("Don't ask \"What is Context7?\" Give it a ==real coding task==:"),
    code("Build this feature using the current library API.\n"
         "Before implementing it, check the relevant documentation using Context7."),
    pair(("Without Context7", "You → AI: \"I know how this library works\" → code (maybe outdated)."),
         ("With Context7", "You → AI: \"I need the docs\" → Context7 → current docs → code.")),
    *p("The AI still does the thinking and writes the code. Context7 just hands it ==the right documentation==."),
    takeaway("One extra step can save you from a deprecated API."),

    h("What Context7 is not", "part-6"),
    *p("==Not Google.== Google searches the whole web. Context7 is built around ==developer docs and library "
       "usage==: \"How does this library's API work?\", not \"what happened in tech this week?\"",
       "==Not your AI agent.== It doesn't build your app, decide what your product does, or replace Cursor, "
       "Antigravity or Codex. It's one tool your agent can use."),
    *p("For example, you say \"Add authentication using this library.\" The agent needs to know which API to use, "
       "what's available now, what config it needs and whether the old way is deprecated. Context7 gives it the "
       "current answer before it writes a line."),
    flow("Your feature", "AI agent", "\"Need the docs\"", "Context7", "Current docs", "Implementation"),
    takeaway("A specialist for docs, not a search engine and not an agent."),

    h("The mental model", "part-7"),
    box("Remember", BIG_IDEA),
    pair(("Without it", "\"Why the hell doesn't this work?\""), ("With it", "\"Yep. That's the current API.\"")),
    *p("==Check the docs. Then code.== 🚀",
       f"**Also read:** [MCP Explained]({MCP_POST}), [Playwright MCP]({PLAYWRIGHT_POST}) for another MCP server, "
       f"and [Vercel AI SDK]({AI_SDK_POST}), a library that changes fast enough to need Context7."),

    h("Resources"),
    ul(f"[Context7]({SITE}): search libraries and get your free API key.",
       f"[Context7 on GitHub]({REPO}): Upstash's official server (MIT), with setup for each app.",
       f"[Codex MCP setup]({CODEX_MCP}): OpenAI's guide to adding MCP servers to Codex and the ChatGPT desktop app.",
       "[Context7 MCP in our Toolkit](/toolkit/mcp-context7): our quick verdict."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used",
              "items": [{"label": "Context7 MCP", "href": "/toolkit/mcp-context7"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "context7-mcp-check-the-docs",
    "category": "agents",
    "title": "Context7 MCP: What If Your AI Could Check the Docs Before Coding?",
    "excerpt": "Your AI wrote confident code with a deprecated API. Context7 lets it check the current library docs "
               "first. Here's how it works and how to connect it to Antigravity, Cursor, Codex and ChatGPT.",
    "cover": {"text": "Context7", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/one-server.webp", "width": 1536, "height": 1024, "alt": COVER_ALT}},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "Context7", "caption": "let your AI check the docs before coding"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-09",
    "learn": [
        "Why AI writes outdated code, and how Context7 fixes it",
        "What Context7 does and doesn't do",
        "How to connect it in Antigravity, Cursor, Codex and ChatGPT",
        "How to test it with a real coding task",
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
