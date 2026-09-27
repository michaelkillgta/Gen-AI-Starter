# API reference

Base URL (local): `http://127.0.0.1:8080`. All responses are JSON. Errors look like `{ "error": "not found" }`.
Response types live in `web/src/lib/api-types/` (generated from `api/src/models/`).

| Method | Path | Returns |
|---|---|---|
| GET | `/health` | `{ status: "ok", storage: "postgres" or "files" }` (checks the store answers) |
| GET | `/tools` | `ToolsResponse`: all 28 tools (each with its deep dive links) + the "Start here" lists |
| GET | `/tools/:slug` | `ToolWithDives` |
| GET | `/tracks` | `TrackSummary[]` (with dive count and first dive) |
| GET | `/tracks/:slug` | `TrackDetail`: track + ordered dive summaries |
| GET | `/dives/:slug` | `DiveDetail`: body blocks, try-it, interview, tools, track outline, prev/next, blog copy |
| GET | `/weekly` | `IssueSummary[]`, newest first |
| GET | `/weekly/latest` | `IssueDetail` with use/wait/skip tally |
| GET | `/weekly/:number` | `IssueDetail` |
| GET | `/posts?category=slug` | `PostsResponse`: categories + post summaries (404 for an unknown category) |
| GET | `/posts/:slug` | `PostDetail` with up to 3 related posts |
| GET | `/challenge` | `ChallengeResponse`: challenge, waitlist count, previous projects |

## Forms

The website posts to these from its server (Next server actions), passing the visitor IP in `x-forwarded-for`.
Every form: max 6 posts per visitor per minute (`429`); bad input returns `422 { error, fields: { field: message } }`.
The Cloudflare Turnstile check happens in the website's server before it calls the API.

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/challenge/waitlist` | `{ name, phone, email }` | `201 { position, joined, goal, already_joined: false }`, or `200 … already_joined: true` if that phone/email already joined |
| POST | `/subscribe` | `{ contact, source? }` (WhatsApp number or email) | `{ ok: true }` |
| POST | `/suggestions` | `{ about, title, details?, link?, contact? }` | `{ ok: true }` |
| POST | `/contact` | `{ name, email, college?, message }` | `{ ok: true }` |

Phone numbers are stored as `+91XXXXXXXXXX` (Indian mobiles) or `+<country><number>`; emails lower-cased.
No public endpoint returns phones or emails; only the signed-in admin endpoints below do.

## Admin

For the private `/admin` pages. The website calls these from its server and keeps the session token in an
httpOnly, SameSite=Strict cookie scoped to `/admin` (Secure except on localhost).

| Method | Path | Needs | Returns |
|---|---|---|---|
| GET | `/admin/status` | nothing | `{ configured }` (false until `pnpm admin:password` has been run) |
| POST | `/admin/login` | `Origin` in `ADMIN_ORIGINS`, `{ password }` | `{ token, expires_in_secs: 43200 }` + cookie; `401 { error, tries_left }`; `429` (locked, `Retry-After`); `503` (not set up) |
| POST | `/admin/logout` | `Origin` in `ADMIN_ORIGINS`, session | `{ ok: true }`, clears the cookie |
| GET | `/admin/data` | session (`Authorization: Bearer …` or the `ft_admin` cookie) | waitlist (current challenge), suggestions, subscribers and contact messages, newest first; `Cache-Control: no-store`; `401` without a session |

Rules: the password is checked against the argon2id hash in `ADMIN_PASSWORD_HASH`; 5 wrong passwords from one IP
lock it out for 15 minutes (even for the right password); sessions last 12 hours and live in memory (an API
restart signs you out); POSTs from any other origin get `403`.

## Exports

Personal data leaves through the signed-in admin area (`/admin`, a "Download CSV" button per table) or the
command line:

```bash
pnpm export waitlist > waitlist.csv      # also: subscribers, suggestions, contact
```

## Storage and commands

`STORAGE=postgres` (default when `DATABASE_URL` is set) or `STORAGE=files`.

| Command | What it does |
|---|---|
| `pnpm db` | Local PostgreSQL 17 on port 5433 (creates `fieldtested` and `fieldtested_test`) |
| `pnpm db:docker` | Same, using Docker (`docker-compose.yml`, with pgvector) |
| `pnpm db:seed` | Load `api/seed/*.json` into Postgres (safe to repeat; signups untouched) |
| `pnpm db:import-files` | Copy `api/data/*.json` signups into Postgres, keeping waitlist positions |
| `pnpm export waitlist` | CSV of signups (also `subscribers`, `suggestions`, `contact`) |
| `pnpm admin:password` | Set the `/admin` password: asks twice (hidden), at least 12 characters, writes only its hash to `api/.env` |

Tables: see `api/migrations/`.
