"""Adds (or updates) Uma's post "MCP Explained Without the Headache" in api/seed/posts.json, with her visual in
web/public/blog/mcp/ (converted to WebP by hand on 7 Oct 2026).

Text: Uma's draft rewritten in plain, shorter prose, with clickable examples (GitHub, Notion, Supabase and her
student database) showing how each server is connected. Facts checked on 7 Oct 2026: GitHub's remote MCP server
is https://api.githubcopilot.com/mcp/ (repo github/github-mcp-server); Supabase's hosted server is
https://mcp.supabase.com/mcp (docs recommend a dev project and read-only mode); Notion offers a hosted MCP server
connected through your AI app with Notion sign-in. Config file formats differ per app.
Run from the repo root:  python scripts/seed-post-mcp.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
SUPABASE_POST = "/blog/supabase-explained"
AI_SDK_POST = "/blog/vercel-ai-sdk-more-than-a-prompt"
CODEGRAPH_POST = "/blog/codegraph-map-of-your-codebase"
INTRO = "https://modelcontextprotocol.io/docs/getting-started/intro"
SPEC = "https://modelcontextprotocol.io/specification/latest"
SERVERS = "https://github.com/modelcontextprotocol/servers"
GITHUB_MCP = "https://github.com/github/github-mcp-server"
NOTION_MCP = "https://developers.notion.com/docs/mcp"
SUPABASE_MCP = "https://supabase.com/docs/guides/getting-started/mcp"
# Uma's own recording (YouTube title "MCP", 7:20) and notebook.
VIDEO = "1DEQOF8i-_A"
VIDEO_URL = f"https://youtu.be/{VIDEO}"
COLAB = "https://colab.research.google.com/drive/1EHOMvc8O7Oeb-lru3gd58KYN8rSMX7KK"


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


def tab(title, *blocks):
    return {"title": title, "blocks": list(blocks)}


BIG_IDEA = ("==MCP== = the communication rules. ==MCP client== = the communicator inside your AI app. ==MCP server== "
            "= the program that provides the tools.")

IMG_ALT = (
    "How MCP works, using an Instagram bio: you ask \"What's my Instagram bio?\", the AI agent decides it needs the "
    "bio, its MCP client sends a request using MCP to an Instagram MCP server, the server runs its ready-made "
    "get_instagram_bio tool against the data source, and the result comes back through the client so the AI can "
    "answer."
)

SERVER_EXAMPLES = {"type": "tabs", "label": "Pick a server", "items": [
    tab("GitHub",
        *p("**What it gives your AI:** tools like search_code, create_issue, list_issues and get_pull_request, so it "
           "can work with your repos.",
           "**How you connect:** add GitHub's official MCP server to your AI app (Claude, Cursor, VS Code and others) "
           "and sign in with GitHub. GitHub hosts it, so there's nothing to install. In apps that use a JSON config, "
           "it looks roughly like this (the exact format differs per app):"),
        code('{\n  "mcpServers": {\n    "github": { "url": "https://api.githubcopilot.com/mcp/" }\n  }\n}'),
        *p("**Try asking:** \"Create a GitHub issue saying the login is broken.\""),
        flow("Your request", "AI app + MCP client", "GitHub MCP server: create_issue", "GitHub", "\"Issue created\"")),
    tab("Notion",
        *p("**What it gives your AI:** tools to search pages, read a page and create or update pages in your Notion "
           "workspace.",
           "**How you connect:** add Notion from your AI app's connectors (or point the app at Notion's hosted MCP "
           "server) and sign in with Notion. You choose which workspace it can reach.",
           "**Try asking:** \"Find my meeting notes from Monday and summarise them.\""),
        flow("Your request", "AI app + MCP client", "Notion MCP server: search_pages", "Notion",
             "Summary of your notes")),
    tab("Supabase",
        *p("**What it gives your AI:** tools to look at your tables, run SQL queries, check logs and manage your "
           "Supabase project.",
           "**How you connect:** point your AI app at Supabase's hosted MCP server and sign in with your Supabase "
           "account:"),
        code('{\n  "mcpServers": {\n    "supabase": { "url": "https://mcp.supabase.com/mcp" }\n  }\n}'),
        box("Play it safe", "Supabase recommends connecting to a ==development project==, not live data, and "
                            "turning on ==read-only mode== so the AI can look but not change anything."),
        *p("**Try asking:** \"How many students scored above 80?\"",
           f"New to Supabase? Start with our [Supabase post]({SUPABASE_POST})."),
        flow("Your question", "AI app + MCP client", "Supabase MCP server: run SQL", "Your database", "The answer")),
    tab("Your own server",
        *p("**What it gives your AI:** whatever you build. Say a student-info server with get_student, get_marks and "
           "get_attendance, sitting on a database with Rahul, Python, 87 marks, 92% attendance.",
           "**How you connect:** you write the server (official SDKs exist for Python, TypeScript and more), then "
           "add it to your AI app like any other server.",
           "**Try asking:** \"What are Rahul's marks?\""),
        flow("Your question", "AI app + MCP client", "Your MCP server: get_marks", "Student database", "87")),
]}

BODY = [
    *p("MCP, MCP servers, MCP clients, tools, resources, protocols... ==why does this need so many words?== 😭",
       "Forget the jargon for a minute. You only need three ideas, and one simple example."),
    cta("Try it yourself: open the Colab notebook", COLAB),
    *p(f"▶ [Watch my 7-minute MCP walkthrough](#video-{VIDEO})"),
    box("The one idea to remember", BIG_IDEA),

    h("What problem is MCP solving?", "part-1"),
    *p("You tell your AI coding app: ==\"Create a GitHub issue saying the login is broken.\"== The AI somehow has to "
       "talk to GitHub. It could use a custom API integration, a built-in integration, or ==MCP==.",
       "MCP (Model Context Protocol) gives AI apps ==one standard way== to connect to outside tools and data."),
    takeaway("One standard way for AI apps to plug into other tools."),

    h("MCP is rules, not a box in the middle", "part-2"),
    *p("Many explanations draw \"AI → MCP → server\", as if MCP were another program. It isn't. MCP is a ==protocol==: "
       "a set of rules for how two programs talk.",
       "Think of WhatsApp. When you message a friend, the communication rules aren't a person sitting between you. "
       "They're just how the messages travel."),
    pair(("Real world", "Person → phone → communication rules → other person"),
         ("AI", "AI app → MCP client → MCP rules → MCP server")),
    takeaway("MCP is the language, not a middleman."),

    h("The MCP client and the MCP server", "part-3"),
    *p("The ==MCP client== lives inside the AI app (Claude, Cursor, Antigravity or your own app). It finds out what "
       "a server can do and sends it requests. The AI model isn't the client; the client is part of the app around "
       "the model.",
       "The ==MCP server== is a program that offers capabilities. A GitHub server might offer create_issue, "
       "search_code, get_pull_request and list_issues. Those are ==already built== by the server's developer. The AI "
       "doesn't write create_issue on the spot; it just decides \"I need that tool\"."),
    *p("The server also knows how to talk to the real service, like GitHub's API, so the AI doesn't have to."),
    takeaway("The client asks. The server already knows how to do it."),

    h("The whole loop, in one picture", "part-4"),
    {"type": "image", "src": "/blog/mcp/instagram-bio-flow.webp", "alt": IMG_ALT, "width": 1536, "height": 1024,
     "caption": "An illustration: Instagram is just an example service here."},
    *p("You ask, ==\"What's my Instagram bio?\"== The AI decides it needs the bio. Its MCP client sends a request, "
       "using MCP, to an Instagram MCP server. The server runs its ready-made get_instagram_bio tool, gets the data, "
       "and the result travels back to the AI, which answers you.",
       "Same loop for GitHub: you ask, the AI picks create_issue, the client sends the request, the server creates "
       "the issue, and you get \"Your issue has been created.\""),
    flow("You", "AI app", "MCP client", "MCP server", "The service", "Result back to you"),
    takeaway("Request out, tool runs, result back. That's MCP."),

    h("Real servers, and how you connect them", "part-5"),
    *p("One AI app can connect to ==many MCP servers== at once, each giving different tools, all speaking the same "
       "protocol. Pick one to see what it gives your AI and how you'd connect it:"),
    SERVER_EXAMPLES,
    box("Before you connect anything", "An MCP server can act for you: create issues, send messages, change "
                                       "records. Only connect servers from sources you trust, and give each one ==the "
                                       "least access it needs==."),
    takeaway("Many servers, one protocol."),

    h("MCP isn't just for reading data", "part-6"),
    *p("Servers can offer tools that ==read== (get_profile, search_documents, get_issue) and tools that ==act== "
       "(create_issue, send_message, create_page, update_record)."),
    pair(("Read", "\"What's my latest GitHub issue?\""), ("Act", "\"Create a GitHub issue.\"")),
    *p("And MCP doesn't retrieve data by magic, write tools for you, replace GitHub or Notion, become your database "
       "or become the AI model. It just ==standardises how an AI app finds and uses outside capabilities==."),
    takeaway("Read or act, the pattern is the same."),

    h("Try it yourself", "part-7"),
    *p("My Colab builds a small MCP server and connects to it, so you can watch the request and the result move "
       "through the loop."),
    cta("Open the Colab notebook", COLAB),
    *p(f"**Watch it run.** I recorded the whole walkthrough. You can also [watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "MCP (Uma's walkthrough video)", "caption": "MCP walkthrough · 7:20"},

    h("The three things to remember", "part-8"),
    {"type": "cards", "items": [
        {"title": "MCP", "text": "The communication rules that let two programs understand each other."},
        {"title": "MCP client", "text": "The communicator inside your AI app. It finds and calls tools."},
        {"title": "MCP server", "text": "The capability provider, with ready-made tools for GitHub, Notion, "
                                        "databases, files, APIs and more."},
    ]},
    box("Remember", BIG_IDEA),
    *p("Not a magic AI layer, not another model, not a database. Just ==a standard way for AI apps to work with "
       "outside tools==. Once that clicks, the alphabet soup gets a lot less scary.",
       f"**Also read:** [Vercel AI SDK]({AI_SDK_POST}) for building the app around the model, and [CodeGraph]"
       f"({CODEGRAPH_POST}), which can reach AI agents through MCP. And [Playwright MCP]"
       "(/blog/playwright-mcp-ai-controls-a-browser), an MCP server that lets your AI control a browser."),

    h("Resources"),
    ul(f"[What is MCP?]({INTRO}): the official introduction.",
       f"[MCP specification]({SPEC}): the full protocol, if you want the details.",
       f"[Official example servers]({SERVERS}): reference servers and a list of community ones.",
       f"[GitHub MCP server]({GITHUB_MCP}): setup for GitHub's official server.",
       f"[Notion MCP]({NOTION_MCP}): connecting Notion to your AI tools.",
       f"[Supabase MCP]({SUPABASE_MCP}): setup, plus the safety settings.",
       f"[My Colab notebook]({COLAB}) and [my walkthrough video]({VIDEO_URL})."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [
    {"label": "GitHub MCP", "href": "/toolkit/mcp-github"},
    {"label": "Notion MCP", "href": "/toolkit/mcp-notion"},
    {"label": "Supabase MCP", "href": "/toolkit/mcp-supabase"},
]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "mcp-explained",
    "category": "agents",
    "title": "MCP Explained Without the Headache: How AI Actually Connects to Other Tools",
    "excerpt": "MCP is just communication rules. The client lives in your AI app; the server brings ready-made "
               "tools. See how GitHub, Notion and Supabase servers connect, with a Colab to try.",
    "cover": {"text": "MCP", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": "/blog/mcp/instagram-bio-flow.webp", "width": 1536, "height": 1024, "alt": IMG_ALT}},
    # Was featured until the Graphify post (7 Oct 2026).
    "featured": None,
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-07",
    "learn": [
        "The three ideas behind MCP: protocol, client, server",
        "Why MCP is a set of rules, not a program in the middle",
        "How GitHub, Notion and Supabase MCP servers connect",
        "Why MCP can act, not just read",
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
