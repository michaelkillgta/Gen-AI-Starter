"""Adds (or updates) Uma's post "AI Can Write the Code. So What Happens to Software Development?"
in api/seed/posts.json, and puts her 7 visuals in web/public/blog/ai-native-sdlc/ (full size, WebP).

Text: rewritten on 28 Sept 2026 (Uma found the first version stilted): plain paragraphs, one running
example (a habit tracker for students), "From the playbook" and "Takeaway" boxes per stage, checked
against Anthropic's playbook. Her 7 visuals stay in the same spots.
Run from the repo root:  python scripts/seed-post-ai-native-sdlc.py
"""
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/ai-native-sdlc"
PLAYBOOK = "https://claude.com/blog/the-ai-native-sdlc-playbook"

# Uma's attachments -> published names (only needed when (re)making the images).
UPLOADS = os.path.expanduser(r"~/.claude/uploads/83318ce1-1683-4252-921c-a17a2e19d071")
SOURCES = {
    "overview": "b6a90173-ChatGPT_Image_Sep_29_2026_01_13_11_AM.png",
    "before-with-ai": "c459c0f7-visual_2.png",
    "plan": "d757bd7e-visual_1.png",
    "design": "127c0206-visual_4.png",
    "build": "0631d41f-visual_5.png",
    "test": "0d593cf5-visual_6.png",
    "maintain": "1cb76cfa-ChatGPT_Image_Sep_29_2026_01_27_06_AM.png",
}
SIZES = {
    "overview": (1536, 1024), "before-with-ai": (1536, 1024), "plan": (1536, 1024), "design": (1536, 1024),
    "build": (1774, 887), "test": (1774, 887), "maintain": (1536, 1024),
}


def make_images():
    from PIL import Image

    out = os.path.join(ROOT, "web", "public", "blog", "ai-native-sdlc")
    os.makedirs(out, exist_ok=True)
    for name, src in SOURCES.items():
        im = Image.open(os.path.join(UPLOADS, src)).convert("RGB")
        assert im.size == SIZES[name], (name, im.size)
        im.save(os.path.join(out, f"{name}.webp"), "WEBP", quality=90, method=6)


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, caption=None):
    w, hgt = SIZES[name]
    return {"type": "image", "src": f"{IMG}/{name}.webp", "alt": alt, "width": w, "height": hgt, "caption": caption}


def ul(*items):
    return {"type": "list", "ordered": False, "items": list(items)}


def flow(*items, repeat=None):
    return {"type": "flow", "items": list(items), "repeat": repeat}


def pull(text):
    return {"type": "pull", "text": text}


def pair(*items):
    return {"type": "pair", "items": [{"label": a, "text": b} for a, b in items]}


def box(label, text):
    return {"type": "callout", "label": label, "text": text}


def playbook(text):
    return box("From the playbook", text)


def takeaway(text):
    return box("Takeaway", text)


OVERVIEW_ALT = (
    "The AI-native SDLC on one page: six stages from idea to real app, Plan, Design, Build, Test, Deploy and "
    "Maintain, with real user feedback looping back to planning. AI speeds up the work; humans make the important "
    "decisions."
)

