"""Adds (or updates) Uma's post "Your App Is Built. But Is It Secure?" in api/seed/posts.json, with her 3 infographics
in web/public/blog/security-tools/ (converted to WebP on 31 Oct 2026).

Text: Uma's draft (byline SecuRadar) kept close and made a little shorter, with her three tables as table blocks.
Each tool has its own section; the heading id is the tool's Toolkit slug, so the Toolkit's "From Uma's blog" card
jumps straight to it. Cloudflare's heading id is "cloudflare" on purpose: its card opens the post at the top.
Facts checked on 31 Oct 2026 against the official repos (see scripts/seed-tools-security.py).
Run from the repo root:  python scripts/seed-post-security-tools.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "api", "seed", "posts.json")
IMG = "/blog/security-tools"
PROMPTFOO_POST = "/blog/ai-red-teaming-promptfoo"
PASSWORDS_POST = "/blog/dont-let-ai-generate-your-passwords"
MCP_POST = "/blog/mcp-explained"
FIVE_AGENTS_POST = "/blog/five-agents-agreeing-can-still-be-one-mistake"
# Uma's own recording (YouTube title "Security Tools"), added 2 Nov 2026.
VIDEO = "iphGC6903UU"
VIDEO_URL = f"https://youtu.be/{VIDEO}"

# name, Toolkit slug, section anchor, GitHub repo
TOOLS = [
    ("Cloudflare Security Audit", "cloudflare-audit", "cloudflare", "cloudflare/security-audit-skill"),
    ("Strix", "strix", "strix", "usestrix/strix"),
    ("Shannon", "shannon", "shannon", "KeygraphHQ/shannon"),
    ("OWASP AppSec Agent", "owasp-appsec-agent", "owasp-appsec-agent", "OWASP/appsec-agent"),
    ("Trail of Bits", "trailofbits-skills", "trailofbits-skills", "trailofbits/skills"),
    ("NVIDIA SkillSpector", "skillspector", "skillspector", "NVIDIA/skillspector"),
    ("AI-Infra-Guard", "ai-infra-guard", "ai-infra-guard", "Tencent/AI-Infra-Guard"),
    ("Gitleaks", "gitleaks", "gitleaks", "gitleaks/gitleaks"),
    ("Semgrep", "semgrep", "semgrep", "semgrep/semgrep"),
    ("Nuclei", "nuclei", "nuclei", "projectdiscovery/nuclei"),
]
ANCHOR = {name: anchor for name, _, anchor, _ in TOOLS}


def gh(repo):
    return f"https://github.com/{repo}"


def jump(name, label=None):
    """A link to a tool's section in this post."""
    return f"[{label or name}](#{ANCHOR[name]})"


def p(*lines):
    return [{"type": "paragraph", "text": t} for t in lines]


def h(text, anchor=None):
    return {"type": "heading", "text": text, "id": anchor}


def img(name, alt, caption, size=(1672, 941)):
    return {"type": "image", "src": f"{IMG}/{name}.webp", "alt": alt, "width": size[0], "height": size[1],
            "caption": caption}


def ul(*items):
    return {"type": "list", "ordered": False, "items": list(items)}


def ol(*items):
    return {"type": "list", "ordered": True, "items": list(items)}


def code(language, text):
    return {"type": "code", "language": language, "code": text}


def table(header, *rows):
    return {"type": "table", "header": list(header), "rows": [list(r) for r in rows]}


def box(label, text):
    return {"type": "callout", "label": label, "text": text}


def repo(r):
    return p(f"**GitHub:** [{r}]({gh(r)})")


BIG_IDEA = "Passing your tests doesn't make your app safe. ==Check what you build before someone else does.=="

COVER_ALT = (
    "10 open-source security tools: one security ecosystem, five different jobs. 1, AI-assisted code auditing: "
    "Cloudflare Security Audit (multi-agent code auditing), OWASP AppSec Agent (AI security reviews and fixes) and "
    "Trail of Bits (specialist security analysis). 2, AI agent and infrastructure security: NVIDIA SkillSpector "
    "(inspect AI skills before installation) and AI-Infra-Guard (assess AI infrastructure and agents). 3, source code "
    "security: Gitleaks (detect exposed secrets) and Semgrep (find insecure code patterns, like a possible SQL "
    "injection). 4, AI penetration testing: Strix (AI-powered application testing) and Shannon (autonomous exploit "
    "validation). 5, vulnerability scanning: Nuclei (scan for known vulnerabilities, with findings marked high, "
    "medium and low)."
)

