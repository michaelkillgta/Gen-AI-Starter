"""Adds (or updates) Uma's post "Phoenix: The CCTV for Your AI Application" in api/seed/posts.json.

Text: Uma's draft rewritten in plain prose, same order and experiment. Facts checked on 3 Oct 2026: arize-phoenix
20.19.0 (1 Oct 2026); self-hosted, source-available under the Elastic License 2.0 (Arize calls it open source);
tracing is OpenTelemetry-based (OpenInference); setup via phoenix.otel.register(). Phoenix shows traces; judging
answer quality needs its separate Evals. retrieve() and ask_ai() are helpers from Uma's Colab.
Run from the repo root:  python scripts/seed-post-phoenix.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
PROMPTFOO_POST = "/blog/ai-red-teaming-promptfoo"
COLBERT_POST = "/blog/colbert-when-semantic-search-isnt-enough"
RAG_ANYTHING_POST = "/blog/rag-anything-multimodal-rag"
DOCS = "https://arize.com/docs/phoenix"
TRACING = "https://arize.com/docs/phoenix/tracing/llm-traces"
REPO = "https://github.com/Arize-ai/phoenix"
PYPI = "https://pypi.org/project/arize-phoenix/"
OPENROUTER = "https://openrouter.ai/docs"
# Uma's own recording (YouTube title "Phoenix", 8:07) and notebook.
VIDEO = "TBdFCNfcbVs"
VIDEO_URL = f"https://youtu.be/{VIDEO}"
COLAB = "https://colab.research.google.com/drive/1LZ8BPgJDoj2rYvxfAcSJ-NGCXxkBUYQy"


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


BIG_IDEA = ("==RAG finds== the information. ==The LLM generates== the answer. ==Phoenix shows== what happened along "
            "the way. It doesn't fix anything; it lets you see.")

BODY = [
    *p("You built a RAG app. It finds documents, hands the useful bits to an LLM, and the LLM writes an answer.",
       "Then the annoying question shows up: ==\"Okay... but what actually happened inside my AI?\"== Did it find "
       "the right documents? What scores did they get? What context reached the LLM? What did the LLM do with it?",
       "That's where Arize Phoenix comes in.",
       f"▶ [Watch my 8-minute Phoenix demo](#video-{VIDEO})"),
    cta("Try it yourself: open the Colab notebook", COLAB),
    box("The one idea to remember", BIG_IDEA),

    h("First, a quick RAG refresher", "part-1"),
    *p("RAG means ==retrieval-augmented generation==. Instead of answering only from what it learned in training, "
       "the LLM first gets relevant information from your own documents:"),
    flow("User question", "Find relevant information", "Retrieved documents", "LLM", "Answer"),
    pair(("RAG", "Finds the information."), ("LLM", "Uses it to write the answer.")),
    *p(f"Want the deeper version? Our posts on [ColBERT]({COLBERT_POST}) and [RAG-Anything]({RAG_ANYTHING_POST}) go "
       "into how retrieval works."),
    takeaway("RAG fetches. The LLM writes."),

    h("The problem: you only see the answer", "part-2"),
    *p("Say your RAG app gives a weird answer. All you see is: question in, weird answer out. What happened in the "
       "middle? Maybe:"),
    ul("the wrong document was retrieved",
       "the right document came back with a low score",
       "the wrong context reached the LLM",
       "the LLM misread good context",
       "something else in the pipeline broke"),
    *p("Staring at the final answer won't tell you which. ==You need to see the middle.=="),
    takeaway("A bad answer has many possible causes. You need to see the steps."),

    h("Phoenix is CCTV for your AI", "part-3"),
    {"type": "image", "src": "/blog/phoenix/cctv.webp", "width": 1672, "height": 941, "caption": 'An illustration; the names, scores and timings in it are examples.',
     "alt": "Phoenix as CCTV for AI workflows: a camera watches each step of a RAG app, from the user's question through retrieval and the LLM to the answer, so you can replay what happened."},
    *p("Think of a CCTV camera. It doesn't walk into the building and fix things. It ==records what happened==, so "
       "you can rewind and look.",
       "Phoenix does that for your AI app. It ==traces== each run, so you can open it later and inspect:"),
    ul("the user's question", "the retrieval step", "which documents came back", "their retrieval scores",
       "the context sent to the LLM", "the LLM's response", "the final answer"),
    box("Be clear on what it does", "Phoenix ==doesn't fix the problem for you==. It helps you see it. Checking "
                                    "whether answers are actually good is a separate job (Phoenix has Evals for "
                                    "that)."),
    takeaway("Phoenix records. You debug."),

    h("The RAG pipeline in our experiment", "part-4"),
    *p("Our Colab uses a real, small RAG pipeline. retrieve() and ask_ai() are helper functions in the notebook: "
       "one searches our documents, the other calls an LLM through OpenRouter. First the question and retrieval:"),
    code('question = "How does retrieval augmented generation help a language model?"\n'
         'results = retrieve(question)  # the documents that best match the question', "python"),
    *p("Then we join the documents' text into one ==context==, the information packet we hand to the LLM:"),
    code('context = "\\n\\n".join(f\'{r["title"]}: {r["text"]}\' for r in results)\n'
         'answer = ask_ai(question, context)  # the LLM writes the answer from the context', "python"),
    flow("Question + retrieved context", "LLM", "Answer"),
    *p("Remember: the ==information comes from RAG==, but the ==final wording comes from the LLM==."),
    takeaway("Question and context go in, the answer comes out."),

    h("Now turn on Phoenix", "part-5"),
    *p("Now we wrap the pipeline in ==tracing==. Phoenix uses OpenTelemetry, a standard way to record what code "
       "does. Each step becomes a ==span==, and the whole run becomes a ==trace==:"),
    code('from phoenix.otel import register\n\n'
         'tracer = register(project_name="rag-demo").get_tracer(__name__)\n\n'
         'def traced_rag(question):\n'
         '    with tracer.start_as_current_span("RAG application") as root:\n'
         '        root.set_attribute("question", question)\n\n'
         '        with tracer.start_as_current_span("Retrieval") as span:\n'
         '            results = retrieve(question)\n'
         '            span.set_attribute("documents", [r["title"] for r in results])\n'
         '            span.set_attribute("scores", [r["score"] for r in results])\n\n'
         '        context = "\\n\\n".join(f\'{r["title"]}: {r["text"]}\' for r in results)\n'
         '        answer = ask_ai(question, context)\n'
         '        root.set_attribute("final_answer", answer)\n'
         '        return results, answer', "python"),
    *p("Now every run records the question, which documents were retrieved, their scores, and the final answer. "
       "Your OpenRouter key stays in an environment variable or a Colab secret, never in the code."),
    takeaway("Wrap each step in a span, and Phoenix can show you all of them."),

    h("Run a test and look at the trail", "part-6"),
    {"type": "image", "src": "/blog/phoenix/dashboard.webp", "width": 1672, "height": 941, "caption": 'An illustration; the names, scores and timings in it are examples.',
     "alt": 'What happened inside the AI: a pipeline of question, retrieval with document scores, context, LLM and answer, next to an observability dashboard showing the same run as a trace of steps.'},
    *p("Here's a second test from the experiment:"),
    code('test_question = "How are vector databases used to store and search embeddings?"\n'
         'test_results, test_answer = traced_rag(test_question)\n\n'
         'print("QUESTION:", test_question)\n'
         'print("\\nRETRIEVED:")\n'
         'for r in test_results:\n'
         '    print(f\'- {r["title"]}  score={r["score"]:.3f}\')\n'
         'print("\\nANSWER:\\n", test_answer)', "python"),
    *p("Instead of just \"Here's the answer...\", you can now see the whole journey. In our run, two documents came "
       "back, one scoring ==0.811== and one ==0.385==:"),
    flow("Question", "Retrieval", "Document A: 0.811, Document B: 0.385", "Retrieved context", "LLM",
         "Final answer"),
    *p("Now when an answer looks wrong, you can ask the right question: ==did RAG fetch the wrong information, or "
       "did it fetch good information and the LLM fumble it?== That's the real value of tracing."),
    takeaway("The trail tells you where it went wrong."),

    h("Try it yourself", "part-7"),
    box("Run it in Colab", f"The full RAG pipeline with Phoenix tracing, ready to run: [open the Colab notebook]"
                           f"({COLAB}). Add your OpenRouter key as a Colab secret."),
    cta("Open the Colab notebook", COLAB),
    *p(f"**Watch it run.** I recorded the whole thing. You can also [watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "Phoenix (Uma's demo video)", "caption": "Phoenix · 8:07"},
    *p("To try Phoenix on your own laptop: pip install arize-phoenix, then phoenix serve to open the Phoenix app."),

    h("RAG finds. LLM generates. Phoenix shows.", "part-8"),
    {"type": "image", "src": "/blog/phoenix/pipeline.webp", "width": 1942, "height": 809, "caption": 'An illustration; the names, scores and timings in it are examples.',
     "alt": 'RAG finds, LLM generates, Phoenix shows: RAG retrieves the useful information, the LLM writes the answer, and Phoenix watches the whole pipeline and shows what happened at each step.'},
    {"type": "cards", "items": [
        {"title": "RAG", "text": "Finds useful information"},
        {"title": "LLM", "text": "Writes the answer"},
        {"title": "Phoenix", "text": "Shows what happened along the way"},
    ]},
    *p("Phoenix isn't another LLM. It isn't the RAG system. And it isn't a magic repair button. It's the "
       "==visibility layer== for your AI app.",
       "That gets more useful as your app grows from a demo into a real system with RAG, agents, tools and many "
       "steps. When something goes wrong, ==don't just stare at the final answer. Look at the trail.=="),
    box("Remember", BIG_IDEA),
    *p(f"**Also read:** [Your AI Looks Smart. But Can You Break It?]({PROMPTFOO_POST}), where Promptfoo tests your "
       "AI, and Phoenix helps you see why a test failed."),

    h("Resources"),
    ul(f"[Phoenix docs]({DOCS}): setup, tracing, evals and running Phoenix locally or in the cloud.",
       f"[Phoenix tracing guide]({TRACING}): how traces and spans work, and how to add them to your app.",
       f"[Phoenix on GitHub]({REPO}): source code, examples and integrations.",
       f"[arize-phoenix on PyPI]({PYPI}): the Python package and its releases.",
       f"[OpenRouter docs]({OPENROUTER}): the API our experiment uses to call the LLM.",
       "[Arize Phoenix in our Toolkit](/toolkit/arize): our quick verdict.",
       f"[My Colab notebook]({COLAB}) and [my demo video]({VIDEO_URL})."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [{"label": "Arize Phoenix", "href": "/toolkit/arize"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "arize-phoenix-ai-observability",
    "category": "rag-and-documents",
    "title": "Phoenix: The CCTV for Your AI Application",
    "excerpt": "Your RAG app gave a weird answer. Was it the retrieval or the LLM? Arize Phoenix records every step, "
               "so you can rewind and see. With a real traced RAG pipeline you can run in Colab.",
    "cover": {"text": "Phoenix", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": "/blog/phoenix/cctv.webp", "width": 1672, "height": 941, "alt": "Phoenix as CCTV for AI workflows: a camera watches each step of a RAG app, from the user's question through retrieval and the LLM to the answer, so you can replay what happened."}},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "Phoenix", "caption": "CCTV for your AI: see what happened inside"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-03",
    "learn": [
        "Why the final answer alone can't tell you what went wrong",
        "What Phoenix records: question, documents, scores, context, answer",
        "How to add tracing to a RAG pipeline with a few lines",
        "How to tell a retrieval problem from an LLM problem",
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
