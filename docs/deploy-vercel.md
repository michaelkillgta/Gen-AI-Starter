# Going live: Vercel + Supabase + Cloudflare

The website (pages, forms, admin and the `/api` REST endpoints) runs on Vercel. The data
lives in Supabase (PostgreSQL). Cloudflare keeps your domain and the Turnstile bot check.
The Rust API in `api/src/` isn't needed any more.

## 1. Supabase: the database

1. supabase.com > New project. Region: Mumbai (closest to your readers). Save the database
   password somewhere safe.
2. Project > **Connect** > **Transaction pooler**. Copy that connection string (port 6543)
   and put your database password in it. This is `DATABASE_URL`.
3. On your laptop, create the tables and load the content (safe to run again):

   ```bash
   DATABASE_URL="<the Supabase string>" pnpm db:seed
   ```

   It runs every file in `api/migrations/`, then loads `api/seed/*.json`. Form signups are
   never touched. Run it again whenever you edit the content files.

   **Or, without the terminal:** run `pnpm db:sql`. It writes `.local/supabase/1-schema.sql`
   and `2-content.sql`. In Supabase > SQL Editor, paste and run `1-schema.sql` once, then
   `2-content.sql`. After a content edit, run `pnpm db:sql` again and re-run only `2-content.sql`.

Supabase also publishes every table through its own public REST API. Migration 0007 turns
on row level security with no rules, which closes that for the public keys; the site
connects with `DATABASE_URL`, which isn't affected.

## 2. Vercel: the website

1. vercel.com > Add New > Project > import `michaelkillgta/Gen-AI-Starter`.
2. **Root Directory: `web`**. Framework: Next.js (found on its own). Node 24 comes from
   `web/package.json`.
3. Environment variables (Production and Preview):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Supabase Transaction pooler string |
   | `ADMIN_PASSWORD_HASH` | the value `pnpm admin:password` prints |
   | `NEXT_PUBLIC_SITE_URL` | your address, e.g. `https://your-domain.in` |
   | `TURNSTILE_SECRET` | from Cloudflare > Turnstile |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | from Cloudflare > Turnstile |

4. Deploy. Check `https://<your-project>.vercel.app/api/health` says `{"ok":true}`.

Vercel's free Hobby plan is for non-commercial sites. Once the site earns money (ads, paid
courses), it needs Pro.

## 3. Cloudflare: domain and bot check

1. Vercel > Project > Settings > Domains > add your domain. Vercel shows the DNS records.
2. Cloudflare > your domain > DNS: add those records with the cloud **grey (DNS only)**,
   which is what Vercel asks for.
3. Cloudflare > Turnstile > Add widget for your domain; copy its two keys into Vercel (above).

## Admin password

`pnpm admin:password` asks for the password twice, saves the hash to `web/.env.local` for
local use, and prints it for Vercel. Changing it on Vercel needs a redeploy.

## Images and files

Today the site's images are in `web/public` (about 16 MB of small `.webp` files). That is
well inside GitHub's limits, and Vercel serves them from its own CDN. Review screenshots
(`docs/screens/`) are no longer committed; they stay on your laptop.

When images grow (many posts, big infographics, downloads), move them to **Cloudflare R2**:
10 GB free and no charge for downloads, which matters more for images than storage does.

1. Cloudflare > R2 > Create bucket `genai-starter-media`. Settings > Custom domain:
   `media.your-domain.in`.
2. Upload new images there (same folder names as `web/public`, e.g. `blog/mcp/flow.webp`).
3. Vercel > Environment Variables: `MEDIA_URL=https://media.your-domain.in`, then redeploy.
4. In `api/seed/posts.json`, use the full address
   (`https://media.your-domain.in/blog/mcp/flow.webp`) instead of `/blog/mcp/flow.webp`.

Videos stay on YouTube. Nothing about the database changes.
