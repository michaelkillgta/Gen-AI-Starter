# Field Tested

AI tools, tracks and honest verdicts for freshers and students in India.

| Part | Tech | Folder |
|---|---|---|
| Website | Next.js 16 (App Router) + React + TypeScript, plain CSS | `web/` |
| API | Rust + Axum + Tokio + sqlx | `api/` |
| Database | PostgreSQL 17 + pgvector (Docker, temporary) | `docker-compose.yml` |
| Hosting (later) | One server + Cloudflare Tunnel | `infra/` |

The original designs are in `design-canvas/` (reference only).

## Run it locally

Needs: Node 24 + pnpm, Rust (stable, via rustup), Docker Desktop.

```bash
cp .env.example api/.env        # first time only
pnpm install                    # first time only
pnpm --dir web install          # first time only
pnpm dev                        # starts the database, the API and the website
```

- Website: http://localhost:3000 (style guide: http://localhost:3000/styleguide)
- API: http://127.0.0.1:8080/health
- Database: `localhost:5433`, user `fieldtested`, password `fieldtested_dev`

`pnpm check` runs lint, type checks and clippy.

### Windows note

This machine has no Visual Studio C++ tools, so Rust uses the GNU toolchain
(`stable-x86_64-pc-windows-gnu`) with the WinLibs MinGW compiler on the user PATH.

## Folders

```
docs/            plan, decisions, API reference
design-canvas/   original page designs
web/             Next.js site
  src/app/(site)/        one folder per public web address
  src/app/(dev)/         style guide (development only)
  src/app/(account)/     reserved: "My progress" after launch
  src/app/admin/         reserved: content admin after launch
  src/components/        layout/, ui/, and one folder per page area
  src/features/          page logic (filters, search, progress)
  src/lib/               site config, API client, helpers
  src/styles/            tokens.css, breakpoints.css, globals.css
  tests/                 unit/ and screens/ (Playwright at 375/768/1024/1440)
api/             Rust API
  migrations/            numbered SQL files, run on start-up
  seed/                  site content (tools, tracks, dives, posts, weekly, projects)
  src/                   routes/ handlers/ services/ repo/ models/ middleware/ jobs/
infra/           deployment (phase 7)
.github/workflows/ci.yml lint, type check, build, clippy, tests
```

## Placeholders to fill before launch

Search the code for `TODO(uma)`: social links, WhatsApp channel, Weekly day,
challenge date/time/meet link.
