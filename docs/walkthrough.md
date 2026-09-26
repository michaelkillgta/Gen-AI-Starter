# Walkthrough: what's built

Every page works at phone (375), tablet (768), desktop (1024) and large (1440) widths.
Screenshots of all 21 pages at all 4 sizes are in `web/tests/screens/output/`
(`<page>-<width>.png`). Regenerate them with `pnpm --dir web test:screens`.

| Page | Address | What you can do |
|---|---|---|
| Home | `/` | Search tools, "Start here" chips (new to AI / building a project), type chips with counts, sort (my picks / A–Z), cards or list, tool details (side panel on desktop, bottom sheet on tablet, opens in the card on phone). "This week" strip, promo cards, trust line |
| Toolkit | `/toolkit` | Search plus Type and Area filters, all kept in the address (`?type=mcp&track=agents&q=pdf&tool=docling`), so a filtered view can be shared |
| Tool page | `/toolkit/docling` | Everything about one tool, its deep dives, related tools. Has a share image |
| Tracks | `/tracks`, `/tracks/<track>` | Track switcher, track summary, progress ("3 of 9 done", saved in the browser), Start / Continue button, ordered deep dives with Start here / Read / Done |
| Deep dive | `/tracks/<track>/<dive>` | TL;DR, body, Try it with code, tools used, interview angle, Mark as done, next/previous. The track list is a sidebar on desktop and a folding "Deep dive N of M" button on phone/tablet |
| Weekly | `/weekly`, `/weekly/archive`, `/weekly/<n>` | Latest issue with use/wait/skip tally, 5 verdict cards, How I decide, past issues |
| Blog | `/blog`, `/blog/category/<slug>`, `/blog/<post>` | Category chips (each has its own address), featured post, post grid, post page with related posts, WhatsApp/email subscribe |
| Build challenge | `/challenge`, `/challenge/joined` | Waitlist form (name, WhatsApp, email) with live "N of 50" counter; after joining you see your place number and a share button |
| About | `/about` | Who's behind it and "How I choose tools" |
| Suggest | `/suggest` | One form for tools, Weekly ideas, topics and corrections |
| Contact | `/contact` | Run the challenge at your college, questions |
| Privacy, Terms | `/privacy`, `/terms` | Drafts, to be reviewed before launch |
| Not found | any bad address | Friendly 404 with links back |
| For search engines | `/sitemap.xml`, `/robots.txt`, `/rss.xml` | Built from the live content |

Behind the scenes:

- Content comes from the Rust API.
- Signups are stored in PostgreSQL (or JSON files in files mode). Export them with `pnpm export waitlist`.
- Every form checks input, allows 6 posts per visitor per minute, and uses Cloudflare Turnstile once its keys are set.
