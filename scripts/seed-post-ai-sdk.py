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
    *p("You can send a prompt to an AI model and get an answer in a few lines of code. So, fair question: ==why "
       "would you need something like the Vercel AI SDK?==",
       "Because building an AI app isn't just sending a prompt. ==The prompt is easy. The app around it is the hard "
       "part==."),
    box("The one idea to remember", BIG_IDEA),

    h("A simple AI tutor gets complicated fast", "part-1"),
    *p("Picture a simple AI tutor. At first it's just:"),
    flow("Student", "Prompt", "AI model", "Answer"),
    *p("Then your app needs more. You want the answer to appear ==while it's being written==. You want the AI to "
       "==remember the conversation==. You want it to ==check a database== and use other tools. You want ==structured "
       "data==, not a wall of text. You might want to ==switch AI providers== later.",
       "Now your simple prompt has become a real software engineering problem. That's where an AI SDK helps."),
    takeaway("Every \"small\" feature adds plumbing around the prompt."),

    h("So what is the Vercel AI SDK?", "part-2"),
    img("experiment-vs-app", COVER_ALT),
    *p(f"The [Vercel AI SDK]({INTRO}) is a free, open-source ==TypeScript toolkit== that connects AI models to real "
       "apps, so you don't build all the AI plumbing yourself. Think of it as a ==bridge==:"),
    flow("Your app", "Vercel AI SDK", "AI provider", "AI model"),
    *p("Every provider has its own API, request format, way of streaming, way of calling tools and way of sending "
       "back answers. The SDK gives your app ==one common way== to do all of that. That's the real value."),
    takeaway("One toolkit instead of one integration per provider."),

    h("You don't want to learn every provider's API", "part-3"),
    img("multiple-providers",
        "One application, multiple AI providers: instead of wiring your app separately to each provider's own SDK, "
        "the app talks to the Vercel AI SDK, which connects to provider A, provider B or provider C."),
    *p("Say you use one provider today and want to try another tomorrow. Without a common layer, you learn a new "
       "library and rewrite your code each time. With the SDK, your app talks to one interface and the provider "
       "sits behind it:"),
    flow("Your app", "Vercel AI SDK", "Provider A, B or C"),
    *p("So you spend less time rewriting integration code and more time on the actual product.",
       "One honest note: this doesn't make every provider identical. You still add each provider's package, and "
       "some features only exist on some providers. The SDK just ==handles most of the repetitive work==."),
    takeaway("Swap providers without rewriting your app."),

    h("Streaming makes the AI feel alive", "part-4"),
    *p("Without streaming, a long answer feels like this: you ask, then you ==wait... wait... wait...==, then the "
       "whole thing appears at once.",
       "With streaming, the answer ==appears word by word== as it's written, like every modern AI chat app: \"The\", "
       "\"The answer\", \"The answer is...\". The SDK makes that easy:"),
    code("import { streamText } from 'ai';\n\n"
         "const result = streamText({\n"
         "  model: 'provider/model-name',   // pick any supported provider and model\n"
         "  prompt: 'Explain photosynthesis to a Class 9 student.',\n"
         "});\n\n"
         "for await (const text of result.textStream) {\n"
         "  process.stdout.write(text);    // each piece arrives as it's generated\n"
         "}", "typescript"),
    takeaway("Streaming turns a waiting screen into a live answer."),

    h("The AI can do things, not just talk", "part-5"),
    *p("A student asks: ==\"What was my physics score in the last test?\"== The model doesn't magically know your "
       "database. So your app gives it a ==tool==:"),
    flow("Student", "AI", "Tool: get physics score", "Database", "Score: 82", "AI: \"Your physics score was 82.\""),
    *p("Now the AI is connected to something outside itself. The same idea works with search, weather APIs, "
       "calculators, internal company systems and other APIs. This is called ==tool calling==, and the SDK makes "
       "it much easier to set up.",
       f"Want agents that use tools in loops? See our [LangGraph post]({LANGGRAPH_POST})."),
    takeaway("Tools let the AI reach your real data."),

    h("Sometimes you don't want plain text", "part-6"),
    *p("Say your app analyses a student's performance. You don't want a paragraph like \"Your performance is good and "
       "you should focus more on mechanics...\" You want ==data your app can use==:"),
    code('{\n'
         '  "score": 82,\n'
         '  "weak_topic": "Mechanics",\n'
         '  "difficulty": "Medium",\n'
         '  "recommendation": "Practice 20 questions"\n'
         '}', "text"),
    flow("AI", "Structured output", "Your app", "Dashboard"),
    *p("Now the AI isn't just writing text. It's producing ==structured data== your software can work with, and the "
       "SDK can check it matches the shape you asked for."),
    takeaway("Structured output turns answers into data."),

    h("Prompting vs building an AI app", "part-7"),
    pair(("Prompting", "Prompt, model, answer. Done."),
         ("AI app development", "User, UI, AI SDK and model, plus streaming, tool calls, structured output, "
                                "conversation and provider integration, all connected to your databases and APIs.")),
    *p("The second one is where ==software engineering== comes in."),
    takeaway("Prompting is a moment. An app is a system."),

    h("Do you actually need it?", "part-8"),
    *p("==No.== You can build an AI app without it, straight on a provider's own SDK or HTTP API. That works.",
       "But as the app grows, you'll write a lot of the same integration code again and again. The SDK gives you "
       "reusable building blocks so you don't solve the same problems from scratch."),
    pair(("Don't think", "\"The Vercel AI SDK is required to use AI.\""),
         ("Think", "\"It's a developer tool that makes AI easier to build into apps.\"")),
    *p("And it ==isn't an AI model==. It doesn't think for you. The model provides the intelligence; the SDK is the "
       "==integration layer== that helps your app talk to it."),
    flow("Your app", "AI SDK", "Provider", "Model", "Intelligence"),
    takeaway("Useful, not required. A tool, not a brain."),

    h("The bigger picture", "part-9"),
    *p("AI development is moving beyond \"write a clever prompt\". Real AI apps need a whole system around the "
       "model:"),
    {"type": "cards", "items": [
        {"title": "Frontend", "text": "Where the user interacts"},
        {"title": "AI SDK", "text": "Handles the AI interaction"},
        {"title": "Model provider", "text": "Gives access to the model"},
        {"title": "Tools", "text": "Let the AI take actions"},
        {"title": "Database", "text": "Stores your app's data"},
        {"title": "APIs", "text": "Connect outside services"},
    ]},
    *p("The model is just one piece. The real engineering is ==connecting them all==.",
       f"Related: [LLM routers]({LLM_ROUTER_POST}) for choosing a model per request, and [Modal]({MODAL_POST}) for "
       "running your own models in the cloud."),
    takeaway("The model is one component. The app is the whole machine."),

    h("The simplest way to remember it", "part-10"),
    *p("If you're asking ==\"Can an AI answer this prompt?\"==, you probably don't need an AI SDK.",
       "If you're asking ==\"How do I turn this AI into a real feature in my app?\"==, that's where it starts paying "
       "off. That's the difference between ==experimenting with AI and engineering an AI product==."),
    box("Remember", BIG_IDEA),

    h("References"),
    ul(f"[AI SDK introduction]({INTRO}): what the SDK is and how its parts fit together.",
       f"[Providers and models]({PROVIDERS}): how one interface works across many AI providers.",
       f"[Generating and streaming text]({TEXT}): generateText and streamText, with examples.",
       f"[Tool calling]({TOOLS}): giving the model tools like database lookups and APIs.",
       f"[Structured data]({STRUCTURED}): getting typed JSON back instead of plain text.",
       f"[Building a chatbot]({CHATBOT}): the UI side, with streaming chat in React.",
       f"[Vercel AI SDK on GitHub]({REPO}): source code, examples and releases.",
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
        "What the Vercel AI SDK does: providers, streaming, tools, structured output",
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
