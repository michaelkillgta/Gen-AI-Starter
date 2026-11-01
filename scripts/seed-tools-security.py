"""Adds (or updates) the 5 security tools to start with from Uma's post "Your App Is Built. But Is It Secure?" in
api/seed/tools.json, tagged "security" so they show up in the Toolkit's Security area.
Uma kept only these 5 on 1 Nov 2026; the other 5 from the post (Strix, OWASP AppSec Agent, SkillSpector,
AI-Infra-Guard, Nuclei) are removed from the Toolkit (see REMOVED). The post still covers all 10.

Facts checked on 31 Oct 2026 against each official GitHub repo (README and licence): Cloudflare security-audit
skill (MIT, Node.js for its validators), Strix (Apache 2.0, Docker + an LLM key, `pipx install strix-agent`),
Shannon (AGPL-3.0, Docker + Node.js 18+), OWASP appsec-agent (Apache 2.0, Node.js 18+, Claude/Codex/DeepInfra),
Trail of Bits skills (CC BY-SA 4.0), NVIDIA SkillSpector (Apache 2.0, Python 3.12+, `--no-llm` static scans),
Tencent AI-Infra-Guard (Apache 2.0, Docker, 4 GB RAM, web UI on port 8088, no login yet), Gitleaks (MIT,
`winget install Gitleaks.Gitleaks`), Semgrep (LGPL-2.1, 30+ languages), Nuclei (MIT, Go 1.27.3+ to build).
Each tool's post link opens its own section of the post (heading id = tool slug); Cloudflare opens at the top.
Run from the repo root:  python scripts/seed-tools-security.py
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, "api", "seed", "tools.json")

NEW = [
    {
        "slug": "cloudflare-audit",
        "name": "Cloudflare Security Audit",
        "kind": "package",
        "group": "agents",
        "short": "A skill that turns your coding agent into a security team.",
        "plain": "Cloudflare's open-source skill for coding agents. One agent maps your app, others hunt for bugs, and a "
                 "fresh agent tries to disprove each finding, so the report sorts issues into confirmed, needs "
                 "validation and rejected.",
        "use_when": "You build with Claude Code or Codex and want a careful, read-only review of your own repo.",
        "skip_when": "Your agent can't run sub-agents, or you need it to run untrusted code without a proper sandbox.",
        "runs_on": "Your coding agent, on your laptop",
        "cost": "Free, MIT (your agent's model usage is extra)",
        "get_it": "npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit --global",
        "status": "notes",
        "note": "Needs Node.js for its report checks. No Cloudflare account needed.",
        "tags": ["security", "code review", "agents", "audit"],
    },
    {
        "slug": "shannon",
        "name": "Shannon",
        "kind": "package",
        "group": "ship",
        "short": "An AI pentester that proves a bug with a real exploit.",
        "plain": "Keygraph's autonomous pentester for web apps and APIs. It reads your source code to find attack "
                 "paths, then runs real exploits against your app to show which weaknesses are genuine.",
        "use_when": "You're about to release and want a deeper test in a safe copy of your app.",
        "skip_when": "You can't use an isolated test setup. It really attacks the target, so never point it at "
                     "production.",
        "runs_on": "Your laptop with Docker (Windows: WSL2)",
        "cost": "Free, AGPL-3.0 (you pay for the LLM)",
        "get_it": "npx @keygraph/shannon@latest setup",
        "status": "notes",
        "note": "Needs Docker and Node.js 18+. Test only apps you own.",
        "tags": ["security", "pentesting", "agents", "testing"],
    },
    {
        "slug": "trailofbits-skills",
        "name": "Trail of Bits Skills",
        "kind": "package",
        "group": "agents",
        "short": "Specialist security skills from a top audit firm.",
        "plain": "A marketplace of plugins for Claude Code and Codex from the security firm Trail of Bits: code "
                 "auditing, static analysis, finding the same bug elsewhere (variant analysis), GitHub Actions "
                 "checks and smart contract audits.",
        "use_when": "You found one bug and want to know if the same mistake hides anywhere else.",
        "skip_when": "You're just starting out. Begin with Gitleaks and Semgrep first.",
        "runs_on": "Claude Code or Codex",
        "cost": "Free, CC BY-SA 4.0",
        "get_it": "/plugin marketplace add trailofbits/skills",
        "status": "notes",
        "note": "Codex: codex plugin marketplace add trailofbits/skills",
        "tags": ["security", "audit", "static analysis", "agents"],
    },
    {
        "slug": "gitleaks",
        "name": "Gitleaks",
        "kind": "package",
        "group": "ship",
        "short": "Finds API keys and passwords hiding in your Git history.",
        "plain": "A small, fast scanner that checks your repo, folders and every past commit for leaked secrets like "
                 "API keys, tokens and passwords. It runs on your laptop with no AI and no account.",
        "use_when": "Always. Run it before you push, or add it as a pre-commit hook.",
        "skip_when": "Never really. It takes seconds.",
        "runs_on": "Your laptop, pre-commit hooks, GitHub Actions",
        "cost": "Free, MIT",
        "get_it": "winget install Gitleaks.Gitleaks",
        "status": "notes",
        "note": "Mac: brew install gitleaks. Then run: gitleaks git .",
        "tags": ["security", "secrets", "git", "ci"],
    },
    {
        "slug": "semgrep",
        "name": "Semgrep",
        "kind": "package",
        "group": "ship",
        "short": "Rules that catch insecure code patterns, no AI needed.",
        "plain": "A fast code scanner for 30+ languages. It matches patterns linked to bugs, like SQL injection or "
                 "dangerous functions, using community rules or rules you write that look like your own code.",
        "use_when": "You want a quick, repeatable check on every commit or in CI.",
        "skip_when": "You need bugs that cross many files. The free version looks one file at a time.",
        "runs_on": "Your laptop, CI pipelines",
        "cost": "Free, LGPL-2.1 (paid platform optional)",
        "get_it": "pip install semgrep",
        "status": "notes",
        "note": "Then run: semgrep scan --config auto .",
        "tags": ["security", "static analysis", "ci", "code review"],
    },
]


# Uma's pick (31 Oct 2026): the 5 to start with, in this order. Matches SECURITY_START in web/src/features/toolkit/filter.ts.
REMOVED = ["strix", "owasp-appsec-agent", "skillspector", "ai-infra-guard", "nuclei"]
START = ["gitleaks", "semgrep", "cloudflare-audit", "shannon", "trailofbits-skills"]


def main():
    with io.open(TOOLS, encoding="utf-8") as f:
        tools = json.load(f)
    slugs = {t["slug"] for t in NEW} | set(REMOVED)
    tools = [t for t in tools if t["slug"] not in slugs]
    start = max(t["position"] for t in tools) + 1
    # The 5 to start with are added last, so they are the newest (the Toolkit's "Recently added").
    order = [t for t in NEW if t["slug"] not in START] + sorted(
        (t for t in NEW if t["slug"] in START), key=lambda t: START.index(t["slug"]))
    for n, t in enumerate(order):
        tools.append({**t, "position": start + n})
    with io.open(TOOLS, "w", encoding="utf-8", newline="\n") as f:
        json.dump(tools, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"tools: {len(tools)}")


if __name__ == "__main__":
    main()
