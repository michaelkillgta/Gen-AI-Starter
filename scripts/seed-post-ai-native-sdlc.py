"""Adds (or updates) Uma's post "AI Can Write the Code. So What Happens to Software Development?"
in api/seed/posts.json, and puts her 7 visuals in web/public/blog/ai-native-sdlc/ (full size, WebP).

Text: Uma's post, 29 Sept 2026, lightly edited as she allowed: the chat notes before and after the
post are dropped, the "([Claude](…))" citations became "From Anthropic's playbook" boxes with a
proper link, and the arrow diagrams became step and loop blocks.
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


def lead(*items):
    return {"type": "lead", "items": list(items)}


def pull(text):
    return {"type": "pull", "text": text}


def pair(*items):
    return {"type": "pair", "items": [{"label": a, "text": b} for a, b in items]}


def box(label, text):
    return {"type": "callout", "label": label, "text": text}


def playbook(text):
    return box("From Anthropic's playbook", text)


OVERVIEW_ALT = (
    "The AI-native SDLC on one page: six stages from idea to real app, Plan, Design, Build, Test, Deploy and "
    "Maintain, with real user feedback looping back to planning. AI speeds up the work; humans make the important "
    "decisions."
)

BODY = [
    lead(
        "You can now ask an AI to build a screen.",
        "Then another screen.",
        "Then a database.",
        "Then tests.",
        "Then an entire feature.",
    ),
    *p("So here's the interesting question:"),
    pull("If AI makes coding much faster, what happens to everything around coding?"),
    *p(
        "That's the idea behind the **AI-native SDLC**.",
        "Don't worry, “SDLC” sounds much more complicated than it is.",
    ),
    box("It simply means", "The journey from an idea to a real app."),

    h("First, see the whole journey 👀"),
    *p("The basic journey is:"),
    flow("Idea", "Plan", "Design", "Build", "Test", "Deploy", "Maintain", "Learn", repeat="Repeat"),
    lead("That's software development.", "But AI changes something important.", "Let's see it."),

    h("What AI actually changed"),
    *p("Before AI coding tools became this capable, coding could take a huge chunk of the development process."),
    img("before-with-ai",
        "Before AI vs With AI. Before: you do everything manually and coding takes about 20 hours of the whole journey. "
        "With AI: AI helps you write code fast, coding takes about 1 hour, and review and maintenance become visible "
        "steps. When coding gets faster, the bottleneck moves."),
    *p("Look at the difference."),
    pair(("Before", "Idea → Plan → Design → CODE → Test → Deploy"),
         ("With AI", "Idea → Plan → Design → 🤖 CODE → Test → Review → Deploy → Maintain")),
    *p("The coding part can become dramatically faster.", "And that creates a new problem:"),
    pull("When one step gets much faster, the slow steps around it become more noticeable."),
    playbook(f"[Anthropic's AI-native SDLC playbook]({PLAYBOOK}) makes this the starting point of its argument: AI "
             "has accelerated code production, while planning, review/testing, deployment, and other surrounding "
             "processes can still operate at human speed."),
    *p("So let's follow the whole journey."),

    h("Plan 💡", "stage-1"),
    *p("You have an idea.", "Maybe it's:"),
    pull("“I want to build a habit tracker for students.”"),
    *p("Cool.", "But that's not quite enough for an AI to build from.", "You still have questions:"),
    ul("Who is it for?", "What should it do?", "What are the limits?"),
    img("plan",
        "Plan: a messy idea (a habit tracker for students) goes through key questions (who is it for, what should it "
        "do, any limits) and becomes a clear one-page plan with target users, main features and constraints."),
    *p("The messy idea becomes a clear plan.", "That's the job of Plan.", "You can think of it as:"),
    flow("Messy thought", "Clear goal"),
    playbook(f"[Anthropic]({PLAYBOOK}) describes a similar approach with an intent.md artifact that captures the "
             "original idea, its users, desired outcome, constraints, and open questions so the next stage can work "
             "from something concrete."),
    box("The simple lesson",
        "Don't tell AI “build my app” before you know what the app is supposed to do."),

    h("Design 🎨", "stage-2"),
    *p("Okay.", "We know what we're building.", "Now:"),
    pull("What should it actually look like?"),
    *p("Take our habit tracker.", "Maybe we need:"),
    ul("Home screen", "Add Habit", "Progress", "Reminders"),
    img("design",
        "Design: turn your idea into a clear design in three parts: what it looks like (the app screens), how it works "
        "(open app, mark habit, track progress, stay motivated) and how we build it (Flutter, Supabase, OpenAI, "
        "Vercel)."),
    *p("But design isn't only about colors and buttons.", "It is also about:"),
    ul("How does the user move through the app?", "What happens when they tap something?",
       "What technology do we need?"),
    *p("So the flow becomes:"),
    flow("Idea", "Screens", "User flow", "Technical choices"),
    playbook(f"[Anthropic's playbook]({PLAYBOOK}) describes bringing requirements and design closer together with "
             "AI, rather than treating them as completely separate handoffs."),
    box("The simple lesson", "AI is much easier to direct when you have something clear to show it."),

    h("Build 🤖", "stage-3"),
    *p(
        "Now we finally get to the part everyone thinks about when they hear AI coding.",
        "You give the AI the plan.",
        "It starts building.",
    ),
    img("build",
        "Build: 1, give the plan; 2, AI builds the app (screens, database, tests); 3, review the result. You give "
        "direction, AI does much of the implementation, you review and guide."),
    *p("It can generate things like:"),
    ul("screens", "database structure", "authentication", "tests", "code"),
    *p("And this changes the developer's role."),
    pair(("It becomes less", "“I must type every line.”"),
         ("And more", "“I need to give good direction and check what the AI produces.”")),
    playbook(f"[Anthropic's playbook]({PLAYBOOK}) describes starting implementation from an accepted plan and having "
             "the AI generate code and tests from that plan, with humans reviewing the result."),
    *p("**The new loop**"),
    flow("You give direction", "AI builds", "You review"),
    *p("That's the shift."),

    h("Test 🧪", "stage-4"),
    lead("Now comes the reality check.", "The AI built something.", "Does it actually work?"),
    img("test",
        "Don't wait until the end to find problems: AI runs 10 tests, finds 1 problem, fixes it, runs all tests again, "
        "and you quickly review the result and keep building."),
    flow("10 tests ✅", "1 problem ❌", "AI finds the problem", "AI fixes it", "Tests run again", "Everything passes ✅"),
    *p("This is why “AI wrote the code” does not mean “the job is finished.”"),
    playbook(f"[Anthropic]({PLAYBOOK}) describes moving toward continuous evaluation during implementation instead "
             "of waiting for one giant QA checkpoint at the end."),
    box("Think about it like this",
        "Don't build the entire house and then discover the door doesn't fit. Test early. Fix quickly. Keep moving."),

    h("Deploy 🚀", "stage-5"),
    lead("Okay.", "It works on your laptop.", "Now people need to actually use it."),
    *p("That's Deploy."),
    flow("💻 Your laptop", "☁️ Cloud", "👥 Real users"),
    *p(
        "This stage is where your app leaves your computer and enters the real world.",
        "AI can automate parts of that process too, but important production decisions still need controls and human "
        "judgment.",
    ),
    playbook(f"[Anthropic's playbook]({PLAYBOOK}) describes layered automated checks with human review reserved for "
             "higher-risk decisions."),
    box("The simple idea", "Working on my laptop ≠ working for real users."),

    h("Maintain 🔧", "stage-6"),
    lead("And now the funniest part.", "Your app is live.", "You can finally relax."),
    pull("Nope. 😂"),
    img("maintain",
        "Maintain: software is a loop, not a one-time project. Real people use your app, users report problems, AI "
        "investigates, a human checks, you fix and improve, release an update, then learn from users and plan again."),
    *p("Real people start using it."),
    ul("Someone finds a bug.", "Someone says: “Why is this so slow?”",
       "Someone asks: “Can you add dark mode?”"),
    *p("Now the cycle begins again."),
    flow("Users", "Problems + feedback", "AI investigates", "Human checks", "Fix + improve", "Deploy update",
         "Plan again", repeat=""),
    *p("This is one of the biggest ideas in AI-native development."),
    playbook(f"[Anthropic]({PLAYBOOK}) describes maintenance as part of the same continuous loop, with production "
             "issues becoming inputs for the next piece of work rather than ending the process at deployment."),

    h("So What Actually Changed?"),
    *p("Here's the whole thing one more time."),
    img("overview", OVERVIEW_ALT, "The whole AI-native journey on one page. Click to enlarge."),
    pair(("The old mental model", "Developer writes code → app gets built"),
         ("The newer model is closer to",
          "Human defines the goal → AI helps plan → AI builds → AI tests → humans review → app reaches users → AI "
          "helps monitor → feedback becomes the next idea")),
    playbook(f"[Anthropic]({PLAYBOOK}) calls this an AI-native SDLC, where AI is embedded throughout the lifecycle "
             "and the traditional linear process becomes more of a loop."),

    h("And Here's the Part I Think Matters Most"),
    lead("AI isn't just making developers type code faster.", "It's changing where humans spend their attention."),
    pair(("Less", "“How do I manually write this?”"),
         ("More", "“What should we build?”\n“Is this actually useful?”\n“Did the AI build the "
                  "right thing?”\n“What could go wrong?”\n“What are users telling us?”")),
    *p("That doesn't mean humans disappear."),
    pull("It means the human role moves up the stack."),
    lead("Less typing.", "More direction.", "More review.", "More decisions."),

    h("One Simple Mental Model"),
    *p("Remember this:"),
    flow("💡 Idea", "📝 Plan", "🎨 Design", "🤖 Build", "🧪 Test", "🚀 Deploy", "👥 Users", "🔧 Maintain",
         "💡 New idea", repeat=""),
    *p("That's the AI-native software loop."),
    pair(("Not", "“AI writes code.”"),
         ("But", "“AI becomes part of the entire journey from idea to real product.”")),

    h("Want the deeper version?"),
    *p(f"This article was inspired by Anthropic's [The AI-native SDLC playbook]({PLAYBOOK}), which goes much deeper "
       "into the six stages, AI-assisted workflows, artifacts, testing, deployment, maintenance, and human "
       "oversight."),
    {"type": "cta", "label": "Read Anthropic's original AI-native SDLC playbook", "href": PLAYBOOK},
]

POST = {
    "slug": "ai-can-write-the-code",
    "category": "ideas",
    "title": "AI Can Write the Code. So What Happens to Software Development?",
    "excerpt": "AI can now build screens, databases and tests in minutes. So what happens to everything around the "
               "code? A visual walkthrough of the AI-native software journey, from idea to real app.",
    "cover": {
        "text": "6 stages", "bg": "#211913", "fg": "#F2A93B",
        "image": {"src": f"{IMG}/overview.webp", "width": 1536, "height": 1024, "alt": OVERVIEW_ALT},
    },
    # Newest post with a "featured" line = the Featured box on /blog.
    "featured": {"stat": "6 stages", "caption": "from idea to real app, and what AI changes in each one"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-09-29",
    # Small labels added around Uma's text.
    "learn": [
        "What the software development lifecycle (SDLC) is, in plain words",
        "Why faster coding makes planning, testing and review matter more",
        "What each of the 6 stages looks like with AI",
        "How the developer's job moves from typing code to directing and reviewing",
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
