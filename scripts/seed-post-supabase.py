"""Adds (or updates) Uma's post "Supabase Explained: Your Backend Without Building Everything From Scratch" in
api/seed/posts.json, with her 3 visuals in web/public/blog/supabase/ (converted to WebP by hand on 4 Oct 2026).

Text: Uma's draft rewritten in plain prose, same order. Facts checked on 4 Oct 2026 against Supabase's docs: the
Next.js quickstart now uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (older projects call it the anon key); pgvector
is a Postgres extension. The playground repo is Uma's own (github.com/michaelkillgta/Supabase-playground).
Run from the repo root:  python scripts/seed-post-supabase.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/supabase"
SIZE = (1536, 1024)
RAG_POSTS = {"Docling": "/blog/docling-pdf-is-not-just-text", "ColBERT": "/blog/colbert-when-semantic-search-isnt-enough",
             "Phoenix": "/blog/arize-phoenix-ai-observability"}
DOCS = "https://supabase.com/docs"
PGVECTOR = "https://supabase.com/docs/guides/database/extensions/pgvector"
REALTIME = "https://supabase.com/docs/guides/realtime"
STORAGE = "https://supabase.com/docs/guides/storage"
CLI = "https://supabase.com/docs/guides/local-development/cli/getting-started"
KEYS = "https://supabase.com/docs/guides/api/api-keys"
# Uma's own recording (YouTube title "Supabase", 11:48) and playground repo.
VIDEO = "enFp4N34QJ4"
VIDEO_URL = f"https://youtu.be/{VIDEO}"
GITHUB = "https://github.com/michaelkillgta/Supabase-playground"
ILLUSTRATION = "An illustration of the idea."


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


BIG_IDEA = ("==You build the app.== ==Supabase handles much of the backend== behind it: database, files, logins, live "
            "updates and AI search.")

COVER_ALT = (
    "Supabase as a backend platform: your app talks to Supabase, which provides a PostgreSQL database, file "
    "storage, authentication, realtime updates, APIs and pgvector for AI search."
)

PLAYGROUND = {"type": "tabs", "label": "Try each part", "items": [
    tab("Database",
        *p("Say you have a simple student app. You type Name: Uma, Role: Student, Score: 85, and click ==Add "
           "Student==.",
           "Your app sends that to Supabase, Supabase saves it in PostgreSQL, and the result comes back. So when you "
           "see \"Uma | Student | 85\" on screen, it isn't living inside the frontend. ==It came from the backend==."),
        flow("Your app", "Supabase", "PostgreSQL", "Data stored", "Response", "Your app")),
    tab("Storage",
        *p("Now students can upload notes. You pick ==physics-notes.pdf==, and your app sends the file to Supabase "
           "Storage, which keeps the actual file.",
           "Your database can store details about the file (its name, who uploaded it), while Storage holds the file "
           "itself. Simple."),
        flow("Your app", "Upload PDF", "Supabase Storage", "physics-notes.pdf")),
    tab("Realtime",
        *p("Open the playground in ==two browser tabs== looking at the same counter. Click +1 in Tab A.",
           "The database changes, Supabase Realtime notices, and Tab B updates on its own. No refresh. That's the "
           "basic idea behind chat apps, notifications and live dashboards."),
        flow("Tab A clicks +1", "Database changes", "Supabase Realtime", "Tab B updates")),
    tab("pgvector",
        *p("Your company has documents: work from home policy, leave policy, security policy, salary policy. Someone "
           "asks: ==\"Can I work remotely?\"==",
           "The document says \"Employees can work from home with manager approval.\" Different words, same meaning. "
           "pgvector lets you search by meaning, so the question still finds the right policy."),
        flow("Question", "Embedding", "pgvector search", "\"Employees can work from home...\"")),
]}

BODY = [
    *p("You built the frontend. The UI looks good, the buttons work, the page feels alive.",
       "Then the question every developer hits: ==\"Okay... where does all this data actually go?\"== Your users "
       "need accounts. Your app needs a database, somewhere to store files, maybe live updates. If it's an AI app, "
       "maybe even vector search.",
       "You could build all of that yourself. Or you could use ==Supabase==.",
       f"▶ [Watch my 12-minute Supabase walkthrough](#video-{VIDEO})"),
    cta("Clone the Supabase Playground on GitHub", GITHUB),
    box("The one idea to remember", BIG_IDEA),

    h("So what is Supabase?", "part-1"),
    img("backend-platform", COVER_ALT),
    *p("Supabase is a ==backend platform built around PostgreSQL==. It gives your app the backend services it needs, "
       "so you don't build each one from scratch.",
       "Your app can be almost anything that can talk to an API: a web app, a mobile app, a Next.js or React app, a "
       "Flutter app or a Python program. The idea is simple:"),
    flow("Your app", "Supabase", "Your data"),
    *p("Your app sends a request, Supabase handles the backend side, and the result comes back."),
    takeaway("Supabase is the backend your frontend has been looking for."),

    h("What Supabase actually gives you", "part-2"),
    {"type": "cards", "items": [
        {"title": "PostgreSQL database", "text": "Your structured data: students, courses, scores, messages, orders. "
                                                 "If your app needs to remember it, it usually goes here."},
        {"title": "Storage", "text": "Actual files: PDFs, images, videos, user uploads. Not everything belongs in a "
                                     "table."},
        {"title": "Authentication", "text": "Email and password, one-time codes, Google and other sign-in providers, "
                                            "and user sessions."},
        {"title": "Realtime", "text": "Your app listens for database changes and updates instantly. Great for chat, "
                                      "notifications and live dashboards."},
    ]},
    pair(("Database", "Structured information."), ("Storage", "The actual files.")),
    *p("We don't build login in our demo, because authentication could be a whole tutorial on its own. Just remember: "
       "==Supabase can handle the boring login infrastructure== for you.",
       "And realtime means no more app constantly asking \"anything new? anything new? anything new?\". The update "
       "comes to you."),
    takeaway("Data, files, logins, live updates: the backend basics in one place."),

    h("How do you connect your app?", "part-3"),
    img("four-ways",
        "Ways to connect your app to Supabase, such as environment variables with the Supabase client in your app "
        "and the Supabase CLI for managing your project from the terminal.",
        "An illustration. This post covers the two most practical ways: environment variables and the CLI."),
    *p("**1. Environment variables.** The easiest way. When you create a Supabase project, you get a ==project URL== "
       "and a ==publishable key== (older projects call it the anon key). Put them in your app's environment file. In "
       "a Next.js app:"),
    code("NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n"
         "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key"),
    *p("Then the Supabase client in your app uses them to talk to your project."),
    flow("Your app", "Supabase client", "Supabase project"),
    box("Keep secrets secret", "The publishable key is meant for the browser. Your ==secret or service-role key== and "
                               "any third-party API keys are not. Never put them in frontend code."),
    *p("**2. The Supabase CLI.** For when you're working on a project seriously and want your database changes to "
       "live alongside your code. From your terminal you can link your project, pull the database schema, create and "
       "push migrations, and run a local Supabase for development."),
    flow("Your code", "Supabase CLI", "Supabase project"),
    pair(("Environment variables", "Connect your app."), ("Supabase CLI", "Manage your development workflow.")),
    takeaway("You don't need the CLI to understand Supabase. You'll want it once the project gets serious."),

    h("See it working: the playground", "part-4"),
    *p("We built a small ==Supabase Playground== so you don't have to imagine what happens behind the scenes. The "
       "goal isn't a giant production app. It's: ==click something, see what happens, understand the backend==. "
       "Pick a part:"),
    PLAYGROUND,
    takeaway("Click, watch the data move, and the backend stops being a black box."),

    h("pgvector, without the scary maths", "part-5"),
    img("pgvector",
        "pgvector, search by meaning in PostgreSQL: documents become embeddings stored in PostgreSQL with the pgvector "
        "extension, so a question like \"Can I work remotely?\" finds \"Employees can work from home with manager "
        "approval\" even though the words differ."),
    *p("The name sounds scary. You don't need vector maths to get why it's useful.",
       "Text can be turned into ==embeddings==: lists of numbers that capture meaning. Supabase can store them in "
       "PostgreSQL with the pgvector extension, and then search for content with ==similar meaning==, not just "
       "matching words:"),
    flow("Documents", "Embeddings", "PostgreSQL + pgvector", "Meaning-based search", "Relevant content"),
    *p("That's why pgvector is so useful for AI apps and RAG systems.",
       f"Want the RAG side in more depth? See our posts on [Docling]({RAG_POSTS['Docling']}) and [ColBERT]"
       f"({RAG_POSTS['ColBERT']})."),
    box("Good to know", "pgvector is ==not a separate database==. It's a PostgreSQL extension that lets PostgreSQL "
                        "store and search vector embeddings."),
    takeaway("pgvector finds what you meant, not just what you typed."),

    h("What about APIs?", "part-6"),
    *p("Your app needs a way to talk to Supabase. That's what its ==APIs== are for. Your app asks \"give me the "
       "students\", Supabase asks PostgreSQL, and the data comes back:"),
    flow("Get students", "Supabase", "PostgreSQL", "Student data", "Your app"),
    *p("You don't have to hand-build a separate backend endpoint for every basic database operation. That's a big "
       "part of why Supabase is so convenient."),
    takeaway("Supabase gives your database an API out of the box."),

    h("The whole thing in one example", "part-7"),
    *p("Imagine an education app. A student opens it, uploads their notes, asks a question and gets an answer. "
       "Behind the scenes:"),
    ul("**Student data** goes to PostgreSQL.",
       "**PDF notes** go to Storage.",
       "**Live updates** come through Realtime.",
       "**AI document search** uses pgvector."),
    *p("Your app talks to all of it through the Supabase client and your project settings. ==You didn't build every "
       "backend piece yourself.== That's the point."),
    takeaway("One app, four Supabase features, zero backend built from scratch."),

    h("Try it yourself", "part-8"),
    *p("The best way to use this post: ==read, watch, clone, experiment==. Don't just look at the code. Change "
       "something. Break something. Add a row, upload a file, open two tabs, run a search. That's when Supabase "
       "starts making sense."),
    cta("Clone the Supabase Playground on GitHub", GITHUB),
    *p(f"**Watch it run.** I recorded the setup and walked through what's happening behind the scenes. You can also "
       f"[watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "Supabase (Uma's walkthrough video)",
     "caption": "Supabase walkthrough · 11:48"},

    h("Final takeaway", "part-9"),
    *p("Supabase isn't a magic box that replaces your whole app. It's the ==backend infrastructure== behind it. You "
       "build the frontend and the app logic; Supabase gives you the building blocks:"),
    {"type": "cards", "items": [
        {"title": "PostgreSQL", "text": "Store data"},
        {"title": "Storage", "text": "Store files"},
        {"title": "Authentication", "text": "Manage users"},
        {"title": "Realtime", "text": "Push live changes"},
        {"title": "APIs", "text": "Talk to your backend"},
        {"title": "pgvector", "text": "Search by meaning"},
    ]},
    box("Remember", BIG_IDEA),
    *p("Now go clone the playground and make something break. That's usually when the backend stops looking like a "
       "mysterious black box.",
       f"**Also read:** [Phoenix: The CCTV for Your AI Application]({RAG_POSTS['Phoenix']}), for seeing what your AI "
       "app does with the data you store here, and [Modal](/blog/modal-run-ai-in-the-cloud), for running the AI code "
       "itself."),

    h("Resources"),
    ul(f"[My Supabase Playground on GitHub]({GITHUB}): the project from this post, ready to clone.",
       f"[My walkthrough video]({VIDEO_URL}): the setup and what happens behind the scenes.",
       f"[Supabase docs]({DOCS}): everything, from your first project onwards.",
       f"[API keys]({KEYS}): which key goes where, and which ones to keep secret.",
       f"[Storage]({STORAGE}), [Realtime]({REALTIME}) and [pgvector]({PGVECTOR}): the guides for each part of the "
       "playground.",
       f"[Supabase CLI]({CLI}): running Supabase locally and managing migrations.",
       "[Supabase in our Toolkit](/toolkit/supabase): our quick verdict."),
]

# Tools used: shown as Toolkit pills just before the first part.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [{"label": "Supabase", "href": "/toolkit/supabase"}]}
BODY.insert(next(i for i, b in enumerate(BODY) if b["type"] == "heading"), TOOLS_USED)

POST = {
    "slug": "supabase-explained",
    "category": "ideas",
    "title": "Supabase Explained: Your Backend Without Building Everything From Scratch",
    "excerpt": "You built the frontend. Now where does the data go? Supabase gives you a database, file storage, "
               "logins, live updates and AI search, with a playground you can clone and break.",
    "cover": {"text": "Supabase", "bg": "#211913", "fg": "#F2A93B",
              "image": {"src": f"{IMG}/backend-platform.webp", "width": SIZE[0], "height": SIZE[1], "alt": COVER_ALT}},
    # Was featured until the Modal post (6 Oct 2026).
    "featured": None,
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-04",
    "learn": [
        "What Supabase is, and what it gives your app",
        "Database vs Storage vs Realtime, with clickable examples",
        "How to connect your app safely, and when to use the CLI",
        "What pgvector does for AI search, without the maths",
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
