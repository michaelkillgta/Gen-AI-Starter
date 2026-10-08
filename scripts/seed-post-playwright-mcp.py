"""Adds (or updates) Uma's post "Playwright MCP: Let Your AI Control a Browser" in api/seed/posts.json, with her 2
visuals in web/public/blog/playwright-mcp/ (converted to WebP by hand on 8 Oct 2026).

Text: Uma's draft rewritten in plain, shorter prose, same order. Facts checked on 8 Oct 2026 against the official
README (github.com/microsoft/playwright-mcp): @playwright/mcp 0.0.83 (28 Sept 2026), Apache 2.0; works through
structured accessibility snapshots, not screenshots; needs Node.js 18 or newer (the draft said 20+); config is
`npx @playwright/mcp@latest`, e.g. `claude mcp add playwright npx @playwright/mcp@latest`.
Run from the repo root:  python scripts/seed-post-playwright-mcp.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/playwright-mcp"
MCP_POST = "/blog/mcp-explained"
PROMPTFOO_POST = "/blog/ai-red-teaming-promptfoo"
REPO = "https://github.com/microsoft/playwright-mcp"
INSTALL = "https://playwright.dev/mcp/installation"
GETTING_STARTED = "https://github.com/microsoft/playwright/blob/main/docs/src/getting-started-mcp.md"
PLAYWRIGHT = "https://playwright.dev"
TODO_DEMO = "https://demo.playwright.dev/todomvc"
# Uma's own recording (YouTube title "Playwright MCP", 7:04).
VIDEO = "HLjrFzmFaw8"
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


BIG_IDEA = ("Playwright MCP isn't a browser. It's an ==MCP server that hands browser tools to your AI==, so it can "
            "navigate, click, type and read pages ==instead of just telling you how==.")

COVER_ALT = (
    "Playwright MCP browser automation explained: the AI agent talks over MCP to the Playwright MCP server, which "
    "uses Playwright to control a real browser that opens the website, clicks, types and reads the page."
)

BODY = [
    *p("Imagine telling an AI: ==\"Open BookMyShow, select Hyderabad, search for a movie, and check if tickets are "
       "available.\"==",
       "Instead of giving you steps, the AI actually ==opens the browser, clicks, types, reads the page and keeps "
       "going==. That's what Playwright MCP makes possible.",
       f"▶ [Watch my 7-minute Playwright MCP walkthrough](#video-{VIDEO})"),
    box("The one idea to remember", BIG_IDEA),

    h("First: what is Playwright?", "part-1"),
    *p(f"[Playwright]({PLAYWRIGHT}) is a ==browser automation library==. Software can use it to open websites, click "
       "buttons, type into boxes, pick options and read what's on the page. Normally you write the code yourself:"),
    code('await page.goto("https://example.com");\n'
         'await page.getByRole("button", { name: "Search" }).click();', "javascript"),
    *p("Here ==you're== driving Playwright. What if an AI agent could use those browser powers itself? That's where "
       "MCP comes in."),
    takeaway("Playwright controls browsers. MCP lets an AI hold the controls."),

    h("How the pieces fit", "part-2"),
    img("explained", COVER_ALT, (1536, 1024)),
    *p(f"MCP is a standard way for an AI app to talk to servers that offer tools (new to it? read our [MCP post]"
       f"({MCP_POST})). With Playwright, the chain is:"),
    flow("AI agent", "MCP", "Playwright MCP server", "Playwright", "Browser"),
    {"type": "cards", "items": [
        {"title": "AI agent", "text": "Understands your request and decides what to do."},
        {"title": "MCP", "text": "The communication rules between the agent and the server."},
        {"title": "Playwright MCP server", "text": "Offers browser tools to the AI: navigate, click, type, read."},
        {"title": "Playwright", "text": "Actually drives the browser."},
    ]},
    takeaway("The agent decides. The server offers tools. Playwright does the clicking."),

    h("How it works: look, decide, act", "part-3"),
    img("task-flow",
        "An AI agent's task flow with Playwright MCP: the agent navigates to a site, takes a snapshot of the page, "
        "works out what is there, clicks and types, takes another snapshot and reads the results, deciding each "
        "step from what it sees.", (1774, 887)),
    *p("The AI doesn't write a new script. It uses the server's tools in a loop: ==look at the page, decide, act==, "
       "then look again."),
    flow("Navigate", "Take snapshot", "Understand page", "Click / type", "Snapshot again", "Read results"),
    *p("The clever part is the ==snapshot==. Instead of a screenshot, Playwright MCP gives the AI a structured list of "
       "what's on the page, from its accessibility tree:"),
    code('heading "BookMyShow"\ntextbox "Search"\nbutton "Hyderabad"\nbutton "Mumbai"'),
    *p("So the AI doesn't guess where a button is from pixels. It knows ==exactly what's there== and can point at it."),
    takeaway("Structured snapshots, not screenshots. That's why it works reliably."),

    h("A real example", "part-4"),
    *p("Ask: \"Open BookMyShow. Select Hyderabad. Search for Pushpa 2. Check if tickets are available.\" The AI might "
       "go:"),
    flow("Open BookMyShow", "Look at the page", "Click Hyderabad", "Find the search box", "Type \"Pushpa 2\"",
         "Read the results", "Tell you if tickets are available"),
    *p("Each step depends on ==what it finds on the page==. That's the difference from a fixed script."),
    box("Use it responsibly", "Some websites block automated browsers or don't allow them in their terms. Check "
                              "before you automate a real site, and never let an agent buy or book without your "
                              "say-so. For practice, use demo sites like the one below."),
    takeaway("A script follows steps. An agent reacts to the page."),

    h("Setting it up", "part-5"),
    *p("No Playwright project, no automation script. You need ==Node.js 18 or newer== and an MCP-capable app, like VS "
       "Code with GitHub Copilot, Cursor or Claude Code. Most apps take a config like this:"),
    code('{\n  "mcpServers": {\n    "playwright": {\n      "command": "npx",\n      "args": ["@playwright/mcp@latest"]\n'
         '    }\n  }\n}'),
    *p("In Claude Code it's one command:"),
    code("claude mcp add playwright npx @playwright/mcp@latest", "bash"),
    *p("The browser downloads automatically the first time. After connecting, start a ==new agent chat== so the "
       "tools load."),
    takeaway("One config entry and you're done."),

    h("Your first test", "part-6"),
    *p("Give your agent this, the same first test the official docs suggest:"),
    code(f"Navigate to {TODO_DEMO}\n\nAdd these three todos:\n- Learn MCP\n- Learn Playwright\n- Build AI Agents\n\n"
         "Then verify that all three were added."),
    *p("No .js file. The agent uses the Playwright MCP tools to do it all in the browser."),
    *p(f"**Watch it run.** I recorded the whole thing. You can also [watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "Playwright MCP (Uma's walkthrough video)",
     "caption": "Playwright MCP walkthrough · 7:04"},
    takeaway("Describe the task in plain English. The agent does the clicking."),

    h("The big picture", "part-7"),
    flow("You", "AI agent (MCP client)", "MCP", "Playwright MCP server", "Playwright", "Browser", "Website"),
    {"type": "cards", "items": [
        {"title": "MCP", "text": "The communication rules"},
        {"title": "AI agent", "text": "The MCP client"},
        {"title": "Playwright MCP", "text": "The MCP server"},
        {"title": "Playwright", "text": "Browser automation"},
        {"title": "Browser", "text": "Where the actions happen"},
    ]},
    box("Remember", BIG_IDEA),
    *p(f"**Also read:** [MCP Explained Without the Headache]({MCP_POST}), and [Your AI Looks Smart. But Can You Break "
       f"It?]({PROMPTFOO_POST}) for testing an agent before you trust it with a browser."),

    h("Resources"),
    ul(f"[Playwright MCP on GitHub]({REPO}): the official server, setup for every app and the full tool list.",
       f"[Playwright MCP installation]({INSTALL}): the official setup guide.",
       f"[Getting started with Playwright MCP]({GETTING_STARTED}): Playwright's own walkthrough.",
       f"[Playwright]({PLAYWRIGHT}): the browser automation library underneath.",
       f"[My walkthrough video]({VIDEO_URL}): the setup and first test, step by step.",
       "[Playwright MCP in our Toolkit](/toolkit/mcp-playwright): our quick verdict."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used",
              "items": [{"label": "Playwright MCP", "href": "/toolkit/mcp-playwright"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "playwright-mcp-ai-controls-a-browser",
    "category": "agents",
    "title": "Playwright MCP: Let Your AI Control a Browser",
    "excerpt": "Instead of telling you how to search a site, your AI can open the browser, click, type and read the "
               "page itself. Here's how Playwright MCP works, and how to set it up in one config line.",
    "cover": {"text": "Playwright MCP", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/explained.webp", "width": 1536, "height": 1024, "alt": COVER_ALT}},
    # Was featured until the Context7 post (9 Oct 2026).
    "featured": None,
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-08",
    "learn": [
        "What Playwright is, and what MCP adds to it",
        "How an AI agent looks, decides and acts in a browser",
        "Why accessibility snapshots beat screenshots",
        "How to set it up and run your first test",
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