CLOUDFLARE_ALT = (
    "Inside Cloudflare's multi-agent security audit, in 5 steps. 1, reconnaissance: understand the codebase, its "
    "architecture, data flow and trust boundaries. 2, vulnerability hunting: agents A (authentication), B (API "
    "endpoints and database access) and C (input validation and secrets) investigate in parallel. 3, candidate "
    "findings with evidence, such as a possible authorization bypass, a possible SQL injection and a hard-coded API "
    "key. 4, independent verification: a separate agent tries to disprove each finding, marking it confirmed or "
    "rejected. 5, final report: 5 confirmed, 3 need validation, 7 rejected, with details, code references, "
    "reproduction steps and fixes. Below, a coverage tracker shows which areas were checked and which were not."
)

WORKFLOW_ALT = (
    "From first commit to secure release, a workflow with 10 open-source tools. 1, before installation: trust your "
    "development tools, check AI skills with NVIDIA SkillSpector. 2, during development: protect the code, Gitleaks "
    "finds exposed API keys and Semgrep finds insecure patterns. 3, review and investigate: Cloudflare Security "
    "Audit, OWASP AppSec Agent and Trail of Bits. 4, AI infrastructure: AI-Infra-Guard checks agents, MCP servers, "
    "APIs, databases and tools. 5, pre-release testing: Strix, Shannon and Nuclei. The loop: develop, commit, read "
    "the security findings, fix, re-test, then release with confidence."
)

AUDIT_PROMPT = """Perform a security audit of this repository
using the Cloudflare security-audit skill.

Focus on:
1. Authentication and authorization.
2. API security.
3. Database access and user isolation.
4. Secret management.
5. Input validation.
6. Dependency vulnerabilities.

Do not modify application source code.
Do not access production services.
Do not expose credentials.

Separate confirmed findings from issues
that need further validation.

Generate a structured security report."""

