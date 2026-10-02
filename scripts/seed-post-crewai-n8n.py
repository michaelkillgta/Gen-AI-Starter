"""Adds (or updates) Uma's post "CrewAI vs n8n: Stop Comparing Tools. Understand the Difference." in
api/seed/posts.json, with her 4 visuals in web/public/blog/crewai-n8n/ (converted to WebP by hand on 1 Oct 2026).

Text: Uma's own version, polished lightly (repetition trimmed, structure kept). Facts checked on 1 Oct 2026:
CrewAI is Python-first with agents, tasks, tools, crews and Flows; latest release 1.15.23 (28 Sept 2026).
n8n calls itself a "fair-code" platform (source-available under its Sustainable Use License, not open source)
with 1500+ integrations, self-hosted or cloud. The pictures are illustrations, not real screenshots.
Run from the repo root:  python scripts/seed-post-crewai-n8n.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/crewai-n8n"
SIZE = (1672, 941)
LANGGRAPH_POST = "/blog/langgraph-ai-agents-workflow"
ILLUSTRATION = "An illustration, not a real screenshot."


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


def cta(label, href):
    return {"type": "cta", "label": label, "href": href}


BIG_IDEA = ("CrewAI asks: ==\"How do my AI agents collaborate?\"== n8n asks: ==\"How does my AI system connect to the "
            "real world?\"==")

COVER_ALT = (
    "CrewAI versus n8n. Left, CrewAI: agents, roles and collaboration in Python code, with a crew.py file defining a "
    "researcher, a writer and a reviewer, and an agent flow where they share context. Right, n8n: a visual workflow "
    "builder connecting an email trigger, an AI agent, a vector store, an HTTP request and Slack, with node settings "
    "and an execution preview. Different starting points, some overlap."
)

BODY = [
    *p("You've seen it: ==\"CrewAI vs n8n\"==, followed by 20 minutes of feature lists.",
       "Let's make it simpler. Say you want to build this:"),
    flow("Get information", "AI thinks", "Use tools", "Make decisions", "Do something"),
    *p("There are lots of ways to build it. Two interesting ones are CrewAI and n8n."),
    box("The one idea to remember", BIG_IDEA),

    h("The 10-second difference", "part-1"),
    img("two-dashboards",
        "CrewAI versus n8n, two ways to build AI systems with the same goal. CrewAI, for agent collaboration: a "
        "research crew of researcher, writer and reviewer agents with roles, tools and a final output. n8n, for "
        "workflows and integrations: a canvas where a form submission flows through an AI agent with a chat model, "
        "memory and a search tool, then an HTTP request, Airtable and Gmail.",
        f"{ILLUSTRATION} n8n lists 1500+ integrations today, more than the picture says."),
    *p("Think about a team.",
       "**CrewAI** asks: \"How can I make ==AI agents work together=="
       "?\" You write Python and describe agents, their tasks and their tools, then group them into a crew, like a "
       "researcher, a writer and a reviewer passing work along. For more control over the order of steps, it also "
       "has ==Flows==."),
    flow("Researcher", "Writer", "Reviewer", "Result"),
    *p("**n8n** asks: \"How can I ==connect AI to the rest of the world==?\" You build a workflow on a visual "
       "canvas, and AI is one step among many."),
    flow("Email", "AI", "RAG", "Database", "Slack"),
    pair(("CrewAI", "Agent collaboration"), ("n8n", "Workflows and integrations")),
    *p("There's overlap. But this mental model gets you ==80% of the way there==."),
    takeaway("CrewAI starts from the agents. n8n starts from the workflow."),

    h("One real example: support emails", "part-2"),
    *p("Imagine you're building ==an AI that reads customer emails and handles support tickets==."),
    *p("**With CrewAI**, you'd design a team:"),
    flow("Customer email", "Research agent", "Support agent", "Reviewer agent", "Response"),
    *p("The interesting question becomes: ==which agent should do what?=="),
    *p("**With n8n**, you'd design the path the data takes:"),
    flow("Gmail", "AI agent", "Knowledge base", "Refund? Yes: process refund", "No: reply normally"),
    *p("Now the interesting question becomes: ==what should happen to the data?==",
       "Same job. Different first question. That's why the tools feel so different."),
    takeaway("Agents vs data flow: that's the real difference in practice."),

    h("Where n8n gets really nice", "part-3"),
    *p("Say your workflow breaks somewhere in the middle:"),
    flow("Gmail", "AI", "RAG", "Broken here", "Slack"),
    *p("In n8n you can open the ==execution== and see exactly what went into and came out of each node. For "
       "someone learning AI engineering, that's huge. You're not staring at \"ERROR ERROR ERROR, why\". You can "
       "==follow the data==.",
       "This is one reason I personally enjoyed working with n8n, especially for larger workflows and multi-RAG "
       "experiments."),
    takeaway("Seeing the data move is the fastest way to find a bug."),

    h("The catch: visual spaghetti", "part-4"),
    *p("n8n's canvas is fantastic... until your workflow looks like this:"),
    code("        ┌── IF\n        │    ↓\nA → B → C → LOOP → D\n        │       ↘\n        └→ ERROR → RETRY\n"
         "                    ↓\n                 SUBFLOW"),
    *p("Then you add 30 more nodes. At some point, ==visual becomes spaghetti==.",
       "That's where code can be easier to maintain. With CrewAI, your logic lives in Python files, so it fits "
       "naturally with tests, Git and CI/CD."),
    pair(("Visual", "Doesn't automatically mean easier."), ("Code", "Doesn't automatically mean harder.")),
    *p("It depends on the ==size and shape== of what you're building."),
    takeaway("Small and connected: visual shines. Big and complex: code often wins."),

    h("The actual trade-off", "part-5"),
    img("code-vs-canvas",
        "CrewAI's code editor next to n8n's canvas: Python files define agents with roles, goals and tools on one "
        "side; on the other, a visual workflow connects Gmail, an AI agent, a Postgres vector store, an HTTP "
        "request and Slack, with an execution preview.", ILLUSTRATION),
    {"type": "cards", "items": [
        {"title": "Look at CrewAI for", "text": "Agent collaboration, Python development, and large codebases with "
                                                "tests and CI/CD."},
        {"title": "Look at n8n for", "text": "Visual workflows, connecting APIs and apps, webhooks and triggers, "
                                             "visual debugging, and learning by watching data move."},
        {"title": "Both handle", "text": "Structured workflows. CrewAI has Flows; n8n is built around workflows."},
    ]},
    *p("It's ==not a leaderboard==. Just different strengths."),
    takeaway("Pick by the shape of your problem, not by the hype."),

    h("Don't become \"an n8n guy\"", "part-6"),
    img("building-blocks",
        "Different frameworks, same building blocks. An AI system is made of an LLM for reasoning, tools, RAG for "
        "your data, memory, routing, loops, agents and observability. CrewAI assembles them with agent "
        "collaboration and roles, n8n assembles them graphically with workflows and integrations, and LangGraph "
        "assembles them as a stateful graph with custom logic. Tools change, concepts stay.",
        "The LangGraph code here is simplified. The full version is in our LangGraph post."),
    *p("Don't be the person who says \"I'm an n8n guy\" or \"CrewAI is the only way\". Frameworks change ==fast==. "
       "What's underneath them doesn't:"),
    ul("LLM", "Tools", "RAG", "Memory", "Routing", "Loops", "Agents", "Observability", "Permissions"),
    *p("Once you understand those, picking up a new framework is ==way easier==."),
    takeaway("Tools change. Concepts stay."),

    h("The best way to learn", "part-7"),
    img("research-assistant",
        "Build an AI research assistant two ways. In CrewAI, agents work together: a researcher searches for papers, "
        "an analyst extracts insights, a writer writes the report and a reviewer checks it. In n8n, a workflow runs "
        "daily: get papers over HTTP from arXiv, create embeddings and search, an AI agent analyses and writes, the "
        "report is formatted and emailed. Same goal, two approaches.", ILLUSTRATION),
    *p("Don't watch \"CrewAI vs n8n vs LangGraph vs Framework X\" for three hours. ==Build something.==",
       "Take one tiny project, like an AI research assistant, and build it three times:"),
    flow("CrewAI", "n8n", "LangGraph"),
    *p("You'll quickly notice:"),
    ul("how each one represents the workflow", "where the state lives", "how tools get connected",
       "how debugging works", "where each approach starts to feel uncomfortable"),
    *p("And suddenly you're not learning frameworks. You're learning ==AI engineering==."),
    cta("New to LangGraph? Read the LangGraph post", LANGGRAPH_POST),
    takeaway("One small project, three frameworks. You'll learn more than any comparison video."),

    h("Remember this", "part-8"),
    box("Remember", BIG_IDEA),
    *p("Neither answer is permanent. The tools will change. Your understanding of the architecture is what stays."),
    *p(f"**Also read:** [LangGraph: How AI Agents Actually Follow a Workflow]({LANGGRAPH_POST}), the third framework "
       "in this trio, and [Temporal](/blog/temporal-long-running-ai-workflows), which keeps long-running workflows alive through crashes."),

    h("Resources"),
    *p("**CrewAI**"),
    ul("[CrewAI docs](https://docs.crewai.com/): agents, tasks, crews, tools and Flows, with guides to get started.",
       "[CrewAI on GitHub](https://github.com/crewAIInc/crewAI): source code, examples and releases.",
       "[CrewAI in our Toolkit](/toolkit/crewai): our quick verdict, when to use it and when to skip it."),
    *p("**n8n**"),
    ul("[n8n docs](https://docs.n8n.io/): building workflows, AI agent nodes, self-hosting and the cloud version.",
       "[n8n community](https://community.n8n.io/): ask questions and see how others build their workflows.",
       "[n8n integrations](https://n8n.io/integrations/): the full list of apps and services it connects to.",
       "[n8n in our Toolkit](/toolkit/n8n): our quick verdict, including the licence."),
    *p("**LangGraph**"),
    ul(f"[Our LangGraph post]({LANGGRAPH_POST}): the third framework, with a tiny AI debugger you can run.",
       "[LangGraph in our Toolkit](/toolkit/langgraph): our quick verdict."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [{"label": "CrewAI", "href": "/toolkit/crewai"}, {"label": "n8n", "href": "/toolkit/n8n"}, {"label": "LangGraph", "href": "/toolkit/langgraph"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "crewai-vs-n8n",
    "category": "agents",
    "title": "CrewAI vs n8n: Stop Comparing Tools. Understand the Difference.",
    "excerpt": "CrewAI makes AI agents work together. n8n connects AI to the rest of the world. Here's the difference "
               "in 5 minutes, with one real example and when to pick which.",
    "cover": {"text": "CrewAI vs n8n", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/code-vs-canvas.webp", "width": SIZE[0], "height": SIZE[1], "alt": COVER_ALT}},
    # Was featured until the Temporal post (2 Oct 2026).
    "featured": None,
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-01",
    "learn": [
        "The one-line difference between CrewAI and n8n",
        "How the same support-email app looks in each",
        "When visual workflows help, and when they turn into spaghetti",
        "Why the building blocks matter more than any framework",
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
