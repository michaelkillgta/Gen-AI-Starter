"""Adds (or updates) Uma's post "Modal: Run Your AI Code in the Cloud Without Managing Servers" in
api/seed/posts.json, with her 4 visuals in web/public/blog/modal/ (converted to WebP by hand on 6 Oct 2026).

Text: Uma's draft rewritten in plain prose, same order. The code is a shortened version of her repo's
backend/modal_app.py (github.com/michaelkillgta/Modal-Sentiment-demo): CPU only, model loaded once per container
with @modal.enter, served with @modal.fastapi_endpoint. Facts checked on 6 Oct 2026: modal 1.6.1 (3 Oct 2026);
pay-per-use with free monthly credits.
Run from the repo root:  python scripts/seed-post-modal.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/modal"
SUPABASE_POST = "/blog/supabase-explained"
LLM_ROUTER_POST = "/blog/llm-routers-model-routing"
DOCS = "https://modal.com/docs/guide"
WEB_ENDPOINTS = "https://modal.com/docs/guide/webhooks"
PRICING = "https://modal.com/pricing"
MODEL = "https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english"
# Uma's own recording (YouTube title "Video Project 11", 11:00) and demo repo.
VIDEO = "PqPG6SBkIo8"
VIDEO_URL = f"https://youtu.be/{VIDEO}"
GITHUB = "https://github.com/michaelkillgta/Modal-Sentiment-demo"
ILLUSTRATION = "An illustration of the idea."


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, size, caption=ILLUSTRATION):
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


BIG_IDEA = ("==Modal is where the code runs.== ==The model does the job.== ==Your frontend is where people use "
            "it.== Keep those three apart and Modal stops being mysterious.")

COVER_ALT = (
    "What is Modal: cloud compute explained. Your Python code is the recipe and Modal is the kitchen: it provides "
    "the cloud machines to run your code, so you don't set up or manage servers yourself."
)

BODY = [
    *p("You build an AI feature. Maybe a chatbot, maybe something that reads images, maybe a machine learning model.",
       "Then the annoying question: ==\"Where does all this code actually run?\"== Your laptop isn't a production "
       "server. Renting and managing servers gets complicated fast: compute, deployment, scaling, environments.",
       "That's where Modal comes in.",
       f"▶ [Watch my 11-minute Modal walkthrough](#video-{VIDEO})"),
    cta("Get the Modal sentiment demo on GitHub", GITHUB),
    box("The one idea to remember", BIG_IDEA),

    h("So what is Modal?", "part-1"),
    img("what-is-modal", COVER_ALT, (1536, 1024)),
    *p("Modal is a cloud platform that lets you ==run Python code and AI workloads in the cloud== without managing "
       "the servers underneath.",
       "Think of it like this: ==your code is the recipe, Modal is the kitchen==. You write the Python; Modal "
       "provides the machines to run it. No setting up a traditional server just to run your AI code."),
    takeaway("You bring the code. Modal brings the cloud."),

    h("Modal isn't the AI model", "part-2"),
    img("sentiment",
        "Sentiment analysis with a pretrained model: text goes in, and the model labels it positive or negative "
        "with a confidence score.", (1536, 1024)),
    *p("This part matters. Modal ==doesn't do sentiment analysis by itself==. You ==run a sentiment model on Modal==.",
       f"In our demo, that's a pretrained model from Hugging Face, [distilbert-base-uncased-finetuned-sst-2-english]"
       f"({MODEL}). It's already trained to label text as positive or negative. So there are three separate pieces:"),
    {"type": "cards", "items": [
        {"title": "Frontend", "text": "Where the user types and sees the result."},
        {"title": "Modal", "text": "Where our Python code runs."},
        {"title": "Sentiment model", "text": "What actually does the analysis."},
    ]},
    takeaway("Modal is the place. The model is the worker."),

    h("Let's build something real", "part-3"),
    img("workflow",
        "The Modal sentiment workflow: a user types a message in a chat window, the app sends it to Modal in the "
        "cloud, Modal runs the sentiment model, and the result goes back to the chat window.", (1774, 887)),
    *p("No boring \"Hello World\" this time. Picture a tiny app with a chat window. You type ==\"I absolutely love "
       "this product!\"==",
       "Your app sends that text to Modal, Modal runs the sentiment model, and back comes ==POSITIVE, with a "
       "confidence score==, right in your chat window."),
    flow("User", "Chat window", "Modal cloud", "Sentiment model", "Result"),
    *p("The best part: the model ==doesn't need to sit on your laptop==. It runs in Modal's cloud."),
    takeaway("Type a sentence, get a feeling back, all running in the cloud."),

    h("Where does the model come from?", "part-4"),
    *p("From ==Hugging Face==, which hosts thousands of pretrained models anyone can use. We pick a sentiment model "
       "and tell our Python code to use it.",
       "We don't download it to our computer and then upload it to a server. When our code runs on Modal, the model "
       "is loaded right there."),
    pair(("Hugging Face", "Provides the model."), ("Modal", "Provides the place to run it.")),
    *p("And your app uses the result."),
    takeaway("Hugging Face has the model. Modal runs it. Your app shows it."),

    h("What about the backend?", "part-5"),
    *p("A common question: \"If I don't have a backend server, how is this running?\" Normally you'd build:"),
    flow("Frontend", "Node.js or FastAPI backend", "Model"),
    *p("With Modal, ==your Python function becomes the cloud side== that your frontend talks to directly:"),
    flow("Frontend", "Modal", "Sentiment model"),
    *p("Modal handles the infrastructure to run that Python code, which is a big reason it's interesting for AI apps. "
       f"(If you need a database too, our [Supabase post]({SUPABASE_POST}) covers that side.)"),
    takeaway("Your Python function is the backend."),

    h("The three commands", "part-6"),
    img("three-commands",
        "Three commands to run sentiment analysis on Modal: pip install modal to get the tools, modal setup to connect "
        "your computer to your Modal account, and modal deploy modal_app.py to run your app in Modal's cloud.",
        (1536, 1024)),
    *p("Three commands make the basic workflow click:"),
    code("pip install modal            # 1. give your computer the Modal tools\n"
         "modal setup                  # 2. connect this computer to your Modal account\n"
         "modal deploy modal_app.py    # 3. run your Python app in Modal's cloud", "bash"),
    flow("Install", "Connect", "Deploy"),
    *p("Here's the heart of our modal_app.py, shortened. The full file in the repo adds input checks and cost "
       "limits:"),
    code('import modal\n\n'
         'image = modal.Image.debian_slim().pip_install("torch", "transformers", "fastapi[standard]")\n'
         'app = modal.App("modal-sentiment-demo")\n\n'
         '@app.cls(image=image, cpu=1.0, timeout=60)\n'
         'class SentimentModel:\n'
         '    @modal.enter()\n'
         '    def load_model(self):  # runs once per container, not on every request\n'
         '        from transformers import pipeline\n'
         '        self.classifier = pipeline(\n'
         '            "sentiment-analysis",\n'
         '            model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",\n'
         '        )\n\n'
         '    @modal.fastapi_endpoint(method="POST")\n'
         '    def predict(self, payload: dict):  # your frontend calls this URL\n'
         '        result = self.classifier(payload["text"])[0]\n'
         '        return {"label": result["label"], "confidence": round(result["score"], 4)}', "python"),
    *p("It runs on ==CPU only== and scales down to zero when nobody's using it, so a demo like this stays cheap."),
    takeaway("Install, connect, deploy. That's the whole loop."),

    h("What happens after you deploy", "part-7"),
    *p("Your frontend has a chat box. You type ==\"The product was amazing!\"== Behind the scenes:"),
    flow("User", "Chat window", "Modal", "Sentiment model", "POSITIVE", "Chat window"),
    *p("The user doesn't need to know any of that. They just see the result."),
    takeaway("All the cloud work is invisible to the user."),

    h("Why this is useful", "part-8"),
    *p("Tomorrow you might want to do something heavier:"),
    ul("run a bigger machine learning model", "process thousands of files", "generate embeddings",
       "run AI inference at scale", "use GPUs for a heavy model", "run Python jobs in the cloud"),
    *p("You probably don't want to become a ==server administrator== to do that. You want to focus on ==what your AI "
       "app should do==. Modal handles much of the infrastructure side. It's pay-per-use, with free monthly credits "
       "to start.",
       f"Running several models? Our [LLM router post]({LLM_ROUTER_POST}) shows how to pick the right one per "
       "request."),
    takeaway("Spend your time on the AI, not the servers."),

    h("Modal in one sentence", "part-9"),
    *p("Modal is a cloud platform that lets you ==run Python and AI workloads without managing the servers "
       "underneath==."),
    box("Remember", BIG_IDEA),

    h("Try it yourself", "part-10"),
    *p("Clone the demo, run the three commands, and type a sentence into the chat box."),
    cta("Get the Modal sentiment demo on GitHub", GITHUB),
    *p(f"**Watch it run.** I recorded the whole thing, setup to result. You can also [watch it on YouTube]"
       f"({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "Modal sentiment demo (Uma's walkthrough video)",
     "caption": "Modal sentiment demo · 11:00"},

    h("Resources"),
    ul(f"[My Modal sentiment demo on GitHub]({GITHUB}): the backend and chat frontend from this post.",
       f"[My walkthrough video]({VIDEO_URL}): setup to result, step by step.",
       f"[Modal guide]({DOCS}): the official docs, from first function to deployment.",
       f"[Web endpoints]({WEB_ENDPOINTS}): how a Modal function becomes a URL your frontend can call.",
       f"[Modal pricing]({PRICING}): pay per use, and the free monthly credits.",
       f"[The sentiment model on Hugging Face]({MODEL}): the DistilBERT model our demo uses.",
       "[Modal in our Toolkit](/toolkit/modal): our quick verdict."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [{"label": "Modal", "href": "/toolkit/modal"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "modal-run-ai-in-the-cloud",
    "category": "ideas",
    "title": "Modal: Run Your AI Code in the Cloud Without Managing Servers",
    "excerpt": "Your laptop isn't a server. Modal runs your Python and AI code in the cloud, no server admin needed. "
               "We deploy a real sentiment model behind a chat window in three commands.",
    "cover": {"text": "Modal", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/what-is-modal.webp", "width": 1536, "height": 1024, "alt": COVER_ALT}},
    # Was featured until the AI SDK post (6 Oct 2026).
    "featured": None,
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-06",
    "learn": [
        "What Modal is, and why it isn't the AI model",
        "How a frontend, Modal and a Hugging Face model fit together",
        "The three commands: install, connect, deploy",
        "How a Python function becomes your backend",
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
