"""Adds (or updates) Uma's post "LangSmith: The Testing Lab for Your AI Application" in api/seed/posts.json,
with her 4 visuals in web/public/blog/langsmith/ (converted to WebP by hand on 3 Oct 2026).

Text: Uma's draft and her examples list rewritten in plain prose; the 11 examples are a clickable Tabs block.
Facts checked on 3 Oct 2026: langsmith SDK 0.14.4 (2 Oct 2026); free tier includes 5k traces a month, then
paid; evaluator types (code, LLM-as-a-judge, composite, summary, pairwise), backtesting, regression testing,
online evaluations and annotation are all in the docs. Works with or without LangChain.
Run from the repo root:  python scripts/seed-post-langsmith.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/langsmith"
SIZE = (1672, 941)
PHOENIX_POST = "/blog/arize-phoenix-ai-observability"
PROMPTFOO_POST = "/blog/ai-red-teaming-promptfoo"
LANGGRAPH_POST = "/blog/langgraph-ai-agents-workflow"
EVAL_TYPES = "https://docs.langchain.com/langsmith/evaluation-types"
EVAL_PLATFORM = "https://www.langchain.com/langsmith/evaluation"
OBSERVABILITY = "https://www.langchain.com/langsmith/observability"
CODE_EVALS = "https://github.com/langchain-ai/docs/blob/main/src/langsmith/code-evaluator-sdk.mdx"
ONLINE_EVALS = "https://docs.langchain.com/langsmith/online-evaluations-llm-as-judge"
COLAB = "https://colab.research.google.com/drive/1uQtqhzxSRPAOCWluB8_0XT-isF9WwY-L"
ILLUSTRATION = "An illustration; the scores, model names and timings in it are examples."


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, caption=ILLUSTRATION, size=SIZE):
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


def tab(title, *blocks):
    return {"title": title, "blocks": list(blocks)}


BIG_IDEA = ("LangSmith doesn't improve your AI. ==You change it==, and LangSmith ==helps you measure the change==: same "
            "test questions, different version, score both, compare.")

COVER_ALT = (
    "The LangSmith testing lab: a dashboard for an AI app showing traces of each run, a dataset of test questions, "
    "evaluation scores and a comparison between two versions of the app."
)

EXAMPLES = {"type": "tabs", "label": "Pick an example", "items": [
    tab("RAG apps",
        *p("You change retrieval from the top 1 chunk to the top 3. Did the answers actually get better?",
           "Build a dataset of questions with expected answers, run both versions, and compare the scores. Benchmarking "
           "a RAG system like this is one of the main things LangSmith's docs cover."),
        flow("Question", "Retriever", "Documents", "LLM", "Answer")),
    tab("AI agents",
        *p("Your agent can search the web, query a database, use a calculator and call APIs, and it gave a wrong "
           "answer.",
           "Instead of only staring at the final reply, open the trace and see every step: which tools it called, in "
           "what order, and what each returned."),
        flow("Agent", "Tool 1", "Tool 2", "Tool 3", "Final answer")),
    tab("Prompt testing",
        *p("Prompt V1 says \"Answer the user's question.\" Prompt V2 adds \"Explain clearly, keep it simple, give an "
           "example.\" Which one is actually better?",
           "Rather than testing 100 questions by hand twice, run the same dataset against both prompts and compare.")),
    tab("Model comparison",
        *p("You use Model A and want to try Model B. Don't ask \"which one feels better?\" Run the same benchmark "
           "through both and compare the scores. Useful when you switch providers, versions or settings."),
        flow("Same dataset", "Model A and Model B", "Scores", "Compare")),
    tab("Customer support",
        *p("Your test set holds real-style questions: \"How can I return my order?\", \"Where is my package?\", "
           "\"What if my payment fails?\"",
           "Check that the bot gives correct info, follows company rules, returns the required fields, uses the right "
           "tools and keeps the right tone. Simple code checks handle structure; an LLM judge can score tone and "
           "meaning.")),
    tab("Coding agents",
        *p("Your dataset is coding tasks: fix this bug, add this feature, write this function, refactor this code. "
           "When version 2 of your agent ships, run the same tasks again and check: does the code compile, do the "
           "tests pass, are the right files there?")),
    tab("AI tutors",
        *p("\"Explain Newton's second law to a Class 11 student.\" Build a dataset of real student questions and "
           "score each answer: correct? clear? relevant? too complicated? Different evaluators can check different "
           "qualities, then combine into one score.")),
    tab("Regression testing",
        *p("Your AI scores 92% on your test set. You tweak the prompt, and now it scores 76%. The app still "
           "\"works\", but you just made it worse.",
           "Running every new version against the same tests catches that before your users do. Don't let "
           "yesterday's working AI become tomorrow's broken AI.")),
    tab("Backtesting",
        *p("A new model comes out. Instead of switching your live traffic straight away, run it on real past "
           "questions from your app and compare with how the old version did. LangSmith calls this backtesting, and "
           "it's a much safer way to make a big model change."),
        flow("New model", "Historical examples", "Evaluate", "Compare with the old version")),
    tab("Production monitoring",
        *p("LangSmith isn't only for before launch. Once your app is live, it can trace real requests and run "
           "online evaluators on them, so you spot quality dropping or odd answers early."),
        flow("User request", "Live AI", "Answer", "Online evaluator", "Quality signal")),
    tab("Human review",
        *p("Some things a script can't judge, like whether a health-support reply is caring and useful. LangSmith "
           "supports human annotation next to automatic checks: automated scores flag the uncertain cases, an expert "
           "reviews them, and you sharpen your criteria."),
        flow("AI output", "Automatic evaluation", "Uncertain cases", "Human review", "Better criteria")),
]}

BODY = [
    *p("Building an AI app is easy to underestimate. You write a prompt, connect an LLM, add RAG, maybe some tools "
       "and agents. Then you change something and wonder: ==\"Did I make the AI better, or just different?\"==",
       "That's the question LangSmith helps you answer."),
    cta("Try it yourself: open the Colab notebook", COLAB),
    box("The one idea to remember", BIG_IDEA),

    h("What is LangSmith?", "part-1"),
    img("testing-lab", COVER_ALT),
    *p("LangSmith is a platform for ==developing, tracing, testing, evaluating and monitoring== AI apps, from the "
       "team behind LangChain. It works with or without LangChain, and there's a free tier (5,000 traces a month) "
       "before paid plans.",
       "The best way to think of it: ==a testing lab for AI==. Normal software has tests. AI apps need them too, "
       "with one twist: LLMs don't always give the same answer twice. So besides \"did my code run?\", you also need "
       "to ask ==\"was the answer actually good?\"=="),
    takeaway("LangSmith is where you test your AI, not just run it."),

    h("The problem with building AI", "part-2"),
    *p("Say you're building a RAG app:"),
    flow("User question", "Retriever", "Relevant documents", "LLM", "Answer"),
    *p("Version 1 works. Then you tweak it: top 3 documents instead of 1, different chunking, a new prompt, another "
       "model. It still runs. But ==did the answers improve?==",
       "You can't tell from one response. You need a ==repeatable test==."),
    takeaway("\"It still runs\" isn't the same as \"it got better\"."),

    h("The core idea: same questions, different versions", "part-3"),
    img("same-test",
        "Same test, different AI versions: one dataset of five questions with expected answers runs through RAG "
        "version 1 and RAG version 2, each set of answers is scored, and the scores are compared."),
    *p("Write five questions with expected answers. That's your ==evaluation dataset==. Run version 1 on it and score "
       "the answers. Change the app, run version 2 on the same questions, score again:"),
    pair(("RAG v1", "3 out of 5"), ("RAG v2", "5 out of 5")),
    *p("Now you have ==evidence== that your change helped, at least on this test set. And remember who did what: "
       "you changed the RAG; LangSmith measured it."),
    takeaway("Same questions, different version, compare the scores."),

    h("What LangSmith actually does", "part-4"),
    img("builds-better",
        "How LangSmith builds better AI: trace what happened in each run, evaluate whether answers were good, keep "
        "datasets of what to test, and run experiments to see if a change helped."),
    {"type": "cards", "items": [
        {"title": "Trace", "text": "What happened? See each step of a run, from question to retriever to LLM to answer."},
        {"title": "Evaluate", "text": "Was it good? Score answers with code checks, an LLM judge or human review."},
        {"title": "Dataset", "text": "What should we test? A saved set of questions and expected answers."},
        {"title": "Experiment", "text": "Did the change help? Run versions on the same dataset and compare."},
    ]},
    *p("An evaluator doesn't have to be fancy. In our experiment, each question has required concepts. For \"What does "
       "break do?\", a good answer must mention break, a word like stop, terminate or end, and loop. All there: ==score "
       "1==. Anything missing: ==score 0==. Simple and reproducible."),
    *p("Over time, your dataset becomes your app's ==test suite==. Keep the questions that matter, and every time you "
       "change the prompt, model, retrieval or agent logic, test the new version against the same set. That's "
       "==regression testing for AI behaviour==."),
    takeaway("It's not just monitoring. It's trace, evaluate, dataset, experiment."),

    h("Where can you use LangSmith?", "part-5"),
    *p("Not just RAG. Anywhere you build AI and need to see what happened, test it, score it or compare versions. "
       "Pick an example:"),
    EXAMPLES,
    *p("The pattern is always the same: ==same test cases, different AI version, evaluate, compare==."),
    takeaway("If you can write test questions for it, you can measure it."),

    h("What about Phoenix?", "part-6"),
    img("vs-phoenix",
        "Phoenix versus LangSmith: Phoenix gives a deep look at what happened inside one AI run, step by step; "
        "LangSmith runs the same test dataset through different versions of your app and compares the scores. Both "
        "can trace and evaluate."),
    *p(f"If you've read our [Phoenix post]({PHOENIX_POST}), you'll spot overlap: Phoenix can evaluate too, and "
       "LangSmith can trace too. So don't think \"Phoenix traces, LangSmith evaluates\". That's too simple."),
    pair(("Phoenix", "\"Show me exactly what happened inside this run.\" A deep look at one execution."),
         ("LangSmith", "\"Test, score and compare my app systematically.\" Repeatable tests across versions.")),
    *p("The difference is more about ==how you use each one== than a strict line between features."),
    takeaway("Both can trace and evaluate. Pick by what you're trying to do."),

    h("Try it yourself", "part-7"),
    *p("Our Colab does exactly the core idea: ==same dataset, RAG v1, RAG v2, score both, compare==. Here's the "
       "shape of it with the LangSmith SDK. rag_v1 and rag_v2 are the two pipelines from the notebook, and your API "
       "key comes from the LANGSMITH_API_KEY environment variable:"),
    code('from langsmith import Client\n\n'
         'client = Client()  # reads LANGSMITH_API_KEY from the environment\n'
         'dataset = client.create_dataset("python-basics")\n'
         'client.create_examples(dataset_id=dataset.id, examples=[\n'
         '    {"inputs": {"question": "What does break do?"},\n'
         '     "outputs": {"concepts": [["break"], ["stop", "terminate", "end"], ["loop"]]}},\n'
         '])\n\n'
         'def has_concepts(outputs, reference_outputs):\n'
         '    answer = outputs["answer"].lower()\n'
         '    ok = all(any(w in answer for w in group) for group in reference_outputs["concepts"])\n'
         '    return {"key": "concepts", "score": int(ok)}\n\n'
         'for name, rag in [("rag-v1", rag_v1), ("rag-v2", rag_v2)]:\n'
         '    client.evaluate(rag, data="python-basics", evaluators=[has_concepts], experiment_prefix=name)',
         "python"),
    *p("Then open both experiments in LangSmith side by side and see which questions changed and why."),
    box("Run it in Colab", f"The full RAG v1 vs v2 experiment, ready to run: [open the Colab notebook]({COLAB}). Add "
                           "your keys as Colab secrets."),
    cta("Open the Colab notebook", COLAB),

    h("The one sentence to remember", "part-8"),
    *p("LangSmith helps you turn an AI app from something you ==casually try== into something you ==systematically "
       "trace, evaluate and improve==."),
    pair(("Not this", "Change something, ask ChatGPT twice, \"seems better 👍\"."),
         ("This", "Change something, run the same tests, evaluate, inspect failures, compare, change again.")),
    box("Remember", BIG_IDEA),
    *p(f"**Also read:** [Phoenix: The CCTV for Your AI Application]({PHOENIX_POST}), [Your AI Looks Smart. But Can "
       f"You Break It?]({PROMPTFOO_POST}) for testing your AI against attacks, and [LangGraph]({LANGGRAPH_POST}) for "
       "agents worth tracing."),

    h("References"),
    ul(f"[LangSmith: evaluation types]({EVAL_TYPES}): benchmarking, regression testing, backtesting and every "
       "evaluator type.",
       f"[LangSmith: evaluation]({EVAL_PLATFORM}): the overview of datasets, experiments and comparing versions.",
       f"[LangSmith: observability]({OBSERVABILITY}): tracing and debugging your app and agents.",
       f"[LangSmith: code evaluators]({CODE_EVALS}): writing your own scoring functions in code.",
       f"[LangSmith: online evaluations]({ONLINE_EVALS}): scoring live production traffic with an LLM judge.",
       "[LangSmith in our Toolkit](/toolkit/langsmith): our quick verdict.",
       f"[My Colab notebook]({COLAB}): the RAG v1 vs v2 experiment."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [{"label": "LangSmith", "href": "/toolkit/langsmith"},
                                                                  {"label": "Arize Phoenix", "href": "/toolkit/arize"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "langsmith-testing-lab-for-ai",
    "category": "rag-and-documents",
    "title": "LangSmith: The Testing Lab for Your AI Application",
    "excerpt": "You changed your AI. Did it get better, or just different? LangSmith runs the same test questions "
               "through each version, scores them and compares. With 11 real examples and a Colab experiment.",
    "cover": {"text": "LangSmith", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/testing-lab.webp", "width": SIZE[0], "height": SIZE[1], "alt": COVER_ALT}},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "LangSmith", "caption": "the testing lab for your AI application"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-03",
    "learn": [
        "Why \"it still runs\" doesn't mean your AI got better",
        "The core loop: same questions, different version, score, compare",
        "What LangSmith does: trace, evaluate, datasets, experiments",
        "11 places you can use it, from RAG to human review",
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
