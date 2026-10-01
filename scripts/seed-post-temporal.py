"""Adds (or updates) Uma's post "Temporal: The Courtroom for Long-Running AI Workflows" in api/seed/posts.json,
with her 3 visuals in web/public/blog/temporal/ (converted to WebP by hand on 2 Oct 2026).

Text: written from Uma's draft in plain prose. Facts checked on 2 Oct 2026: temporalio 1.34.0 (30 Sept 2026),
Python >=3.10, server and SDK both MIT; Workflow code must be deterministic; execute_activity needs a timeout
(start_to_close_timeout); local dev server via `temporal server start-dev`. The AI cookbook documents an
OpenAI Agents SDK integration and human-in-the-loop; LangGraph is only "can be used alongside".
Run from the repo root:  python scripts/seed-post-temporal.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/temporal"
SIZE = (1672, 941)
LANGGRAPH_POST = "/blog/langgraph-ai-agents-workflow"
CREW_POST = "/blog/crewai-vs-n8n"
DOCS = "https://docs.temporal.io/"
PY_DOCS = "https://docs.temporal.io/develop/python"
SDK = "https://github.com/temporalio/sdk-python"
PYPI = "https://pypi.org/project/temporalio/"
AI_DOCS = "https://docs.temporal.io/ai-cookbook"
# Uma's own recording (YouTube title "Temporal", 4:42) and notebook.
VIDEO = "JKWqXY_-bhI"
VIDEO_URL = f"https://youtu.be/{VIDEO}"
COLAB = "https://colab.research.google.com/drive/11deECeXHeTZErpJI5Jr8AvMzBAImjbyc"
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


def cta(label, href):
    return {"type": "cta", "label": label, "href": href}


BIG_IDEA = ("Temporal is a ==durable execution platform==: it keeps long-running workflows going through crashes, "
            "retries and long waits. ==temporalio== is the Python SDK your code uses to talk to it.")

COVER_ALT = (
    "Think of Temporal as a court coordinator. It doesn't decide what the AI should do; it coordinates the steps, "
    "tracks progress, handles retries and makes sure everything completes. 1, the workflow is the plan; 2, "
    "activities do the actual work, like a search API, an LLM call or saving to a database; 3, the worker runs the "
    "code; 4, the Temporal server keeps the workflow moving, storing state and history and scheduling tasks. "
    "Example: search, ask AI, save the answer, and if the AI call times out, retry automatically."
)

BODY = [
    *p("Your AI app probably started simple:"),
    flow("Question", "Search", "LLM", "Answer"),
    *p("Then real life happened:"),
    flow("Search", "RAG", "LLM", "Tool", "Database", "Human approval", "Final action"),
    *p("Now the annoying questions show up. What if the LLM fails? What if a server crashes halfway? What if you "
       "have to ==wait three hours for a human==? What if one step failed, and you don't want to start the whole "
       "thing again?",
       "That's the problem Temporal is built for.",
       f"▶ [Watch my 5-minute Temporal demo](#video-{VIDEO})"),
    cta("Try it yourself: open the Colab notebook", COLAB),
    box("The one idea to remember", BIG_IDEA),

    h("Think of Temporal as a courtroom", "part-1"),
    img("court-coordinator", COVER_ALT, "Workflow, Activity, Worker and Server, as a courtroom."),
    *p("Picture a judge. The judge doesn't search documents, call witnesses or do the legwork. The judge "
       "==coordinates==: \"First this. Then that. If something goes wrong, follow the rules. If we're waiting for "
       "someone, pause here and carry on when they arrive.\"",
       "Temporal works the same way. One thing to be clear on: ==Temporal doesn't make decisions for you==. You "
       "write the rules. Temporal makes sure they run to the end, even when things break. It calls this ==durable "
       "execution==: your workflow keeps its progress even if workers, networks or servers fail."),
    takeaway("Temporal is the coordinator, not the one doing the work."),

    h("Workflow = the plan", "part-2"),
    *p("A Workflow is the overall process, written as code. For example: search, give the result to the LLM, retry "
       "if a step fails, return the answer. Here's a minimal version with the real API:"),
    code("from datetime import timedelta\n"
         "from temporalio import activity, workflow\n\n"
         "@activity.defn\n"
         "async def search(question: str) -> str:\n"
         "    ...  # call a search API\n\n"
         "@activity.defn\n"
         "async def ask_llm(question: str, context: str) -> str:\n"
         "    ...  # call your LLM\n\n"
         "@workflow.defn\n"
         "class ResearchWorkflow:\n"
         "    @workflow.run\n"
         "    async def run(self, question: str) -> str:\n"
         "        context = await workflow.execute_activity(\n"
         "            search, question, start_to_close_timeout=timedelta(seconds=30)\n"
         "        )\n"
         "        return await workflow.execute_activity(\n"
         "            ask_llm, args=[question, context], start_to_close_timeout=timedelta(minutes=2)\n"
         "        )", "python"),
    *p("Two small rules hide in there. Every activity call needs a ==timeout==, so Temporal knows when to give up "
       "and retry. And workflow code must be ==deterministic==: no random numbers, no network calls, no reading the "
       "clock directly. Anything unpredictable goes in an activity. That's what lets Temporal replay a workflow and "
       "land in exactly the same place."),
    takeaway("The Workflow is the plan. Keep it predictable."),

    h("Activity = the actual work", "part-3"),
    *p("An Activity is one piece of real-world work: ==search an API, call an LLM, query a database, send an "
       "email, process a payment==.",
       "These are exactly the things that can be slow or fail, which is why they're kept separate from the plan. "
       "The workflow says \"run search\", and the activity actually does it."),
    flow("Workflow: \"run search\"", "Activity", "The search actually happens"),
    takeaway("If it talks to the outside world, it's an activity."),

    h("Worker = the one doing the work", "part-4"),
    *p("Here's a surprise: the Temporal server ==doesn't run your Python code==. Your Worker does.",
       "Workers are your own programs. They keep asking a ==task queue== for work, run the workflow and activity "
       "code, and report back. You can run several workers on the same queue to share the load."),
    flow("Temporal service", "Task queue", "Worker", "Your Python code"),
    takeaway("The server coordinates. Your workers do the running."),

    h("Then what is temporalio?", "part-5"),
    img("temporal-vs-temporalio",
        "Temporal versus temporalio, same ecosystem, different roles. Temporal is the workflow orchestration "
        "platform: it runs your steps, retries on failure, handles long waits and keeps going reliably. temporalio "
        "is the Python SDK: your Python code defines workflows and activities, temporalio turns them into requests "
        "the platform understands, and Temporal runs and coordinates them. Temporal is the platform; temporalio is "
        "how Python talks to it."),
    *p("This is where the names get confusing. ==Temporal is the platform==. ==temporalio is the Python SDK==, the "
       "official library your Python code uses to work with it:"),
    code("pip install temporalio", "bash"),
    code("from temporalio import workflow, activity\n"
         "from temporalio.client import Client\n"
         "from temporalio.worker import Worker", "python"),
    *p("It's MIT licensed, needs Python 3.10 or newer, and the latest version is 1.34.0, from 30 September 2026. To "
       "try things on your laptop, the Temporal CLI starts a local dev server with temporal server start-dev. "
       "There's also Temporal Cloud, a paid hosted version, if you don't want to run the server yourself."),
    takeaway("Temporal is the platform. temporalio is how Python talks to it."),

    h("What if something fails?", "part-6"),
    img("when-it-fails",
        "What happens when an AI workflow fails. Without Temporal: the user question, search and AI answer work, "
        "then saving the result fails because the server crashed, and nobody knows where to continue, so the whole "
        "workflow is lost. With Temporal: it tracks progress at each step, retries the failed save automatically, "
        "and continues from where it stopped until the result is saved.", ILLUSTRATION),
    *p("Say search and RAG worked, but the LLM call failed. With a ==retry policy==, Temporal retries just that "
       "activity:"),
    flow("Search: done", "RAG: done", "LLM: failed", "Retry", "LLM: done", "Answer"),
    *p("The clever part isn't the retry itself. Temporal keeps an ==event history== of everything that already "
       "happened, so it continues from where it stopped instead of starting over. Search doesn't run twice just "
       "because the LLM had a bad moment."),
    takeaway("Only the failed step runs again. Everything else is remembered."),

    h("It can also wait", "part-7"),
    *p("Say your AI writes a report and a human has to approve it. The workflow can simply ==wait==, for minutes, "
       "hours or days, without holding up a server. When the approval arrives, it carries on."),
    flow("Generate report", "Wait for human approval", "Human approves", "Publish report"),
    *p(f"Temporal's [AI cookbook]({AI_DOCS}) has examples of exactly this kind of thing: long-running agents, "
       "human-in-the-loop steps and multi-step AI pipelines."),
    takeaway("Waiting for a human is just another step."),

    h("Where AI fits", "part-8"),
    *p("Temporal ==isn't the LLM==. It isn't RAG. It isn't an agent framework. It sits around the workflow and "
       "keeps it running."),
    flow("Temporal: durable execution", "Your AI workflow", "Search, tools, LLM"),
    *p(f"That's why it can be used alongside agent frameworks like [LangGraph]({LANGGRAPH_POST}): LangGraph shapes "
       "the agent's reasoning and tool steps, and Temporal keeps the bigger process durable. Temporal's docs also "
       "show an official integration with the OpenAI Agents SDK.",
       "One honest note: Temporal isn't the only way to do this, and it has a ==learning curve==. For a small "
       "script, it's overkill. It earns its place when workflows are long, expensive or can't afford to lose "
       "progress."),
    takeaway("Agent frameworks shape the thinking. Temporal makes the process survive."),

    h("The mental model", "part-9"),
    {"type": "cards", "items": [
        {"title": "Temporal", "text": "Coordinates the workflow and keeps it durable"},
        {"title": "Workflow", "text": "Defines the plan"},
        {"title": "Activity", "text": "Does the actual outside work"},
        {"title": "Worker", "text": "Runs your code"},
        {"title": "temporalio", "text": "The Python SDK that connects your app to Temporal"},
    ]},
    box("Remember", BIG_IDEA),

    h("Build it yourself", "part-10"),
    *p("Theory clicks faster when you see it run. I built a small Temporal workflow in Colab that you can run "
       "yourself."),
    box("Run it in Colab", f"Everything in this post is in my notebook, ready to run: [open the Colab notebook]({COLAB})."),
    cta("Open the Colab notebook", COLAB),
    *p(f"**Watch it run.** I recorded the whole thing. You can also [watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "Temporal (Uma's demo video)", "caption": "Temporal · 4:42"},
    *p(f"**Also read:** [LangGraph: How AI Agents Actually Follow a Workflow]({LANGGRAPH_POST}) and [CrewAI vs n8n]"
       f"({CREW_POST}), two other ways to build the workflow that Temporal keeps running."),

    h("Resources"),
    ul(f"[Temporal docs]({DOCS}): concepts, guides and how to run Temporal yourself.",
       f"[Temporal Python SDK guide]({PY_DOCS}): building workflows, activities and workers in Python.",
       f"[sdk-python on GitHub]({SDK}): source code, examples and the full README.",
       f"[temporalio on PyPI]({PYPI}): the package and its release history.",
       f"[Temporal AI cookbook]({AI_DOCS}): examples for AI agents and human-in-the-loop workflows.",
       "[Temporal in our Toolkit](/toolkit/temporal): our quick verdict.",
       f"[My Colab notebook]({COLAB}) and [my demo video]({VIDEO_URL})."),
]

POST = {
    "slug": "temporal-long-running-ai-workflows",
    "category": "agents",
    "title": "Temporal: The Courtroom for Long-Running AI Workflows",
    "excerpt": "Your AI workflow will fail halfway one day. Temporal makes sure it picks up where it stopped, retries "
               "the broken step and can even wait hours for a human.",
    "cover": {"text": "Temporal", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/court-coordinator.webp", "width": SIZE[0], "height": SIZE[1],
                        "alt": COVER_ALT}},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "Crash-proof", "caption": "Temporal: the courtroom for long-running AI workflows"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-02",
    "learn": [
        "Why real AI workflows need more than a simple pipeline",
        "Workflow, Activity and Worker, explained with a courtroom",
        "How Temporal retries one failed step without starting over",
        "The difference between Temporal and temporalio",
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
