# Going live: step-by-step

This runbook puts Field Tested on the internet: one small Linux server running the
website, the API and the database in Docker, with Cloudflare in front. Nothing on the
server is open to the internet except SSH.

Budget: a 2 GB server costs roughly ₹500–1,000 a month; a domain about ₹800–1,200 a year.
Cloudflare's free plan is enough.

## What you need (Uma)

| Item | Where | Notes |
|---|---|---|
| A domain | Any registrar (e.g. Cloudflare Registrar, GoDaddy, Namecheap) | e.g. `fieldtested.in` |
| A Cloudflare account | cloudflare.com (free) | The domain's DNS moves here |
| A server | A VPS in or near India (e.g. DigitalOcean Bangalore, Hetzner Singapore, AWS Lightsail Mumbai) | **Ubuntu 24.04, 2 GB RAM, 1–2 vCPU, 40 GB disk** |
| Your laptop's SSH key | `ssh-keygen -t ed25519` if you don't have one | Added when creating the server |
| The real values for `TODO(uma)` placeholders | Search the code for `TODO(uma)` | Social links, Weekly day, challenge date/time/link |

## 1. Buy the server

1. Create an **Ubuntu 24.04** server with **2 GB RAM** in the Bangalore, Mumbai or Singapore region.
2. Choose **SSH key** login and paste your public key (`~/.ssh/id_ed25519.pub`).
3. Note the server's IP address.

## 2. Prepare the server (once)

```bash
ssh root@SERVER-IP
```

```bash
# Updates, firewall (SSH only), automatic security updates
apt update && apt -y upgrade
apt -y install ufw unattended-upgrades git
ufw default deny incoming && ufw default allow outgoing && ufw allow OpenSSH && ufw --force enable
dpkg-reconfigure -f noninteractive unattended-upgrades

# Docker
curl -fsSL https://get.docker.com | sh

# Swap, so builds don't run out of memory on a 2 GB server
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 3. Add the domain to Cloudflare

1. Cloudflare dashboard → **Add a site** → enter the domain → Free plan.
2. At your registrar, change the domain's nameservers to the two Cloudflare shows you. This takes minutes to a few hours.
3. Wait until Cloudflare says the site is **Active**.

## 4. Create the tunnel

1. Cloudflare → **Zero Trust** → Networks → **Tunnels** → Create a tunnel → **Cloudflared** → name it `field-tested`.
2. On the "Install connector" screen, copy the **token**: the long string after `--token`. You don't need to run their install command.
3. Add public hostnames: `yoursite.in` → `HTTP` → `web:3000`, and the same for `www.yoursite.in`.
4. Follow `infra/cloudflare/README.md` for SSL, cache rules, firewall and Turnstile.

## 5. First deploy

```bash
ssh root@SERVER-IP
git clone https://github.com/michaelkillgta/field-tested.git /opt/field-tested
cd /opt/field-tested
cp .env.production.example .env.production
nano .env.production        # fill in SITE_URL, POSTGRES_PASSWORD (openssl rand -base64 32), CLOUDFLARE_TUNNEL_TOKEN, Turnstile keys
chmod 600 .env.production
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

The first build takes 10–20 minutes (Rust is slow to compile on a small server). When it's done, check it:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps     # all "healthy"
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f api web cloudflared
```

On first start the API creates the tables and loads all content from `api/seed/` on its own.
Open `https://yoursite.in`.

Private repo: `git clone` needs access. Either add the server's SSH key as a read-only
**deploy key** (GitHub repo → Settings → Deploy keys), or clone with a fine-grained token.

## 6. Backups (do this on day one)

```bash
cp infra/backup/backup.sh /usr/local/bin/field-tested-backup && chmod +x /usr/local/bin/field-tested-backup
echo "30 2 * * * root cd /opt/field-tested && /usr/local/bin/field-tested-backup >> /var/log/field-tested-backup.log 2>&1" > /etc/cron.d/field-tested-backup
/usr/local/bin/field-tested-backup      # run once now to check
```

Restore steps: `infra/backup/README.md`.

## 7. Updating the site

Content (tools, deep dives, posts, Weekly issues) lives in `api/seed/*.json`. To publish a change:

```bash
# on your laptop: edit api/seed/…, commit, push
ssh root@SERVER-IP
cd /opt/field-tested && git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production exec api /app/api seed
```

`seed` replaces content only; signups are never touched. Pages refresh within about 5
minutes, or straight away if you purge the Cloudflare cache.

## 8. Rolling back

Every deploy is a git commit, so going back means checking out the previous one:

```bash
cd /opt/field-tested
git log --oneline | head          # find the last good commit
git checkout <commit>
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production exec api /app/api seed
git checkout main                 # later, when the fix is pushed
```

Database changes only ever add tables and columns, so rolling back code is safe. If
data itself went wrong, restore last night's backup (`infra/backup/README.md`).

## 9. Getting signups out

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec api /app/api export waitlist > waitlist.csv
```

The same command works with `subscribers`, `suggestions` and `contact`.

## Moving signups collected on the laptop

If people signed up while the site ran in files mode, copy `api/data/` to the server, then run:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm -v "$PWD/api/data:/data" -e DATA_DIR=/data api import-files
```
