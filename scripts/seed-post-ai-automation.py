"""Adds (or updates) Uma's post "AI Automation Explained" in api/seed/posts.json, with her 5 infographics in
web/public/blog/ai-automation/ (converted to WebP on 26 Oct 2026) and her walkthrough video (YouTube, added 26 Oct).

Text: Uma's draft kept close, with Indian examples, links to the related posts and her comparison table shown as
cards (the blog has no tables, and cards read better on phones). Facts checked on 26 Oct 2026 against PyPI and npm:
n8n 2.44 (Sustainable Use License, needs Node.js 24+), LangGraph 1.2 (MIT), CrewAI 1.15, LlamaIndex 0.14 (MIT,
`pip install llama-index`), Playwright 1.64 (Apache 2.0, Node.js 20+ or Python 3.10+).
Run from the repo root:  python scripts/seed-post-ai-automation.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/ai-automation"
CREWAI_N8N_POST = "/blog/crewai-vs-n8n"
LANGGRAPH_POST = "/blog/langgraph-ai-agents-workflow"
AGENT_POST = "/blog/an-ai-agent-is-more-than-a-chatbot"
FIVE_AGENTS_POST = "/blog/five-agents-agreeing-can-still-be-one-mistake"
RAG_ANYTHING_POST = "/blog/rag-anything-multimodal-rag"
DOCLING_POST = "/blog/docling-pdf-is-not-just-text"
PLAYWRIGHT_POST = "/blog/playwright-mcp-ai-controls-a-browser"
ROUTER_POST = "/blog/llm-routers-model-routing"
PROMPTFOO_POST = "/blog/ai-red-teaming-promptfoo"
PHOENIX_POST = "/blog/arize-phoenix-ai-observability"
STOP_POST = "/blog/why-your-agent-should-know-when-to-stop"
# Uma's own recording (YouTube title "Full Automation Vedio").
VIDEO = "_mbnafGEW84"
VIDEO_URL = f"https://youtu.be/{VIDEO}"


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, size=(1536, 1024), caption="An illustration of the idea."):
    return {"type": "image", "src": f"{IMG}/{name}.webp", "alt": alt, "width": size[0], "height": size[1],
            "caption": caption}


def ul(*items):
    return {"type": "list", "ordered": False, "items": list(items)}


def ol(*items):
    return {"type": "list", "ordered": True, "items": list(items)}


def flow(*items, repeat=None):
    return {"type": "flow", "items": list(items), "repeat": repeat}


def box(label, text):
    return {"type": "callout", "label": label, "text": text}


def takeaway(text):
    return box("Takeaway", text)


def best_for(text):
    return p(f"**Best for:** {text}")


BIG_IDEA = ("The goal isn't to use AI everywhere. It's to ==stop wasting human time on work that technology can "
            "handle reliably==: rules where rules work, AI only where understanding is needed.")

COVER_ALT = (
    "What is automation? A trigger (new email, form submitted, scheduled time or new data in an app) starts an "
    "automated process (read data, check rules, process it with AI if needed, prepare output), which performs "
    "actions (update a database, send an email, notify the team, create a record in another app). The outcome: "
    "faster, fewer errors, time saved. Below, the manual way (check email, copy data, update a file, send an "
    "email, repeat) next to the automated way (email arrives, the system does all the steps, work done)."
)

BODY = [
    *p("Imagine waking up and finding your emails sorted, your reports ready, your research done, and the boring, "
       "repetitive tasks already finished.",
       "Sounds good, right? That's the idea behind ==AI automation==. Instead of doing every task by hand, you let "
       "technology handle the repetitive work while ==you focus on the things that actually need you==.",
       "Let's break down the ==5 types of automation== you should know. 👇",
       f"▶ [Watch my AI automation walkthrough](#video-{VIDEO})"),
    box("The one idea to remember", BIG_IDEA),

    h("Traditional automation", "part-1"),
    img("traditional", COVER_ALT),
    *p("**Think: \"If this happens, do that.\"** You set the rules once, and the system follows them every time.",
       "**Example:** A student in Coimbatore fills the college fest registration form. Their details are saved to a "
       "sheet, and a confirmation email goes out."),
    flow("Form submitted", "Save details", "Send confirmation email"),
    *p("No AI required. Just ==predefined rules doing their job==. A workflow tool like n8n is made for this, and it "
       f"can add an AI step when one is needed (see [CrewAI vs n8n]({CREWAI_N8N_POST}))."),
    *best_for("notifications, scheduled tasks, data entry and repetitive workflows."),
    takeaway("If the steps never change, you don't need AI. You need rules."),

    h("AI agent automation", "part-2"),
    img("ai-agent",
        "AI agent automation: you give a goal in plain language (\"Summarize my unread emails and create a to-do "
        "list for today\"). The agent understands, plans, uses tools such as email, calendar, documents, web search, "
        "chat, a database or running code, then checks its results. You get an email summary, tasks added to your "
        "to-do list, a meeting scheduled if needed and the team notified."),
    *p("**Think: give AI a goal, not a list of every click.** An AI agent can understand your request, ==plan the "
       "steps, use tools== and work towards finishing the task.",
       "**Example:** Tell an agent, \"Summarize my important emails and create today's to-do list.\" It reads the "
       "emails you've allowed it to see, picks out what matters (the exam timetable, the internship reply) and "
       "prepares your list."),
    flow("Understand", "Plan", "Use tools", "Check results", repeat="Not done yet"),
    *p(f"New to agents? Read [An AI Agent Is More Than a Chatbot]({AGENT_POST}), then [LangGraph]({LANGGRAPH_POST}) "
       "to see how the steps are built."),
    *best_for("research, personal assistants and multi-step tasks."),
    takeaway("Rules follow steps. An agent decides the steps."),

    h("Multi-agent automation", "part-3"),
    img("multi-agent",
        "Multi-agent automation: you ask \"Research the top 3 competitors, analyze their features and pricing, and "
        "create a final report.\" A planner agent splits the work between a research agent (web search, reading "
        "pages), an analysis agent (compares features and pricing) and a writer agent (writes and formats the "
        "report). The result is a competitor analysis report with key findings, a feature comparison, pricing "
        "analysis and recommendations."),
    *p("**Think: one AI team, different jobs.** Instead of one agent handling everything, ==several specialised "
       "agents work together==.",
       "**Example:** You're starting a tiffin delivery service in Hyderabad and want to know how the three biggest "
       "competitors work."),
    ul("🔎 **Research agent** collects their menus, prices and reviews.",
       "📊 **Analysis agent** compares features and pricing.",
       "📝 **Writer agent** creates the final report."),
    *p("Each agent has a role, and their results are combined. CrewAI is built around exactly this idea of roles "
       f"([CrewAI vs n8n]({CREWAI_N8N_POST}))."),
    *best_for("market research, complex analysis and content workflows."),
    box("Careful", f"More agents means more cost and more ways to fail. Agents that share the same model can also "
                   f"share the same mistake ([Five Agents Agreeing Can Still Be One Mistake]({FIVE_AGENTS_POST}))."),

    h("Knowledge and RAG automation", "part-4"),
    img("rag",
        "Knowledge and RAG automation: your knowledge sources (documents, websites, databases, Notion or Drive) "
        "are prepared (text extracted and split into chunks), stored as embeddings in a vector database, the most "
        "relevant chunks are retrieved for each question, and the AI generates an answer with sources. Example: "
        "\"What is our refund policy for international orders?\" answered with the policy PDF, the help centre and "
        "the company wiki as sources."),
    *p("**Think: give AI an open-book exam instead of making it guess.** RAG stands for ==Retrieval-Augmented "
       "Generation==. The system finds the relevant parts of your documents or knowledge base ==before== the AI "
       "answers.",
       "**Example:** A B.Tech student in Chennai asks, \"Explain Unit 3 of Operating Systems.\" The system pulls "
       "the matching pages from the course notes and uses them to write an answer grounded in that material."),
    flow("Prepare documents", "Store", "Retrieve relevant parts", "Answer with sources"),
    *p("Good answers start with good parsing: see [Docling]({}) for turning PDFs into clean text, and "
       "[RAG-Anything]({}) for documents full of images and tables.".format(DOCLING_POST, RAG_ANYTHING_POST)),
    *best_for("AI tutors, customer support, company knowledge bases and document search."),
    box("Remember", "RAG improves access to the right information, but ==the answers still need checking==."),

    h("Browser and computer-use automation", "part-5"),
    img("browser",
        "Browser and computer-use automation: you give a goal (\"Book a flight from Hyderabad to Bangalore next "
        "Friday and save the details in a sheet\"). The agent opens websites and apps, clicks, types and navigates "
        "like a person, fills the forms and finishes the task. You get the result: flight booked, details saved to "
        "a spreadsheet and a confirmation sent to your email."),
    *p("**Think: AI using your computer to get things done.** With the right tools and permissions, an AI agent "
       "can ==open websites, click buttons, fill forms and collect information==.",
       "**Example:** Tell an agent, \"Find the low-rated reviews of my restaurant in Madurai, sort them by rating "
       "and summarize the common complaints.\" It visits the review pages, gathers what it finds and prepares the "
       "summary."),
    *p(f"Under the hood this is often Playwright. See [Playwright MCP]({PLAYWRIGHT_POST}) to set it up in one line."),
    *best_for("browser tasks, form filling, research and website testing."),
    box("Use it responsibly", "Some websites don't allow automated browsing. Check their terms, start with your own "
                              "site or a demo site, and never let an agent pay or book without your say-so."),

    h("How are they different?", "part-6"),
    {"type": "cards", "items": [
        {"title": "Traditional automation", "text": "Follows predefined rules."},
        {"title": "AI agent", "text": "Works towards a goal using tools."},
        {"title": "Multi-agent", "text": "Divides the work among specialised agents."},
        {"title": "RAG", "text": "Finds the relevant information for the AI."},
        {"title": "Browser automation", "text": "Uses websites and apps for you."},
    ]},
    *p("These aren't competing technologies. ==You can combine them==: a rule triggers an agent, the agent looks "
       "things up with RAG and finishes the job in a browser."),
    flow("New email (rule)", "Agent reads it", "RAG finds the policy", "Browser updates the order"),
    takeaway("Five tools in one box, not five rivals."),
    *p(f"**Watch it.** I walk through all five types in my video. You can also [watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "AI Automation Explained (Uma's walkthrough video)",
     "caption": "AI automation walkthrough"},

    h("Tools worth exploring", "part-7"),
    ul("[n8n](/toolkit/n8n): connect apps and automate workflows.",
       "[LangGraph](/toolkit/langgraph): build multi-step AI agent systems.",
       "[CrewAI](/toolkit/crewai): give a team of agents clear roles.",
       "[LlamaIndex](/toolkit/llamaindex): build apps that use your own documents and data.",
       "[Playwright](/toolkit/playwright): automate browsers and test websites.",
       f"**LLM APIs:** add language-model intelligence to your workflows (and [route between models]({ROUTER_POST}) "
       "to save cost)."),
    *p("You don't need all of them. ==Pick tools based on the problem you're solving==. See them side by side in "
       "the [Automation area of the Toolkit](/toolkit?track=automation)."),

    h("Where should you start?", "part-8"),
    *p("Start small:"),
    ol("Automate ==one== repetitive task.",
       "Add AI where understanding or summarizing is needed.",
       "Connect tools so the system can take useful actions.",
       f"Add testing, monitoring and safety checks ([Promptfoo]({PROMPTFOO_POST}), [Phoenix]({PHOENIX_POST}), and "
       f"[knowing when to stop]({STOP_POST})).",
       "Expand only when the workflow proves useful."),
    box("Remember", BIG_IDEA),
    *p("Less busywork. More building. ⚡",
       f"**Also read:** [CrewAI vs n8n]({CREWAI_N8N_POST}), [LangGraph]({LANGGRAPH_POST}), "
       f"[RAG-Anything]({RAG_ANYTHING_POST}) and [Playwright MCP]({PLAYWRIGHT_POST})."),

    h("Resources"),
    ul("[n8n docs](https://docs.n8n.io/): workflows, triggers and AI agent nodes.",
       "[LangGraph docs](https://docs.langchain.com/oss/python/langgraph/overview): building agents as graphs.",
       "[CrewAI docs](https://docs.crewai.com/): agents, tasks and crews.",
       "[LlamaIndex docs](https://developers.llamaindex.ai/python/framework/): RAG over your own data.",
       "[Playwright docs](https://playwright.dev/): browser automation and testing.",
       f"[My walkthrough video]({VIDEO_URL}): all five types of automation, explained.",
       "[Automation tools in our Toolkit](/toolkit?track=automation): our quick verdicts."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [
    {"label": "n8n", "href": "/toolkit/n8n"},
    {"label": "LangGraph", "href": "/toolkit/langgraph"},
    {"label": "CrewAI", "href": "/toolkit/crewai"},
    {"label": "LlamaIndex", "href": "/toolkit/llamaindex"},
    {"label": "Playwright", "href": "/toolkit/playwright"},
]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "ai-automation-explained",
    "category": "agents",
    "title": "AI Automation Explained: Make AI Do the Busywork",
    "excerpt": "Rules, AI agents, agent teams, RAG and browser automation: the 5 types of automation you should "
               "know, what each one is best for, and where to start.",
    "cover": {"text": "AI Automation", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/traditional.webp", "width": 1536, "height": 1024, "alt": COVER_ALT}},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "AI Automation", "caption": "the 5 types of automation, and where to start"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-26",
    "learn": [
        "The 5 types of automation, from simple rules to AI using a browser",
        "When you need AI, and when plain rules are enough",
        "Which tools fit each type",
        "How to start small and grow safely",
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