BODY = [
    *p(
        "Ask an AI for a login screen and you'll have one in under a minute. Ask for a database, a set of tests, a "
        "whole feature, and it keeps going.",
        "So typing the code is no longer the hard part. What is?",
        f"That's the question behind a [playbook Anthropic published]({PLAYBOOK}) on the \"AI-native SDLC\". SDLC "
        "just means the software development life cycle: every step a product goes through, from an idea in your "
        "head to an app people use, and back again.",
    ),

    h("What actually changed"),
    img("before-with-ai",
        "Before AI vs With AI. Before: you do everything manually and coding takes about 20 hours of the whole journey. "
        "With AI: AI helps you write code fast, coding takes about 1 hour, and review and maintenance become visible "
        "steps. When coding gets faster, the bottleneck moves."),
    *p("For years, writing the code ate most of a project's time. The hours in the picture are illustrative, but "
       "you'll recognise the shape. In the top row, coding is one long red bar. In the bottom row, AI shrinks it to "
       "almost nothing, and suddenly testing, reviewing and deploying are the longest steps."),
    pull("When code stops being the bottleneck, the bottleneck moves to planning, reviewing and shipping, which still "
         "run at human speed."),
    *p("That's the playbook's main point in one line. The rest of this post walks through each stage and what it "
       "looks like now, using one running example: a habit tracker for students."),

    h("Plan: decide what you're actually building", "stage-1"),
    img("plan",
        "Plan: a messy idea (a habit tracker for students) goes through key questions (who is it for, what should it "
        "do, any limits) and becomes a clear one-page plan with target users, main features and constraints."),
    *p(
        "\"Build me a habit tracker\" is a wish, not a plan. An AI will happily build something from it, just not "
        "necessarily what you had in mind.",
        "Before any code, answer three questions: who is it for, what must it do, and what are the limits? For our "
        "tracker: college students aged 18 to 25; track daily habits, send reminders and show streaks; Android and "
        "iOS, free and simple.",
    ),
    playbook("Anthropic's version of this step ends with a short file called intent.md: the problem, who has it, "
             "what success looks like and what's still open. The AI helps draft it and a person approves it. The aim "
             "is to go from first conversation to an agreed plan in hours, not weeks."),
    takeaway("If you can't explain your app in five lines, the AI can't build it."),

    h("Design: screens, flow and tech in one sitting", "stage-2"),
    img("design",
        "Design: turn your idea into a clear design in three parts: what it looks like (the app screens), how it works "
        "(open app, mark habit, track progress, stay motivated) and how we build it (Flutter, Supabase, OpenAI, "
        "Vercel)."),
    *p(
        "Now decide what it looks like and how it works: the screens (home, add a habit, progress), the path a user "
        "takes through them (open the app, tick a habit, watch the streak grow), and the tools you'll build it with.",
        "The picture shows one set of choices, Flutter with Supabase. Any stack works. What matters is that the "
        "choice is written down.",
    ),
    playbook("Requirements and design used to be separate phases, run by separate teams. In the AI-native version "
             "they happen in one session: the AI turns the plan into a spec, checks it against the team's rules on "
             "security, branding and privacy, and flags anything that needs a human decision."),
    takeaway("AI follows a clear design far better than a vague idea."),

    h("Build: you direct, AI types, you review", "stage-3"),
    img("build",
        "Build: 1, give the plan; 2, AI builds the app (screens, database, tests); 3, review the result. You give "
        "direction, AI does much of the implementation, you review and guide."),
    *p(
        "This is the part everyone pictures. You hand over the plan, and the AI writes the screens, database tables, "
        "login and tests.",
        "What changes is your job. You spend less time typing every line and more time giving direction and "
        "checking what comes back.",
    ),
    flow("You give direction", "AI builds", "You review", repeat="Again"),
    playbook("Even here, planning comes first. The AI proposes which files will change, in what order and with which "
             "tests, and the engineer approves that before any code is written. Team knowledge lives in a file the "
             "AI reads every time, with rules like \"money is always BigDecimal, never double\"."),
    takeaway("The better your plan and your review, the better the code."),

    h("Test: catch problems while they're small", "stage-4"),
    img("test",
        "Don't wait until the end to find problems: AI runs 10 tests, finds 1 problem, fixes it, runs all tests again, "
        "and you quickly review the result and keep building."),
    *p(
        "\"AI wrote it\" doesn't mean \"it works\". In the picture, ten checks pass and one fails: the reminder "
        "doesn't fire. The AI finds the cause, fixes it, runs everything again, and only then does a person look.",
        "It's like building a house. You check the door fits while the frame is going up, not after the walls are "
        "painted.",
    ),
    playbook("The AI gets one command that runs every check, and it keeps going until they all pass. The tests "
             "themselves are locked, so the AI can't \"fix\" a failure by quietly editing the test."),
    takeaway("Test early, fix fast, keep moving."),

    h("Deploy: from your laptop to real users", "stage-5"),
    flow("Your laptop", "Cloud", "Real users"),
    *p(
        "Working on your laptop isn't the same as working for thousands of people. Deploy is the step where your "
        "app leaves your machine.",
        "AI can prepare most of it: open the change, run automated reviews for bugs and security, and fix what they "
        "find. The final yes stays with a person.",
    ),
    playbook("The AI can write a change request but can't approve its own. The rules tighten with risk: free rein "
             "while developing, some limits in testing, and a human sign-off for anything going to production."),
    takeaway("Automate the checks. Keep a human on the release button."),

    h("Maintain: launch is where the loop starts", "stage-6"),
    img("maintain",
        "Maintain: software is a loop, not a one-time project. Real people use your app, users report problems, AI "
        "investigates, a human checks, you fix and improve, release an update, then learn from users and plan again."),
    *p(
        "The app is live. Time to relax? Not quite.",
        "Real users arrive with real problems. One says it crashes. One says it's slow. One asks for dark mode. Each "
        "of these goes round the same loop: AI investigates, a person decides the fix, it's built, tested and "
        "shipped, and what you learned feeds the next plan.",
    ),
    playbook("Monitoring watches the numbers and calls the AI when something drifts. The AI writes up what it found "
             "in the same format as a new idea, so a bug in production re-enters the pipeline at stage 1. A person "
             "still decides what gets fixed."),
    takeaway("Software is a loop, not a one-time project."),

    h("So what actually changed?"),
    img("overview", OVERVIEW_ALT, "The whole journey on one page. Click to enlarge."),
    pair(("The old picture", "A developer writes code, and the app gets built."),
         ("The new picture", "A person sets the goal. AI helps plan, build and test. People review. The app reaches "
                             "users, AI helps watch it, and what users say becomes the next idea.")),

    h("Where your time goes now"),
    *p("The biggest change isn't speed. It's where your attention goes."),
    pair(("Less", "\"How do I write this by hand?\""),
         ("More", "What should we build?\nIs it useful?\nDid the AI build the right thing?\nWhat could go wrong?\n"
                  "What are users telling us?")),
    *p("People don't disappear from this picture. They move up: less typing, more deciding.",
       "**The loop to remember**"),
    flow("💡 Idea", "📝 Plan", "🎨 Design", "🤖 Build", "🧪 Test", "🚀 Deploy", "👥 Users", "🔧 Maintain",
         "💡 New idea"),

    h("Want the full version?"),
    *p(f"This post is my simplified take on Anthropic's [The AI-native SDLC playbook]({PLAYBOOK}), which goes much "
       "deeper into each stage, the files that connect them, and how teams keep people in control."),
    {"type": "cta", "label": "Read the original playbook", "href": PLAYBOOK},
]

