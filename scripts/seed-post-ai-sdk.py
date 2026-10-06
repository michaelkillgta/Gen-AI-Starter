"""Adds (or updates) Uma's post "Vercel AI SDK: Why Your AI App Needs More Than a Prompt" in api/seed/posts.json,
with her 2 visuals in web/public/blog/ai-sdk/ (converted to WebP by hand on 6 Oct 2026).

Text: Uma's draft rewritten in plain prose, same order. Facts checked on 6 Oct 2026: npm package "ai" 7.0.128
(5 Oct 2026), Apache 2.0, TypeScript; streamText / generateText are the core text functions; models are named
"provider/model". No colab, video or repo for this post.
Run from the repo root:  python scripts/seed-post-ai-sdk.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/ai-sdk"
SIZE = (1672, 941)
LANGGRAPH_POST = "/blog/langgraph-ai-agents-workflow"
LLM_ROUTER_POST = "/blog/llm-routers-model-routing"
MODAL_POST = "/blog/modal-run-ai-in-the-cloud"
INTRO = "https://ai-sdk.dev/docs/introduction"
PROVIDERS = "https://ai-sdk.dev/docs/foundations/providers-and-models"
TEXT = "https://ai-sdk.dev/docs/ai-sdk-core/generating-text"
TOOLS = "https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling"
STRUCTURED = "https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data"
CHATBOT = "https://ai-sdk.dev/docs/ai-sdk-ui/chatbot"
REPO = "https://github.com/vercel/ai"


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, caption="An illustration of the idea."):
    return {"type": "image", "src": f"{IMG}/{name}.webp", "alt": alt, "width": SIZE[0], "height": SIZE[1],
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


BIG_IDEA = ("==A prompt gets you an AI response.== ==An AI SDK helps you build the app around it==: streaming, tools, "
            "structured data and switching providers.")

COVER_ALT = (
    "An AI experiment versus a real AI application. The experiment is just a prompt, a model and an answer. The "
    "real application adds a user interface, streaming, conversation memory, tool calls to databases and APIs, "
    "structured output and provider integration around the model."
)

BODY = [
    *p("Sending a prompt to an AI model takes a few lines of code. So why use the Vercel AI SDK? Because ==the prompt "
       "is easy; the app around it is the hard part==."),
    box("The one idea to remember", BIG_IDEA),

    h("A simple AI tutor gets complicated fast", "part-1"),
    flow("Student", "Prompt", "AI model", "Answer"),
    *p("Then you want answers to ==stream in==, the AI to ==remember the chat==, ==check a database==, return "
       "==structured data== and maybe ==switch providers==. Now it's a software engineering problem."),

    h("What the SDK is", "part-2"),
    img("experiment-vs-app", COVER_ALT),
    *p(f"The [Vercel AI SDK]({INTRO}) is a free, open-source ==TypeScript toolkit== that sits between your app and "
       "AI providers. Instead of handling every provider's own API, streaming and tool format, your app uses ==one "
       "common interface==."),
    flow("Your app", "Vercel AI SDK", "AI provider", "AI model"),

    h("What it gives you", "part-3"),
    img("multiple-providers",
        "One application, multiple AI providers: the app talks to the Vercel AI SDK, which connects to provider A, "
        "provider B or provider C."),
    {"type": "cards", "items": [
        {"title": "Switch providers", "text": "Same code for provider A, B or C. You still add each provider's "
                                              "package, and some features differ."},
        {"title": "Streaming", "text": "The answer appears word by word instead of after a long wait."},
        {"title": "Tool calling", "text": "The AI can look things up: \"What was my physics score?\" calls your "
                                          "database and answers \"82\"."},
        {"title": "Structured output", "text": "JSON your app can use, like a score and a weak topic, instead of a "
                                               "paragraph."},
    ]},
    *p("Streaming, for example, is a few lines:"),
    code("import { streamText } from 'ai';\n\n"
         "const result = streamText({\n"
         "  model: 'provider/model-name',\n"
         "  prompt: 'Explain photosynthesis to a Class 9 student.',\n"
         "});\n\n"
         "for await (const text of result.textStream) process.stdout.write(text);", "typescript"),

    h("Do you actually need it?", "part-4"),
    *p("==No.== You can call a provider's SDK or API directly. The AI SDK just saves you rewriting the same "
       "integration code as your app grows. And it ==isn't an AI model==: the model thinks, the SDK connects."),
    pair(("Just asking a prompt?", "You probably don't need it."),
         ("Building a real AI feature?", "That's where it pays off.")),
    box("Remember", BIG_IDEA),
    *p(f"**Also read:** [LangGraph]({LANGGRAPH_POST}) for agents that use tools, [LLM routers]({LLM_ROUTER_POST}) for "
       f"picking a model per request, and [Modal]({MODAL_POST}) for running your own models."),

    h("References"),
    ul(f"[AI SDK introduction]({INTRO}): what the SDK is and how its parts fit.",
       f"[Providers and models]({PROVIDERS}): one interface across many providers.",
       f"[Generating and streaming text]({TEXT}): generateText and streamText.",
       f"[Tool calling]({TOOLS}): giving the model tools like database lookups.",
       f"[Structured data]({STRUCTURED}): typed JSON instead of plain text.",
       f"[Building a chatbot]({CHATBOT}): streaming chat UI in React.",
       f"[Vercel AI SDK on GitHub]({REPO}): source code and examples.",
       "[Vercel AI SDK in our Toolkit](/toolkit/aisdk): our quick verdict."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [{"label": "Vercel AI SDK", "href": "/toolkit/aisdk"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "vercel-ai-sdk-more-than-a-prompt",
    "category": "ideas",
    "title": "Vercel AI SDK: Why Your AI App Needs More Than a Prompt",
    "excerpt": "A prompt is easy. The app around it is the hard part: streaming, tools, structured data and switching "
               "providers. Here's what the Vercel AI SDK does, and when you actually need it.",
    "cover": {"text": "Vercel AI SDK", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/experiment-vs-app.webp", "width": SIZE[0], "height": SIZE[1], "alt": COVER_ALT}},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "AI SDK", "caption": "why your AI app needs more than a prompt"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-06",
    "learn": [
        "Why a prompt is only a small part of an AI app",
        "What the Vercel AI SDK gives you: providers, streaming, tools, structured output",
        "When you need it, and when you don't",
        "Why an SDK is an integration layer, not an AI model",
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
