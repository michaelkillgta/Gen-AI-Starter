# Decisions log

Choices made while building, so they can be reviewed later. Newest at the bottom.

| # | Date | Decision | Why |
|---|---|---|---|
| 1 | 2026-09-26 | Rust uses the **GNU toolchain** (`stable-x86_64-pc-windows-gnu`) plus the WinLibs MinGW compiler. | This laptop has no Visual Studio C++ build tools. CI and the future server build on Linux, so this only affects local builds. |
| 2 | 2026-09-26 | Cargo builds go to `C:\Users\tempo\.cache\field-tested-target` (set in the gitignored `api/.cargo/config.toml`). | Windows Smart App Control blocks freshly compiled build scripts inside OneDrive, and OneDrive would otherwise sync gigabytes of build output. |
| 3 | 2026-09-26 | **Database moved to phase 8** (Uma). Until then the API loads `api/seed/*.json` into memory behind one repository trait per area (`ToolRepo`, `TrackRepo`, `WeeklyRepo`, `BlogRepo`, `ChallengeRepo`). | Phase 8 only adds Postgres implementations of the same traits. |
| 4 | 2026-09-26 | Seed content was extracted from the design files by `scripts/extract-seed.mjs` and `scripts/seed-handwritten.mjs`. | Keeps the design text word-for-word. Re-running them overwrites the seed files, so hand edits should go straight into `api/seed/` from now on. |
| 5 | 2026-09-26 | The seed is checked at start-up: duplicate slugs or links to missing tools/tracks/dives/categories stop the API with a clear message. | Broken links are caught before they reach a page. |
| 6 | 2026-09-26 | Deep dives without a written body still get a page (TL;DR, tools, "full deep dive coming soon"). Only "Know when to stop" has a full body, as in the design. | All 21 dives are reachable; bodies can be added to `dives.json` over time. |
| 7 | 2026-09-26 | Reading time is worked out from the text (200 words a minute) unless `read_minutes` is set. | Replaces the design's "[X] min read" placeholder. |
| 8 | 2026-09-26 | Slugs: tracks `foundations`, `agents-that-dont-break`, `rag-and-documents`; dives and posts use their title; tools keep the design ids (e.g. `docling`). Blog categories: `learning-with-ai`, `agents`, `rag-and-documents`, `careers`, `ideas`, `staying-safe`. | Readable, stable web addresses. |
| 9 | 2026-09-26 | The featured blog post ("Does AI make you a lazy learner…") is a real post in `posts.json` with a `featured` stat. Post dates are placeholders (Sept 2026). | The design showed it separately from the grid. |
| 10 | 2026-09-26 | Weekly: added `GET /weekly` (archive list) besides `/weekly/latest` and `/weekly/:number`. Issue 1 is dated week of 21 Sep 2026. | The archive page needs a list. |
| 11 | 2026-09-26 | TypeScript types for every API response are generated from the Rust models with ts-rs into `web/src/lib/api-types/` (run `cargo test` in `api/`). | Web and API can't drift apart. |
| 12 | 2026-09-26 | Pages call the API per request (`connection()`), and each API answer is cached for 5 minutes (15 seconds for the waitlist count). | Builds don't need the API running, pages stay fast, and edits show up within minutes. |
| 13 | 2026-09-26 | Git pushes are not possible from this session (blocked by the permission guard). Work is committed locally; the private repo `michaelkillgta/field-tested` exists but is empty. | Uma can push with `git remote add origin … && git push -u origin main`. |
| 14 | 2026-09-26 | Forms post to **Next server actions**, which call the Rust API server-side with the visitor IP. | The API never needs to be public, forms work before JavaScript loads, and there is no CORS to manage. |
| 15 | 2026-09-26 | Until phase 8, submissions are JSON files in `api/data/` (gitignored) behind `SubmissionRepo`; writes are atomic (temp file + rename). | Same trait gets a Postgres version later. |
| 16 | 2026-09-26 | One waitlist place per phone **or** email. Joining again shows your original number instead of an error. | Friendlier, and still no duplicates. |
| 17 | 2026-09-26 | Indian mobiles are normalised to `+91XXXXXXXXXX` (accepts spaces, dashes, 0 or 91 prefixes); other countries need a leading `+`. | The audience is India; numbers match however they're typed. |
| 18 | 2026-09-26 | Spam protection: hidden honeypot field, 6 posts per visitor per minute, and Cloudflare Turnstile once `TURNSTILE_SECRET` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are set (off locally). | Layered and free. |
| 19 | 2026-09-26 | Signups export via `pnpm export waitlist` (CSV to stdout; also subscribers, suggestions, contact). No admin web page. | Personal data stays off the web until accounts and an admin exist. |
| 20 | 2026-09-26 | Colours darkened for contrast: faint text #8A7D70 → #766A5D, big list numbers #B5A898 → #948676. | WCAG AA (axe) passes on every page. |
| 21 | 2026-09-26 | New pages not in the designs: `/toolkit/[tool]`, `/blog/[post]`, `/weekly/archive`, `/weekly/[n]`, `/challenge/joined`, About, Suggest, Contact, Privacy, Terms. Privacy and Terms are drafts marked for review. | Needed for sharing, SEO and the forms. |
