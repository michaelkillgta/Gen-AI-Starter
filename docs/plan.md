# Build plan (approved 26 Sep 2026)

## Decisions
1. Stack: Next.js + Rust/Axum + PostgreSQL + Cloudflare. No Supabase.
2. Database: Postgres 17 + pgvector in Docker on this laptop for now; swap `DATABASE_URL` for a hosted Postgres later.
3. No login in v1. "Your progress" and "Mark as done" save to the visitor's browser (localStorage). Accounts after launch.
4. Content lives in seed files in `api/seed/` and loads into Postgres. No admin page yet.
5. Styling: plain CSS with design tokens as CSS variables. No Tailwind.
6. Hosting later (phase 7): one small cloud server running web + api + Postgres in Docker, Cloudflare in front via Cloudflare Tunnel.
7. TypeScript types for API responses are generated from the Rust models (ts-rs) so web and api can't drift.

## Screen sizes (every page)
| Size | Width | Layout |
|---|---|---|
| Phone | up to 639px | one column, pill nav that scrolls sideways, tool details expand in the card, 44px tap targets |
| Tablet | 640–1023px | two columns, pill nav, tool details in a bottom sheet, sidebars above content |
| Desktop | 1024–1439px | full 76px top menu, three columns, sticky side detail panel |
| Large | 1440px+ | desktop layout, content capped at 1440px and centred |

Deep dive on phone/tablet: the track list folds into a "Deep dive N of M" button; compare boxes and grids stack; code scrolls sideways.
Screenshot tests (Playwright) at 375, 768, 1024, 1440.

## Pages
`/` · `/toolkit` (filters in the URL: `?type=mcp&track=agents&q=pdf`) · `/toolkit/[tool]` · `/tracks` · `/tracks/[track]` ·
`/tracks/[track]/[dive]` · `/weekly` · `/weekly/archive` · `/weekly/[issue]` · `/challenge` · `/challenge/joined` · `/blog` ·
`/blog/category/[category]` · `/blog/[post]` · `/about` · `/suggest` · `/contact` · `/privacy` · `/terms` · 404 + error ·
`sitemap.xml`, `robots.txt`, `rss.xml`, share images. Later: `/search`, `/login`, `/me`, `/admin`.

## Tables
tools, tool_tags, start_lists (persona → tools); tracks, dives (body as JSONB typed blocks), dive_tools;
weekly_issues, verdicts (optional tool FK); challenges, waitlist_signups, past_projects; posts, categories (optional dive link);
subscribers, suggestions. Later: users, sessions, dive_progress, jobs.

## API
GET /tools, /tracks, /tracks/:slug, /dives/:slug, /weekly/latest, /weekly/:number, /posts, /posts/:slug, /challenge;
POST /challenge/waitlist, /subscribe, /suggestions; GET /health.
Input validation, one signup per phone/email, rate limits, Cloudflare Turnstile on forms (test keys locally).
Phones and emails are never exposed publicly.

## Phases
1. Set up: Rust, folders, Docker Postgres, Next.js skeleton, Axum /health, CI workflow.
2. Look and layout: tokens, fonts, breakpoints, header, pill nav, footers, shared UI pieces at every size.
3. Database and API: migrations, seed, read endpoints.
4. Pages in groups, each at all sizes.
5. Forms: waitlist + live counter, subscribe, suggest, contact, Turnstile, signups export.
6. Quality: screenshot tests, accessibility, speed, SEO, sitemap, RSS.
7. Go live: waits for Uma (server, money, domain).