BODY = [
    *p("By **SecuRadar** · Discover. Understand. Experiment. Secure."),
    *p("You've spent weeks on your app. Maybe it's your final-year project, a hackathon build or your first client "
       "work. Login works. The APIs answer. The database is connected. Your AI chatbot replies. ==Everything looks "
       "ready for launch.==",
       "Now the uncomfortable question: **what happens when someone tries to break it?**",
       "Can one user see another user's private data? Can someone steal your API keys? Can an attacker trick your "
       "AI agent into doing something it shouldn't?",
       "Passing your tests doesn't make an app secure. And now that AI coding agents help us build faster, "
       "==security needs the same attention as building==. The good news: there are some genuinely useful "
       "open-source tools for this. We explored 10 of them: what each one does, and where it fits in your "
       "workflow. 👇",
       f"▶ [Watch my security tools walkthrough](#video-{VIDEO})"),
    box("The one idea to remember", BIG_IDEA),

    h("⚡ The 30-second overview", "overview"),
    *p("You don't need ten tools running at once. ==Each one solves a different problem.== Tap a tool to jump to it."),
    table(["What do you want to protect?", "Tool to explore"],
          ["Your source code", jump("Cloudflare Security Audit")],
          ["Your running app", jump("Strix")],
          ["Your app against real exploits", jump("Shannon")],
          ["Your pull requests and security design", jump("OWASP AppSec Agent")],
          ["Advanced security research", jump("Trail of Bits")],
          ["AI coding-agent skills", jump("NVIDIA SkillSpector")],
          ["AI infrastructure and MCP servers", jump("AI-Infra-Guard")],
          ["API keys and passwords", jump("Gitleaks")],
          ["Insecure coding patterns", jump("Semgrep")],
          ["Exposed services and known bugs", jump("Nuclei")]),
    *p("**Start with these 5** (our pick):"),
    ol(f"{jump('Gitleaks')}: catch leaked API keys before you push.",
       f"{jump('Semgrep')}: find insecure code patterns on every commit.",
       f"{jump('Cloudflare Security Audit')}: a careful AI review of your whole repo.",
       f"{jump('Shannon')}: prove which bugs can really be exploited, before a big release.",
       f"{jump('Trail of Bits')}: dig deeper when you find one bug and want to find its cousins."),
    *p(f"**Also covered below, for later:** {jump('Strix')}, {jump('OWASP AppSec Agent')}, "
       f"{jump('NVIDIA SkillSpector')}, {jump('AI-Infra-Guard')} and {jump('Nuclei')}."),

    # 1
    h("🧠 1. Cloudflare Security Audit: give your coding agent a security team", "cloudflare"),
    *repo("cloudflare/security-audit-skill"),
    *p("Ask one AI agent to check your app and it might find a bug. But what if it misread the code?",
       "Cloudflare's open-source ==security-audit skill== runs a structured audit with several agents instead:"),
    ul("One phase maps your app: its architecture and where data comes in.",
       "Other agents hunt for vulnerabilities, each in its own area.",
       "Every possible finding goes to a ==fresh agent that tries to disprove it==.",
       "The results become a structured report.",
       "A coverage tracker shows which parts still need a look."),
    img("cloudflare-workflow", CLOUDFLARE_ALT, "How Cloudflare's skill finds, checks and reports security issues."),
    *p("**Example:** an agent thinks a normal user can open another user's private records. A separate verifier "
       "checks whether that's really possible, or whether the first agent misunderstood the login rules.",
       "Every finding ends up in one of three groups:"),
    ul("**Confirmed:** the evidence shows a real vulnerability.",
       "**Needs validation:** more evidence is needed.",
       "**Rejected:** the suspected issue didn't hold up."),
    *p("**Why care?** Finding a problem is only half the job. ==Knowing whether it's real matters just as much.== "
       f"(It's the same lesson as [Five Agents Agreeing Can Still Be One Mistake]({FIVE_AGENTS_POST}).)",
       "**What you need:** a coding agent (like Claude Code or Codex) whose model can use tools and run sub-agents, "
       "and Node.js for checking the report. No Cloudflare account needed."),
    *p("**Try it yourself.** Open PowerShell or the VS Code terminal and check that Node.js is installed:"),
    code("powershell", "node -v\nnpm -v"),
    *p("Install the skill (pick your coding agent if the installer asks):"),
    code("powershell", "npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit --global"),
    *p("Go to your project and start your coding agent there:"),
    code("powershell", "cd C:\\Users\\YourName\\Desktop\\your-project"),
    *p("Then ask it for an audit:"),
    code("text", AUDIT_PROMPT),
    box("Safety note",
        "Reading the source is safe. But running builds, tests or the project's own scripts needs a real sandbox: "
        "no internet, a clean set of environment variables, read-only source and resource limits. PowerShell on "
        "its own is not that sandbox. Without one, ask the agent to leave those findings as \"needs validation\"."),
    *p("**Our take:** ==the best place to start==. It's the tool for our first hands-on experiment."),

    # 2
    h("🕵️ 2. Strix: what if someone actually attacks your app?", "strix"),
    *repo("usestrix/strix"),
    *p("A normal code review reads your source code. ==Strix goes further: it uses your running app and tries to "
       "break in==, like a real attacker would.",
       "Take a login page. Can someone skip the login? Change a request to see data they shouldn't? Reach pages "
       "meant only for admins? Strix's AI agents test exactly these things and report what they could exploit."),
    *p("**Useful for:** testing how your app behaves, not just how its code looks.",
       "**What you need:** Docker and an API key from a supported AI provider. On Windows, run it inside WSL."),
    code("bash", "pipx install strix-agent\nstrix --target ./your-app"),

    # 3
    h("💥 3. Shannon: can AI find and prove an exploit?", "shannon"),
    *repo("KeygraphHQ/shannon"),
    *p("Shannon is an ==autonomous AI pentester== for web apps and APIs. It reads your source code to find attack "
       "paths, then tries real exploits against your app.",
       "So instead of saying \"there might be a login bug here\", it tries to ==prove== the bug can be used, and "
       "gives you the evidence."),
    *p("**Useful for:** a deeper test before a big release.",
       "**What you need:** Docker, Node.js 18+ and a key for a supported AI model."),
    code("bash", "npx @keygraph/shannon@latest setup"),
    box("Careful", "Shannon really runs attacks. ==Use it only on apps you own, in a safe test copy==, never on a live "
                   "site."),

    # 4
    h("🛡️ 4. OWASP AppSec Agent: security reviews while you build", "owasp-appsec-agent"),
    *repo("OWASP/appsec-agent"),
    *p("Security shouldn't wait until launch day. OWASP AppSec Agent gives you ready-made AI agents for everyday "
       "security work:"),
    ul("Full repository security reviews.",
       "Pull request security reviews.",
       "Threat modelling (what could go wrong, and how).",
       "Checking whether a finding is real.",
       "Writing a fix, then testing that it didn't break anything."),
    *p("The clever part is the ==adversarial review==: one agent finds possible problems, another challenges them and "
       "drops the ones without a real attack path.",
       "**Useful for:** making security part of every pull request.",
       "**What you need:** Node.js 18+ and a model API key (Claude, Codex or DeepInfra)."),
    code("bash", "npm install -g appsec-agent\nagent-run -r code_reviewer -s ./src"),

    # 5
    h("🔬 5. Trail of Bits: specialist tools for serious investigation", "trailofbits-skills"),
    *repo("trailofbits/skills"),
    *p("Sometimes a general review isn't enough. You found one bug, and now you're wondering: ==does the same mistake "
       "exist anywhere else in my code?==",
       "Trail of Bits, a well-known security audit firm, shares skills and plugins for exactly this kind of deeper "
       "work:"),
    ul("Code auditing.", "Static analysis (with tools like CodeQL and Semgrep).",
       "Variant analysis: finding similar bugs across your code.", "Security testing.",
       "Smart contract audits.", "GitHub Actions security."),
    *p("**Useful for:** developers and security researchers who want specialist techniques.",
       "**Install in Claude Code:**"),
    code("text", "/plugin marketplace add trailofbits/skills"),
    *p("Using Codex? The repo shows the matching Codex command too."),

    # 6
    h("🤖 6. NVIDIA SkillSpector: check that AI skill before you install it", "skillspector"),
    *repo("NVIDIA/skillspector"),
    *p("Here's a risk many AI developers miss. You find a useful-looking AI skill on GitHub and install it. It can "
       "now ==run commands and touch your project files==. But did you check what's inside?",
       "NVIDIA SkillSpector scans agent skills ==before== you install them. It looks for suspicious code, malicious "
       "patterns, prompt injection, data leaks and other risks."),
    *p("**Useful for:** Claude Code, Codex, MCP and other skill-based setups.",
       "**What you need:** Python 3.12+. The quick static scan needs ==no AI key==; an optional deeper scan can use "
       "a model."),
    code("bash", "uv tool install git+https://github.com/NVIDIA/skillspector.git\nskillspector scan ./my-skill/ --no-llm"),

    # 7
    h("🧩 7. AI-Infra-Guard: protect the AI setup itself", "ai-infra-guard"),
    *repo("Tencent/AI-Infra-Guard"),
    *p("Your app might be safe. But what about the AI around it? Say your agent connects to:"),
    ul("MCP servers.", "External APIs.", "Databases.", "Other AI agents.", "Third-party skills."),
    *p(f"==Every connection is one more door to guard.== (New to MCP? Read [MCP Explained]({MCP_POST}).)",
       "AI-Infra-Guard, from Tencent, is an AI red-teaming platform with one dashboard for scanning agents, skills "
       "and MCP servers, checking AI infrastructure for known bugs and testing how easily a model can be "
       "jailbroken."),
    *p("**Useful for:** anyone building AI agents, MCP apps or LLM infrastructure.",
       "**What you need:** Docker (4 GB RAM, 10 GB disk). Some AI checks need a model key, but not every scanner "
       "does."),
    code("bash", "git clone https://github.com/Tencent/AI-Infra-Guard.git\ncd AI-Infra-Guard\n"
                 "docker compose -f docker-compose.images.yml up -d\n# then open http://localhost:8088"),
    box("Careful", "The repo warns that the platform ==has no login yet==. Keep it on your own machine or a private "
                   "network, and never put it on the public internet."),

    # 8
    h("🔑 8. Gitleaks: did you accidentally publish your API keys?", "gitleaks"),
    *repo("gitleaks/gitleaks"),
    *p("This is one of the simplest checks every developer should use. Imagine pushing this file to GitHub:"),
    code("text", "OPENAI_API_KEY=your-real-key\nDATABASE_PASSWORD=your-password\nSUPABASE_SERVICE_ROLE_KEY=your-secret"),
    *p("Deleting it later ==doesn't remove it from your Git history==. Anyone who clones the repo can still find it.",
       "Gitleaks scans your repo, folders and old commits for leaked keys, tokens and passwords.",
       f"**Useful for:** every developer, from day one. (Also read [Don't Let AI Generate Your Passwords]"
       f"({PASSWORDS_POST}).)",
       "**No AI key needed.**"),
    code("powershell", "winget install Gitleaks.Gitleaks\ngitleaks git ."),

    # 9
    h("🧪 9. Semgrep: find insecure patterns in your code", "semgrep"),
    *repo("semgrep/semgrep"),
    *p("You don't always need an AI agent to find a security bug. Sometimes ==clear, repeatable rules== are exactly "
       "right.",
       "Semgrep scans your code in 30+ languages and flags patterns linked to vulnerabilities, such as:"),
    ul("SQL injection patterns.", "Unsafe handling of user input.", "Dangerous functions.", "Hard-coded secrets.",
       "Other weak spots."),
    code("bash", "pip install semgrep\nsemgrep scan --config auto ."),
    *p("**Useful for:** regular checks, your daily workflow and CI/CD pipelines.",
       "The free open-source version is great for starting out. It checks one file at a time, so it misses some "
       "bugs that Semgrep's paid platform can follow across files."),

    # 10
    h("🌐 10. Nuclei: check your running app for known bugs", "nuclei"),
    *repo("projectdiscovery/nuclei"),
    *p("Your code might look clean, but your running app could still expose:"),
    ul("Old software with known bugs.", "Misconfigured endpoints.", "Exposed services and admin panels.",
       "Known CVEs (publicly listed vulnerabilities).", "Other easy-to-spot problems."),
    *p("Nuclei is a ==template-based scanner==. It uses thousands of community-written templates to check the "
       "targets you choose.",
       "**Try it on your own staging site:**"),
    code("bash", "nuclei -u https://your-authorized-staging-domain.com"),
    *p("**Useful for:** infrastructure checks and finding known bugs in running apps. **No AI key needed.**"),
    box("Careful", "==Never scan a site or server you don't own or have permission to test.== It can be illegal."),

    h("🔄 How do all 10 tools work together?", "workflow"),
    *p("Now let's put them into a real workflow. Say you're building a Next.js app with Supabase, a Python API and "
       "an AI assistant. Here's how you could protect it:"),
    img("workflow", WORKFLOW_ALT, "From first commit to secure release: where each tool fits."),
    table(["Stage", "Tool", "What happens"],
          ["Before installing AI skills", jump("NVIDIA SkillSpector"), "Check outside skills"],
          ["Every commit", jump("Gitleaks"), "Catch leaked secrets"],
          ["While coding", jump("Semgrep"), "Find insecure code patterns"],
          ["During development", jump("OWASP AppSec Agent"), "Review code and threats"],
          ["Deep code review", jump("Cloudflare Security Audit", "Cloudflare"), "Multi-agent security audit"],
          ["Specialist investigation", jump("Trail of Bits"), "Find related bugs"],
          ["AI infrastructure checks", jump("AI-Infra-Guard"), "Check agents and MCP"],
          ["Before release", f"{jump('Strix')} or {jump('Shannon')}", "Try controlled attacks"],
          ["Staging check", jump("Nuclei"), "Look for known bugs"]),
    *p("You don't need everything on every commit. ==Start with Gitleaks and Semgrep==, add Cloudflare for deeper "
       "reviews, and bring in the specialist tools as your app grows."),

    h("💡 Which tools should you start with?", "start-here"),
    *p("Don't install ten tools just because they're on this list. Choose by what you're building:"),
    table(["Your situation", "Start here"],
          ["Building a normal web app", f"{jump('Gitleaks')} + {jump('Semgrep')}"],
          ["Building with Claude Code or Codex", jump("Cloudflare Security Audit", "Cloudflare")],
          ["Building AI agents or MCP servers", f"{jump('NVIDIA SkillSpector', 'SkillSpector')} + "
                                                f"{jump('AI-Infra-Guard')}"],
          ["Testing a running website", jump("Strix")],
          ["Doing a deeper penetration test", jump("Shannon")],
          ["Digging into tricky code bugs", jump("Trail of Bits")],
          ["Adding security to code reviews", jump("OWASP AppSec Agent")],
          ["Checking exposed servers", jump("Nuclei")]),
    box("Our starter stack",
        "==Gitleaks + Semgrep + Cloudflare.== Fixed rules plus an AI-assisted code audit, without paying for a "
        "separate AI pentesting platform on day one."),
    *p(f"**Watch it.** I walk through these tools in my video. You can also [watch it on YouTube]({VIDEO_URL})."),
    {"type": "video", "youtube_id": VIDEO, "title": "Security Tools (Uma's walkthrough video)",
     "caption": "Security tools walkthrough"},

    h("🧪 Want to experiment with us?", "experiment"),
    *p("We're starting with Cloudflare Security Audit. The plan is simple:"),
    ol("Pick a local app you own.", "Install the security-audit skill.", "Run a read-only source audit.",
       "Understand the findings.", "Check which issues can really be exploited.",
       "Write down the results and possible fixes."),
    *p("We'll share the setup, commands, screenshots, what we saw and what we learned. You can run the same "
       f"experiment on your own project. **Start here:** [cloudflare/security-audit-skill]"
       f"({gh('cloudflare/security-audit-skill')})."),

    h("The final thought", "final-thought"),
    *p("Security isn't something to think about only after something goes wrong. You don't need a big company's "
       "security team to build safer software. ==You need the right tools, a little curiosity and the habit of "
       "checking what you build.==",
       "AI helps us build faster. Let's make sure it also helps us build safer.",
       "**Build fast. Check carefully. Ship responsibly.** 🔐",
       f"**Also read:** [Red Teaming with Promptfoo]({PROMPTFOO_POST}), [MCP Explained]({MCP_POST}) and "
       f"[Don't Let AI Generate Your Passwords]({PASSWORDS_POST})."),
    box("Disclaimer",
        "This post is for learning and defensive security. Tools and their requirements change, so always check the "
        "official docs. ==Test only systems you own or have permission to test==, and check every finding yourself."),

    h("Resources"),
    ul(*[f"[{name}]({gh(r)}): {desc}" for (name, _, _, r), desc in zip(TOOLS, [
        "multi-agent code audit skill.",
        "AI penetration testing for running apps.",
        "autonomous AI pentester that proves exploits.",
        "AI agents for code, PR and threat-model reviews.",
        "specialist security skills and plugins.",
        "scan AI agent skills before installing them.",
        "AI red-teaming platform for agents, MCP and skills.",
        "find leaked secrets in Git.",
        "rule-based code scanning.",
        "template-based vulnerability scanner.",
    ])], f"[My walkthrough video]({VIDEO_URL}): the security tools, explained.",
       "[Our 5 picks in the Toolkit](/toolkit?track=security): quick notes on each one."),
]

