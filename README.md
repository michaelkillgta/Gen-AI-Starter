# Field Tested

AI tools, tracks and honest verdicts for freshers and students in India.

| Part | Tech | Folder |
|---|---|---|
| Website + API | Next.js 16 (App Router) + React + TypeScript, plain CSS. Reads and writes the database itself; read-only REST endpoints under `/api` | `web/` |
| Database | PostgreSQL 17 (`pnpm dev` locally; Supabase in production) | `api/migrations/`, content in `api/seed/` |
| Hosting | Vercel (website), Supabase (database), Cloudflare (domain, Turnstile) | `docs/deploy-vercel.md` |
| Old Rust API | Rust + Axum. No longer used by the site; kept for reference until the move is done | `api/src/` |

The original designs are in `design-canvas/` (reference only).

## Run it locally

Needs: Node 24 + pnpm. Docker is optional.

```bash
cp .env.example web/.env.local  # first time only
pnpm install                    # first time only
pnpm --dir web install          # first time only
pnpm dev                        # starts the database and the website
pnpm db:seed                    # first time, and after editing api/seed/*.json
```

On Windows, `pnpm dev` runs the database inside Ubuntu (WSL) (docs/decisions.md, entry 39).
One-time setup: `wsl --install -d Ubuntu-24.04`, then inside Ubuntu `sudo apt install -y postgresql`.

- Website: http://localhost:3001 (style guide: /styleguide)
- REST: http://localhost:3001/api/health, /api/tools, /api/tracks, /api/posts, /api/weekly, /api/challenge
- Database: PostgreSQL on `localhost:5433` (user `fieldtested`, password `fieldtested_dev`)

`pnpm check` runs lint and type checks. `pnpm test` runs the unit tests and the screen
tests (every page at 375/768/1024/1440 with accessibility checks, plus the forms and admin),
against the `fieldtested_test` database, which they empty first.

Form signups are in the database; the admin area (/admin) shows them and exports CSV.

### Windows note

Only for the old Rust API: this machine has no Visual Studio C++ tools, so Rust uses the GNU toolchain
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
  src/lib/               site config, cached content reads, helpers
  src/server/            database: content, forms, admin sign-in
  src/app/api/           read-only REST endpoints
  src/styles/            tokens.css, breakpoints.css, globals.css
  tests/                 unit/ and screens/ (Playwright at 375/768/1024/1440)
api/             database files (and the old Rust API)
  migrations/            numbered SQL files (pnpm db:migrate / db:seed)
  seed/                  site content (tools, tracks, dives, posts, weekly, projects)
  src/                   routes/ handlers/ services/ repo/ models/ middleware/ jobs/
infra/           deployment (phase 7)
.github/workflows/ci.yml lint, type check, build, clippy, tests
```

## Placeholders to fill before launch

Search the code for `TODO(uma)`: social links, WhatsApp channel, Weekly day,
challenge date/time/meet link.
