# Infrastructure

- `cloudflare/`: tunnel, SSL, cache rules, firewall and Turnstile setup.
- `backup/`: nightly `pg_dump` script (14-day retention) and restore steps.

The production stack is `docker-compose.prod.yml` at the repo root; the runbook is `docs/deploy.md`.
