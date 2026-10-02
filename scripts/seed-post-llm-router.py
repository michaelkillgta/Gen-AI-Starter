"""Adds (or updates) Uma's post "LLM Routers: Why Your AI App Doesn't Need One Model for Everything" in
api/seed/posts.json, with her 5 visuals in web/public/blog/llm-router/ (converted to WebP by hand on 2 Oct 2026).

Text: Uma's draft rewritten in plain prose, same order. Mercury (the decider) and Apodex are the models Uma's
Colab uses; they weren't independently verified, so the post only describes them as her experiment's choices.
The pictures are illustrations. No cost or speed numbers are claimed.
Run from the repo root:  python scripts/seed-post-llm-router.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/llm-router"
SIZE = (1672, 941)
LANGGRAPH_POST = "/blog/langgraph-ai-agents-workflow"
TEMPORAL_POST = "/blog/temporal-long-running-ai-workflows"
SARVAM = "https://docs.sarvam.ai/api/getting-started/models/sarvam-105b"
OPENROUTER = "https://openrouter.ai/docs"
# Uma's own recording (YouTube title "LLM Router", 7:05) and notebook.
VIDEO = "K9VYU4aLxRg"
VIDEO_URL = f"https://youtu.be/{VIDEO}"
COLAB = "https://colab.research.google.com/drive/1cEgyx2bdGJUOL7KWil7R9qgIHbYSTspS"
ILLUSTRATION = "An illustration of the idea."


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


BIG_IDEA = ("An LLM router is the ==traffic controller==: it decides ==which AI model handles each request==. It "
            "doesn't answer the request itself.")

COVER_ALT = (
    "LLM router: the right model for every task. Incoming requests of different kinds go to a router, which sends "
    "each one to the model that fits it best, such as a fast model for simple tasks or a stronger model for hard "
    "ones, and the answer goes back to the user."
)

BODY = [
    *p("Imagine you run an AI app. One user asks, \"Translate this sentence.\" Another wants a Python function. A "
       "third says, \"Analyse this huge business problem.\"",
       "Would you send all three to your ==biggest, most expensive model==? Probably not. That's like calling a "
       "senior engineer every time someone asks where the settings button is. 😭",
       "That's where ==LLM routing== comes in.",
       f"▶ [Watch my 7-minute LLM router demo](#video-{VIDEO})"),
    cta("Try it yourself: open the Colab notebook", COLAB),
    box("The one idea to remember", BIG_IDEA),

    h("So what is an LLM router?", "part-1"),
    img("routing-explained",
        "AI model routing explained in four steps: a prompt comes in, the router reads it, it selects the model "
        "that fits, and that model writes the answer.", ILLUSTRATION),
    *p("An LLM router is a ==decision layer== that picks which AI model should handle a request. Instead of every "
       "request going to one model:"),
    flow("User", "One LLM", "Answer"),
    *p("you put a router in front of several:"),
    flow("User", "Router: which model fits?", "Model A, B or C", "Answer"),
    *p("The router usually doesn't answer the user. Its only job is to ask: ==\"Who should handle this?\"=="),
    takeaway("The router picks the model. The model writes the answer."),

    h("Why not just use one powerful model?", "part-2"),
    img("one-model-vs-routing",
        "One model versus smart routing. With one model, every request, easy or hard, goes to the same big model. "
        "With smart routing, each request goes to a model that suits it.", ILLUSTRATION),
    *p("Every AI app balances three things: ==cost==, ==speed== and ==capability==. A powerful model can be "
       "excellent, but using it for every tiny request is often unnecessary. A router might choose like this:"),
    {"type": "cards", "items": [
        {"title": "\"Translate this sentence to Telugu.\"", "text": "A fast multilingual model"},
        {"title": "\"Write a React component.\"", "text": "A model that's good at code"},
        {"title": "\"Analyse this complicated system design.\"", "text": "A strong reasoning model"},
        {"title": "\"Research and compare several approaches.\"", "text": "A research-oriented model"},
        {"title": "\"Summarise these 3 paragraphs.\"", "text": "A fast general model"},
    ]},
    *p("The exact choices depend on how you design your app. The idea is simple: ==different requests have "
       "different needs==."),
    takeaway("One model for everything is easy. It's rarely the best fit."),

    h("The router is a traffic controller", "part-3"),
    img("traffic-control",
        "AI traffic control: requests arrive like planes at an airport, and the router directs each one to the "
        "right gate, such as a fast model, a strong model or a research model, before the answer goes back.",
        ILLUSTRATION),
    *p("Think of a busy airport. Not every plane goes to the same gate. The airport looks at each flight and "
       "decides where it should go.",
       "A router does the same with requests. It looks at what kind of task it is and sends it to a fast model, a "
       "strong model or a research model. The router is the ==traffic controller, not the destination==."),
    takeaway("Router = air traffic control. Models = the gates."),

    h("What does the router look at?", "part-4"),
    ul("**The task.** \"Translate this sentence\" is very different from \"Design the architecture for a large AI "
       "platform\".",
       "**How complex it is.** A simple request may not need the same model as a multi-step problem.",
       "**The domain.** Your app might have models that are better at coding, translation, research, reasoning, "
       "customer support, images or summaries.",
       "**Cost and speed.** Sometimes you want \"a good answer, fast\". Sometimes you want \"take your time and get "
       "it right\"."),
    takeaway("The router reads the request before any money is spent on the answer."),

    h("What happens inside the app", "part-5"),
    flow("User: \"Debug this Python app\"", "Router: \"looks like coding\"", "Selected model",
         "Model writes the answer", "User gets the reply"),
    *p("One detail people miss: the user's prompt ==doesn't disappear==. The router makes its decision, then the "
       "==original prompt== goes to the chosen model."),
    takeaway("Decide first, then send the original prompt."),

    h("The cool part: AI choosing AI", "part-6"),
    img("ai-chooses",
        "The AI that chooses your answer: a first model reads the prompt and decides which second model should "
        "answer it, then that model replies.", ILLUSTRATION),
    *p("You could write hundreds of rules like \"if coding, use model A\". Or you can let ==another model make the "
       "decision==."),
    flow("User prompt", "Decider model", "\"Use Sarvam 105B\"", "Sarvam 105B", "Answer"),
    *p("The first model isn't solving the user's problem. It's deciding ==which model should solve it==. That's the "
       "core of smart routing.",
       "In our experiment, an app has two models to choose from. \"Design a fault-tolerant architecture for an AI "
       "app\" needs complex reasoning over several steps, so the router picks Sarvam 105B. \"Investigate different "
       "ways to make AI agents more reliable\" is research and comparison, so it picks Apodex. ==Same app, "
       "different request, different model==."),
    takeaway("A small, quick model can be the manager for bigger ones."),

    h("What it looks like in code", "part-7"),
    *p("You don't need a big framework to get the idea. It's two steps: ==decide==, then ==call==. Here's a short "
       "version of the Colab's flow. The call_ functions are small helpers that call each model's API, with keys "
       "read from environment variables, never written in the code:"),
    code('import json\n\n'
         'ROUTER_PROMPT = """Pick the best model for this request. Reply with JSON only:\n'
         '{"model": "sarvam-105b" or "apodex", "confidence": 0 to 1}\n'
         'sarvam-105b: reasoning, coding, architecture\n'
         'apodex: research and comparing approaches\n'
         'Request: """\n\n'
         'def mercury_route(prompt):\n'
         '    reply = call_decider(ROUTER_PROMPT + prompt)  # the decider model\n'
         '    return json.loads(reply)                      # e.g. {"model": "sarvam-105b", "confidence": 0.9}\n\n'
         'def generate_with_route(route, prompt):\n'
         '    models = {"sarvam-105b": call_sarvam, "apodex": call_openrouter}\n'
         '    try:\n'
         '        return models[route["model"]](prompt)  # send the ORIGINAL prompt\n'
         '    except Exception:\n'
         '        return call_sarvam(prompt)              # fallback if the chosen model fails\n\n'
         'prompt = "Debug the system"\n'
         'answer = generate_with_route(mercury_route(prompt), prompt)', "python"),
    *p("That's the whole pattern: one function decides, one function calls, and a ==fallback== catches the case "
       "where the chosen model is down."),
    takeaway("Route, then call. Add a fallback and you're production-minded."),

    h("Our Colab experiment", "part-8"),
    *p("We built exactly this pipeline:"),
    flow("Your prompt", "Mercury decides", "Sarvam 105B (Sarvam API) or Apodex (OpenRouter)", "Answer"),
    *p("When we typed \"Debug the system\", Mercury returned a structured decision choosing ==Sarvam 105B==, with "
       "its confidence and probabilities. Then our Python code sent the original prompt to Sarvam and printed the "
       "answer. A real, working example, not just a diagram.",
       "Mercury and Apodex are simply the models our experiment uses. The pattern works with any models you can "
       "call."),
    box("Run it in Colab", f"The whole router, ready to run: [open the Colab notebook]({COLAB}). Add your own API "
                           "keys as Colab secrets."),
    cta("Open the Colab notebook", COLAB),
    *p(f"**Watch it run.** I recorded the whole thing. You can also [watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "LLM Router (Uma's demo video)", "caption": "LLM Router · 7:05"},
    takeaway("Prompt in, decision made, right model answers."),

    h("Why this matters in production", "part-9"),
    *p("Picture an app getting ==100,000 requests==. If every one goes to the same expensive model, you're treating "
       "\"Translate hello\" and \"Design a distributed AI system\" as if they need the same brainpower.",
       "A router lets your app make a choice ==before spending compute on the answer==. That helps you design "
       "around speed, cost, model ability and what each task actually needs. And a good router has ==fallback "
       "paths== for when a model isn't available."),
    takeaway("At scale, small choices per request add up."),

    h("The common mistake", "part-10"),
    *p("A router isn't just \"small question, small model\". Real routing can weigh a lot more:"),
    flow("Task", "Difficulty", "Ability needed", "Speed needed", "Cost", "Is the model available?",
         "Best available route"),
    *p("So routing isn't about finding ==the best model in the world==. It's about finding ==the right model for "
       "this request==."),
    takeaway("Best model ≠ right model."),

    h("The one sentence to remember", "part-11"),
    box("Remember", BIG_IDEA),
    *p("Your app doesn't have to marry one model. 💀 It can have a ==team of models==, and the router decides who "
       "gets the next task."),
    *p(f"**Also read:** [LangGraph: How AI Agents Actually Follow a Workflow]({LANGGRAPH_POST}), where a router "
       f"could be one node, and [Temporal]({TEMPORAL_POST}), for keeping multi-model workflows alive."),

    h("Resources"),
    ul(f"[My Colab notebook]({COLAB}): the router experiment from this post.",
       f"[My walkthrough video]({VIDEO_URL}): the demo, start to finish.",
       f"[Sarvam-105B model]({SARVAM}): the model our router picked for reasoning and coding.",
       f"[OpenRouter docs]({OPENROUTER}): one API to call many different models.",
       "[LLM Router in our Toolkit](/toolkit/llmrouter): our quick verdict."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [{"label": "LLM Router", "href": "/toolkit/llmrouter"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "llm-routers-model-routing",
    "category": "agents",
    "title": "LLM Routers: Why Your AI App Doesn't Need One Model for Everything",
    "excerpt": "Translating a sentence and designing a system don't need the same model. An LLM router picks the "
               "right one for each request. Here's how it works, with a tiny router you can run in Colab.",
    "cover": {"text": "LLM Router", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/right-model.webp", "width": SIZE[0], "height": SIZE[1], "alt": COVER_ALT}},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "LLM Router", "caption": "the right model for every request"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-02",
    "learn": [
        "What an LLM router is, and why one model for everything is wasteful",
        "What a router looks at before choosing a model",
        "How one AI model can choose another",
        "A tiny route-then-call example, with a fallback",
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