# The 5 tools in the Toolkit (Uma's pick, 1 Nov 2026): the other 5 keep their sections in the post only.
START = ["Gitleaks", "Semgrep", "Cloudflare Security Audit", "Shannon", "Trail of Bits"]

# Tools used: shown as Toolkit pills just before the first section.
TOOLS_USED = {"type": "links", "label": "Tools used", "items": [
    {"label": name, "href": f"/toolkit/{slug}"} for name, slug, _, _ in TOOLS if name in START
]}
# Jump rows, right after the Tools used row: the 5 to start with, then the other 5.


def jump_row(label, names):
    return {"type": "links", "label": label, "items": [{"label": name, "href": f"#{ANCHOR[name]}"} for name in names]}


JUMP_START = jump_row("Start with these 5", START)
first = next(i for i, b in enumerate(BODY) if b["type"] == "heading")
BODY[first:first] = [TOOLS_USED, JUMP_START]

POST = {
    "slug": "open-source-security-tools",
    "category": "staying-safe",
    "title": "Your App Is Built. But Is It Secure? 10 Open-Source Security Tools",
    "excerpt": "Your app works, but can you trust it? 10 open-source tools for AI code audits, pentesting, leaked "
               "keys, insecure code and AI agent safety, and which ones to start with.",
    "cover": {"text": "Security tools", "bg": "#0F1B33", "fg": "#7CB3FF",
              "image": {"src": f"{IMG}/ten-tools.webp", "width": 1672, "height": 941, "alt": COVER_ALT}},
    # Newest post with a "featured" line = the Featured box on /blog and the homepage card.
    "featured": {"stat": "10 security tools", "caption": "to check your app before someone else does"},
    "dive": None,
    "body": BODY,
    "published_on": "2026-10-31",
    "learn": [
        "Why a working app isn't the same as a secure one",
        "What each of the 10 tools checks, and what it needs",
        "Where each tool fits, from first commit to release",
        "Which 2 or 3 tools to start with",
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
