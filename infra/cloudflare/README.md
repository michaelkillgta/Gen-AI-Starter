# Cloudflare setup

Cloudflare sits in front of the server: DNS, HTTPS, CDN caching, firewall (WAF) and bot
protection. The server has **no open web ports**. `cloudflared` (in
`docker-compose.prod.yml`) makes an outbound connection to Cloudflare and brings
visitors in through that tunnel.

## 1. Tunnel and public hostnames

Create the tunnel in the dashboard (Zero Trust → Networks → Tunnels → Create → Cloudflared).
Copy the token into `CLOUDFLARE_TUNNEL_TOKEN` in `.env.production`. Then add public hostnames:

| Public hostname | Service | Notes |
|---|---|---|
| `yoursite.in` | `http://web:3000` | The website |
| `www.yoursite.in` | `http://web:3000` | Also add a redirect rule www → apex (below) |
| `api.yoursite.in` | `http://api:8080` | **Optional. Not needed today.** The website talks to the API inside the server; only add this if another app must call the API, and then protect it with Cloudflare Access |

A locally managed alternative (config file instead of dashboard) is in `tunnel-config.example.yml`.

## 2. SSL/TLS

- SSL/TLS → Overview: **Full**. The tunnel encrypts traffic to the server.
- Edge Certificates: turn on **Always Use HTTPS**, **Automatic HTTPS Rewrites**, minimum TLS **1.2**, and **HSTS** once the site is stable (max-age 6 months, include subdomains).

## 3. Cache rules (Caching → Cache Rules)

Create them in this order:

| # | Rule | If | Then |
|---|---|---|---|
| 1 | Never cache forms and dynamic pages | URI path starts with `/challenge` **or** `/suggest` **or** `/contact`, **or** request method is not GET | Bypass cache |
| 2 | Cache static files for a long time | URI path starts with `/_next/static/` **or** file extension in `woff2 png svg ico` | Eligible for cache, edge TTL 1 year, browser TTL 1 year |
| 3 | Cache pages briefly | Hostname equals `yoursite.in` and not matched above | Eligible for cache, edge TTL **5 minutes** (override origin), browser TTL: respect origin; serve stale while revalidating |
| 4 | API (only if you exposed `api.`) | Hostname equals `api.yoursite.in` and method GET and path does not start with `/challenge` | Eligible for cache, edge TTL 60 s. Everything else on `api.`: bypass |

Content also caches for 5 minutes inside the website, so a change shows up within about 10 minutes.
To show a change straight away: Caching → Configuration → **Purge Everything**.

## 4. Firewall, rate limits and bots

- Security → WAF → Managed rules: turn on the **Cloudflare Free Managed Ruleset**.
- Security → WAF → Rate limiting rules. Create one: if URI path is in `/challenge`, `/blog`, `/suggest`, `/contact` and the method is POST, allow **10 requests per 1 minute per IP**, then block for 10 minutes. The API has its own limit (6 per minute) too.
- Security → Bots: turn on **Bot Fight Mode**.
- Security → Settings: Security level **Medium**. Browser integrity check **on**.
- **Turnstile** (bot check on the forms): Dashboard → Turnstile → Add widget.
  - Domain `yoursite.in`, mode **Managed**.
  - Put the site key in `TURNSTILE_SITE_KEY` and the secret in `TURNSTILE_SECRET`, then rebuild the web image. It's needed because the site key is built into the page.
  - Check it: the forms show the widget, and a submission without it is refused ("Please complete the check…").

## 5. Redirects

Rules → Redirect Rules → "Redirect from WWW to root", status 301, keep the query string.

## 6. Checklist before announcing the site

- [ ] `https://yoursite.in` loads and shows the padlock
- [ ] `https://yoursite.in/sitemap.xml` and `/rss.xml` load
- [ ] Waitlist form works, and the counter goes up
- [ ] Turnstile widget visible on forms
- [ ] `http://SERVER-IP:3000` and `:8080` do **not** respond from outside (no open ports)
- [ ] Nightly backup ran (`ls /var/backups/field-tested`)
- [ ] Submit the sitemap in Google Search Console
