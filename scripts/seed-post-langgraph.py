"""Adds (or updates) Uma's post "LangGraph: How AI Agents Actually Follow a Workflow" in api/seed/posts.json,
with her 5 visuals in web/public/blog/langgraph/ (converted to WebP by hand on 1 Oct 2026).

Text: written from Uma's draft in plain prose. Facts checked on 1 Oct 2026: LangGraph describes itself as a
"low-level orchestration framework for building stateful agents"; latest release 1.2.12 (21 Sept 2026). The
code uses the real API (StateGraph, add_node, add_edge, add_conditional_edges, START/END, compile, invoke).
Uma confirmed the Colab uses sarvam-105b; resources list from her (tracking parameters removed).
Run from the repo root:  python scripts/seed-post-langgraph.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/langgraph"
SIZE = (1672, 941)
RAG_ANYTHING_POST = "/blog/rag-anything-multimodal-rag"
COLBERT_POST = "/blog/colbert-when-semantic-search-isnt-enough"
REPO = "https://github.com/langchain-ai/langgraph"
PYPI = "https://pypi.org/project/langgraph/"
SARVAM = "https://docs.sarvam.ai/"
# Uma's own recording (YouTube title "langgraph polished", 4:23) and notebook.
VIDEO = "SiZb22_2pe0"
VIDEO_URL = f"https://youtu.be/{VIDEO}"
COLAB = "https://colab.research.google.com/drive/1Hu5celJhCe9xH7q021SlKnYZmSUkEybu"


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, caption=None, size=SIZE):
    return {"type": "image", "src": f"{IMG}/{name}.webp", "alt": alt, "width": size[0], "height": size[1],
            "caption": caption}


def ul(*items):
    return {"type": "list", "ordered": False, "items": list(items)}


def ol(*items):
    return {"type": "list", "ordered": True, "items": list(items)}


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


BIG_IDEA = ("The ==LLM is the brain==. ==LangGraph is the workflow==: it decides which step runs next, carries the "
            "state between steps, and loops back when something fails.")

COVER_ALT = (
    "How AI agents actually follow a workflow: LangGraph lets you build an agent as a graph of connected steps. 1, "
    "user input \"Find the bug in this code\"; 2, think; 3, use a tool; 4, check the result; 5, decide if the task "
    "is complete; if no, 7, retry and loop back; if yes, 6, done. A simplified code panel shows StateGraph with "
    "add_node calls. Key idea: node is a step, edge is a path, loop is try again."
)

BODY = [
    *p("You've heard it everywhere: \"We can build AI agents using LangGraph.\"",
       "Sounds fancy. But what is LangGraph actually doing? Do we really need another framework just to call an "
       "LLM?",
       "Let's skip the scary diagrams and build the idea from one tiny problem.",
       f"▶ [Watch my 4-minute LangGraph demo](#video-{VIDEO})"),
    cta("Try it yourself: open the Colab notebook", COLAB),
    box("The one idea to remember", BIG_IDEA),

    h("Imagine your AI has a job", "part-1"),
    *p("You tell an AI coding assistant: ==\"My code is broken. Find the bug and fix it.\"==",
       "A normal LLM looks at the code and says, \"Found it. You used - instead of +.\" Cool. But an actual coding "
       "agent has to do more than point:"),
    flow("Understand the problem", "Find the bug", "Fix it", "Test the code", "Did it work?",
         repeat="If not, fix and test again"),
    *p("That's not one answer anymore. That's a ==workflow==. And this is where LangGraph comes in."),
    takeaway("Doing a job takes steps, checks and retries, not one reply."),

    h("So what is LangGraph?", "part-2"),
    *p("LangGraph is a framework for building AI agents as ==workflows made of steps, decisions, state and loops==. "
       "That's it.",
       "Don't let \"framework\" scare you. It just means a structure that saves you from building every piece from "
       f"zero. LangGraph's own [description]({REPO}) is a \"low-level orchestration framework for building stateful "
       "agents\". In plain words: ==the LLM provides the intelligence, LangGraph organises what happens next==."),
    takeaway("LangGraph is the workflow manager for your AI agent."),

    h("LLM vs AI agent", "part-3"),
    img("llm-vs-agent",
        "Normal LLM versus AI agent. A normal LLM takes a question, \"How do I cancel my subscription?\", and gives "
        "a direct answer. An AI agent takes a goal, \"Cancel my subscription and confirm it for me\", then thinks, "
        "uses tools such as a browser or APIs, checks the result, decides whether the goal is done, tries again if "
        "not, and finishes. An LLM gives an answer; an AI agent gets things done."),
    *p("A normal LLM is simple: you ask, it answers, done."),
    flow("Question", "LLM", "Answer"),
    *p("An agent works towards a goal:"),
    flow("Goal", "Think", "Use a tool", "Check the result", "Decide", "Finish", repeat="Not done? Try again"),
    *p("An agent isn't \"ask AI, get answer\". It's a ==process==, and LangGraph helps you build that process."),
    takeaway("An LLM gives an answer. An agent gets the job done."),

    h("Why is it called a graph?", "part-4"),
    img("graph-is-workflow",
        "A graph is a workflow. A coding example: diagnose the code (def add returns a minus b, a bug), run the test "
        "(expected 5, got -1), check whether it passed; if no, fix the code (return a plus b) and run the tests "
        "again; if yes, done. Key concepts: a node is a step, an edge is a path, a decision chooses the next path, "
        "a loop means try again."),
    *p("Forget the maths-class meaning. Here a graph is just ==connected steps==, like A → B → C.",
       "Our debugger as a graph: diagnose, test, then a decision. Passed? Done. Failed? Fix, and test again.",
       "Different steps, different paths. Sometimes the workflow moves forward, sometimes it ==goes back==, and "
       "sometimes it decides."),
    takeaway("A graph is a flowchart your agent actually follows."),

    h("The 4 things you need to understand", "part-5"),
    *p("Forget the 50-page docs for now. Start with these four:"),
    {"type": "cards", "items": [
        {"title": "Node = a step", "text": "One thing your agent does: diagnose, test or fix. Think \"do this job\"."},
        {"title": "Edge = the path", "text": "The arrow from one node to the next. Think \"go here next\"."},
        {"title": "State = what it carries", "text": "The info passed along: the buggy code, the diagnosis, the test "
                                                     "result, how many attempts, the fixed code."},
        {"title": "Conditional edge = a decision", "text": "Where to go based on what happened. Test passed? Done. "
                                                           "Failed? Back to fix."},
    ]},
    *p("Put a conditional edge after a test and you get the best part: a ==loop==. Instead of Step 1 → 2 → 3 → "
       "finish, you can say \"if it isn't good enough, go back and try again\". That's much closer to how useful "
       "agents actually work."),
    flow("Diagnose", "Test: failed", "Fix", "Test: failed", "Fix", "Test: passed"),
    takeaway("Nodes, edges, state, decisions. Add a loop and you have an agent."),

    h("Our tiny AI debugger", "part-6"),
    img("debugger",
        "A tiny AI coding debugger built with LangGraph and Sarvam. LangGraph controls the workflow; Sarvam is the "
        "reasoning model. The developer says \"My code is broken. Find the bug and fix it\"; LangGraph runs the "
        "steps; Sarvam finds the bug; state stores the code, diagnosis, test result and fix attempts; the test "
        "checks add(2, 3) equals 5; if it fails, Sarvam suggests changing return a - b to return a + b and the test "
        "runs again; when it passes, the agent returns the fixed code."),
    *p("Our broken code is ridiculously simple:"),
    code("def add(a, b):\n    return a - b", "python"),
    *p("We expect add(2, 3) to give 5. It gives ==-1==. Test failed, bug found. Now let's see who does what."),
    takeaway("A tiny bug is perfect for watching the whole workflow run."),

    h("Where Sarvam fits", "part-7"),
    *p(f"Important: ==LangGraph is not the LLM==. In our experiment the thinking is done by [Sarvam]({SARVAM})'s "
       "sarvam-105b, a model from an Indian AI company. LangGraph runs the workflow around it. Here's the conversation, roughly:"),
    pair(("Sarvam", "\"I think the problem is a - b.\""), ("LangGraph", "\"Okay. Now let's test it.\"")),
    pair(("Test", "\"Still broken.\""), ("LangGraph", "\"Then go back and fix it.\"")),
    pair(("Test", "\"2 + 3 = 5.\""), ("LangGraph", "\"We're done.\"")),
    takeaway("Sarvam thinks. LangGraph decides what happens next."),

    h("What LangGraph actually gives you", "part-8"),
    *p("Without a workflow framework, you write a growing pile of logic by hand: call the model, check the "
       "response, run a tool, check again, call the model again, maybe retry, maybe run another tool... As the "
       "agent grows, that pile gets ==hard to manage==.",
       "LangGraph makes the workflow explicit instead. Here's our debugger wired up with the real API. The three "
       "step functions are left short; the full version is in the Colab."),
    code("from typing import TypedDict\n"
         "from langgraph.graph import StateGraph, START, END\n\n"
         "class State(TypedDict):\n"
         "    code: str\n"
         "    diagnosis: str\n"
         "    passed: bool\n"
         "    attempts: int\n\n"
         "def diagnose(state): ...  # Sarvam reads the code and explains the bug\n"
         "def test(state): ...      # runs add(2, 3) and checks it equals 5\n"
         "def fix(state): ...       # Sarvam rewrites the code\n\n"
         "def route(state):\n"
         "    # Stop when the test passes, or after 3 tries so it can't loop forever\n"
         "    return \"done\" if state[\"passed\"] or state[\"attempts\"] >= 3 else \"fix\"\n\n"
         "graph = StateGraph(State)\n"
         "graph.add_node(\"diagnose\", diagnose)\n"
         "graph.add_node(\"test\", test)\n"
         "graph.add_node(\"fix\", fix)\n"
         "graph.add_edge(START, \"diagnose\")\n"
         "graph.add_edge(\"diagnose\", \"test\")\n"
         "graph.add_conditional_edges(\"test\", route, {\"fix\": \"fix\", \"done\": END})\n"
         "graph.add_edge(\"fix\", \"test\")\n\n"
         "app = graph.compile()\n"
         "result = app.invoke({\"code\": \"def add(a, b):\\n    return a - b\", \"attempts\": 0})", "python"),
    *p("Read it top to bottom and you can see the whole agent: the state, three nodes, the edges, one decision, "
       "and a loop from fix back to test."),
    takeaway("Nodes + edges + state + decisions + loops, instead of a pile of if-statements."),

    h("The mental model", "part-9"),
    img("mental-model",
        "LangGraph as the AI agent workflow at the centre: the LLM is the brain that reasons; tools are things it "
        "can use, like web search, code execution, databases and APIs; state is the information it carries, like "
        "user input, previous steps and tool results; decisions choose what happens next; loops try again until "
        "the result is right; together they complete the task."),
    box("Remember", BIG_IDEA),
    {"type": "cards", "items": [
        {"title": "LLM", "text": "The brain"},
        {"title": "LangGraph", "text": "The workflow, the control system"},
        {"title": "Tools", "text": "Things the agent can use"},
        {"title": "State", "text": "Information carried through the task"},
        {"title": "Conditional edges", "text": "Decisions"},
        {"title": "Loops", "text": "Try again"},
    ]},
    takeaway("Brain + tools + state + decisions + loops = an AI agent."),

    h("Now build one yourself", "part-10"),
    *p("Theory is nice, but you'll get LangGraph much faster by watching it run. We built this little LangGraph and "
       "Sarvam debugger in Colab. In it, you'll:"),
    ol("Give it broken Python code", "Ask Sarvam to diagnose it", "Create the LangGraph nodes", "Add state",
       "Run a test", "Add a decision", "Create a fix loop", "Watch the graph execute"),
    box("Run it in Colab", f"Everything above is in my notebook, ready to run: [open the Colab notebook]({COLAB})."),
    cta("Open the Colab notebook", COLAB),
    *p(f"**Watch it run.** I recorded the whole thing. You can also [watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "LangGraph debugger demo (Uma's video)",
     "caption": "LangGraph + Sarvam debugger demo · 4:23"},
    *p(f"To install it on your own machine: pip install -U langgraph. The latest version on [PyPI]({PYPI}) is "
       "1.2.12, from 21 September 2026."),
    takeaway("Run the notebook once and nodes, edges and state will make sense."),

    h("Final thought", "part-11"),
    *p("Don't think of LangGraph as ==another AI framework to memorise==. Think: \"I have an AI that needs to finish "
       "a task. LangGraph helps me design the path it follows.\""),
    pair(("A normal LLM", "Gives you an answer."),
         ("A workflow", "Thinks, acts, checks, decides, retries and finishes.")),
    *p("That jump from answering questions to actually finishing tasks is where agents start getting interesting."),
    *p(f"**Also read:** [RAG-Anything: RAG That Can Understand More Than Text]({RAG_ANYTHING_POST}), on agents that "
       f"retrieve from any kind of content, and [ColBERT: When Normal Semantic Search Isn't Enough]({COLBERT_POST})."),

    h("Resources"),
    *p("**LangGraph**"),
    ul("[LangGraph documentation](https://docs.langchain.com/oss/python/langgraph/): the main docs for concepts, "
       "APIs, memory, persistence, workflows and agents.",
       f"[LangGraph on GitHub]({REPO}): source code, examples, releases and the latest development.",
       "[LangGraph quickstart](https://docs.langchain.com/oss/python/langgraph/quickstart): a good next step after "
       "this post, for building your first graph."),
    *p("**Sarvam AI**"),
    ul("[Sarvam developer quickstart](https://docs.sarvam.ai/api/getting-started/quickstart): install the Python "
       "SDK and make your first Sarvam API call.",
       "[Sarvam chat completion API](https://docs.sarvam.ai/api/api-guides-tutorials/chat-completion/overview): how "
       "to use sarvam-105b for chat completions, like we do in the experiment.",
       "[Sarvam-105B model](https://docs.sarvam.ai/api/getting-started/models/sarvam-105b): what the model is built for: "
       "reasoning, coding and generation."),
    *p("**Try the experiment**",
       "Don't just read about nodes and edges. Open the Colab, run the tiny debugger and watch the graph move "
       "through diagnose → test → fix → test again.",
       f"Also: [my walkthrough video]({VIDEO_URL}), [our RAG-Anything post]({RAG_ANYTHING_POST}), [CrewAI vs n8n]"
       "(/blog/crewai-vs-n8n) for two other ways to build agents, and [LangGraph in our Toolkit](/toolkit/langgraph)."),
    cta("Open the Colab: LangGraph × Sarvam AI Debugger", COLAB),
]

POST = {
    "slug": "langgraph-ai-agents-workflow",
    "category": "agents",
    "title": "LangGraph: How AI Agents Actually Follow a Workflow",
    "excerpt": "An LLM gives an answer. An agent gets a job done. Here's how LangGraph turns steps, decisions, "
               "state and loops into an agent, with a tiny AI debugger you can run in Colab.",
    "cover": {"text": "LangGraph", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/workflow.webp", "width": SIZE[0], "height": SIZE[1], "alt": COVER_ALT}},
    # Was featured until the CrewAI vs n8n post (1 Oct 2026).
    "featured": None,
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-01",
    "learn": [
        "The difference between an LLM and an AI agent",
        "LangGraph's 4 building blocks: nodes, edges, state and decisions",
        "How a loop lets an agent try again until it works",
        "How LangGraph and Sarvam split the work in a tiny AI debugger",
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
