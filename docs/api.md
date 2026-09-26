# API reference

Base URL (local): `http://127.0.0.1:8080`. All responses are JSON. Errors look like `{ "error": "not found" }`.
Response types live in `web/src/lib/api-types/` (generated from `api/src/models/`).

| Method | Path | Returns |
|---|---|---|
| GET | `/health` | `{ status: "ok", storage: "memory" }` |
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

Form endpoints (phase 5): `POST /challenge/waitlist`, `POST /subscribe`, `POST /suggestions`, `POST /contact`.