POST = {
    "slug": "ai-can-write-the-code",
    "category": "ideas",
    "title": "AI Can Write the Code. So What Happens to Software Development?",
    "excerpt": "AI made coding fast. Now everything around the code is the slow part. Here's the whole journey "
               "from idea to app, one picture at a time.",
    "cover": {
        "text": "6 stages", "bg": "#211913", "fg": "#F2A93B",
        "image": {"src": f"{IMG}/overview.webp", "width": 1536, "height": 1024, "alt": OVERVIEW_ALT},
    },
    # Was featured until the Docling post (29 Sept 2026).
    "featured": None,
    "dive": None,
    "body": BODY,
    "published_on": "2026-09-29",
    "learn": [
        "What the software development lifecycle (SDLC) is, in plain words",
        "Why faster coding makes planning, testing and review matter more",
        "What each of the 6 stages looks like with AI",
        "How a developer's work moves from typing code to directing and reviewing it",
    ],
}


def main():
    if "--images" in sys.argv:
        make_images()
    with io.open(POSTS, encoding="utf-8") as f:
        posts = json.load(f)
    posts = [x for x in posts if x["slug"] != POST["slug"]]
    posts.insert(0, POST)
    with io.open(POSTS, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"posts: {len(posts)}; '{POST['slug']}' has {len(BODY)} blocks")


if __name__ == "__main__":
    main()
