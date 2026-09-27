//! PostgreSQL storage: the same traits as the seed files and JSON files, backed by
//! the tables in `api/migrations/`.

use anyhow::Context;
use async_trait::async_trait;
use chrono::NaiveDate;
use sqlx::{PgPool, Postgres, Row, Transaction, postgres::PgRow, types::Json};

use super::{
    AddOutcome, BlogRepo, ChallengeRepo, RepoResult, SubmissionRepo, ToolRepo, TrackRepo,
    WeeklyRepo, memory::SeedStore,
};
use crate::models::{
    forms::{ContactKind, ContactMessage, Subscriber, Suggestion, WaitlistEntry},
    seed::{
        Block, Category, Challenge, Cover, Dive, Fact, Featured, Interview, Post, Project,
        ProjectCover, Stage, StartList, Tool, Track, TrackOverview, TryIt, Verdict, WeeklyIssue,
    },
};

pub struct PgStore {
    pool: PgPool,
}

impl PgStore {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// True before the first `seed` (no content yet).
    pub async fn has_no_content(&self) -> anyhow::Result<bool> {
        let n: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM tools")
            .fetch_one(&self.pool)
            .await?;
        Ok(n == 0)
    }

    pub async fn migrate(&self) -> anyhow::Result<()> {
        sqlx::migrate!("./migrations")
            .run(&self.pool)
            .await
            .context("running migrations")
    }
}

/// Enum columns are stored as their lower-case JSON names.
fn to_text<T: serde::Serialize>(v: &T) -> String {
    serde_json::to_value(v)
        .ok()
        .and_then(|j| j.as_str().map(str::to_string))
        .unwrap_or_default()
}

fn from_text<T: serde::de::DeserializeOwned>(s: &str) -> anyhow::Result<T> {
    serde_json::from_value(serde_json::Value::String(s.to_string()))
        .with_context(|| format!("bad enum value {s}"))
}

fn date(s: &str) -> anyhow::Result<NaiveDate> {
    NaiveDate::parse_from_str(s, "%Y-%m-%d").with_context(|| format!("bad date {s}"))
}

// ---------------------------------------------------------------- content reads

fn tool_from(r: &PgRow) -> anyhow::Result<Tool> {
    Ok(Tool {
        slug: r.try_get("slug")?,
        name: r.try_get("name")?,
        kind: from_text(r.try_get::<&str, _>("kind")?)?,
        group: from_text(r.try_get::<&str, _>("grp")?)?,
        short: r.try_get("short")?,
        plain: r.try_get("plain")?,
        use_when: r.try_get("use_when")?,
        skip_when: r.try_get("skip_when")?,
        runs_on: r.try_get("runs_on")?,
        cost: r.try_get("cost")?,
        get_it: r.try_get("get_it")?,
        status: from_text(r.try_get::<&str, _>("status")?)?,
        note: r.try_get("note")?,
        tags: r.try_get("tags")?,
        position: r.try_get("position")?,
    })
}

#[async_trait]
impl ToolRepo for PgStore {
    async fn tools(&self) -> RepoResult<Vec<Tool>> {
        let rows = sqlx::query(
            "SELECT t.*, COALESCE(ARRAY(SELECT tag FROM tool_tags g WHERE g.tool_slug = t.slug ORDER BY g.position), '{}') AS tags
             FROM tools t ORDER BY t.position",
        )
        .fetch_all(&self.pool)
        .await?;
        rows.iter().map(tool_from).collect()
    }

    async fn start_lists(&self) -> RepoResult<Vec<StartList>> {
        let rows = sqlx::query(
            "SELECT l.slug, l.label,
                    COALESCE(ARRAY(SELECT tool_slug FROM start_list_tools s WHERE s.list_slug = l.slug ORDER BY s.position), '{}') AS tools
             FROM start_lists l ORDER BY l.position",
        )
        .fetch_all(&self.pool)
        .await?;
        rows.iter()
            .map(|r| {
                Ok(StartList {
                    slug: r.try_get("slug")?,
                    label: r.try_get("label")?,
                    tools: r.try_get("tools")?,
                })
            })
            .collect()
    }
}

#[async_trait]
impl TrackRepo for PgStore {
    async fn tracks(&self) -> RepoResult<Vec<Track>> {
        let rows = sqlx::query("SELECT * FROM tracks ORDER BY position")
            .fetch_all(&self.pool)
            .await?;
        rows.iter()
            .map(|r| {
                Ok(Track {
                    slug: r.try_get("slug")?,
                    name: r.try_get("name")?,
                    who: r.try_get("who")?,
                    tone: from_text(r.try_get::<&str, _>("tone")?)?,
                    blurb: r.try_get("blurb")?,
                    start_if: r.try_get("start_if")?,
                    duration: r.try_get("duration")?,
                    position: r.try_get("position")?,
                    stages: r.try_get::<Json<Vec<Stage>>, _>("stages")?.0,
                    overview: r
                        .try_get::<Option<Json<TrackOverview>>, _>("overview")?
                        .map(|j| j.0),
                })
            })
            .collect()
    }

    async fn dives(&self) -> RepoResult<Vec<Dive>> {
        let rows = sqlx::query(
            "SELECT d.*,
                    COALESCE(ARRAY(SELECT tool_slug FROM dive_tools x WHERE x.dive_slug = d.slug ORDER BY x.position), '{}') AS tools
             FROM dives d JOIN tracks t ON t.slug = d.track_slug
             WHERE d.published
             ORDER BY t.position, d.position",
        )
        .fetch_all(&self.pool)
        .await?;
        rows.iter()
            .map(|r| {
                Ok(Dive {
                    slug: r.try_get("slug")?,
                    track: r.try_get("track_slug")?,
                    stage: r.try_get("stage")?,
                    position: r.try_get("position")?,
                    title: r.try_get("title")?,
                    tldr: r.try_get("tldr")?,
                    read_minutes: r.try_get("read_minutes")?,
                    tools: r.try_get("tools")?,
                    body: r.try_get::<Json<Vec<Block>>, _>("body")?.0,
                    try_it: r.try_get::<Option<Json<TryIt>>, _>("try_it")?.map(|j| j.0),
                    interview: r
                        .try_get::<Option<Json<Interview>>, _>("interview")?
                        .map(|j| j.0),
                    published: r.try_get("published")?,
                })
            })
            .collect()
    }
}

#[async_trait]
impl WeeklyRepo for PgStore {
    async fn issues(&self) -> RepoResult<Vec<WeeklyIssue>> {
        let issues = sqlx::query("SELECT number, week_of, published FROM weekly_issues WHERE published ORDER BY number DESC")
            .fetch_all(&self.pool)
            .await?;
        let verdicts = sqlx::query("SELECT * FROM verdicts ORDER BY issue_number, position")
            .fetch_all(&self.pool)
            .await?;
        issues
            .iter()
            .map(|i| {
                let number: i32 = i.try_get("number")?;
                let verdicts = verdicts
                    .iter()
                    .filter(|v| v.try_get::<i32, _>("issue_number").ok() == Some(number))
                    .map(|v| {
                        Ok(Verdict {
                            position: v.try_get("position")?,
                            name: v.try_get("name")?,
                            kind: from_text(v.try_get::<&str, _>("kind")?)?,
                            summary: v.try_get("summary")?,
                            why: v.try_get("why")?,
                            best_for_label: v.try_get("best_for_label")?,
                            best_for: v.try_get("best_for")?,
                            verdict: from_text(v.try_get::<&str, _>("verdict")?)?,
                            qualifier: v.try_get("qualifier")?,
                            tool: v.try_get("tool_slug")?,
                        })
                    })
                    .collect::<anyhow::Result<_>>()?;
                Ok(WeeklyIssue {
                    number,
                    week_of: i.try_get::<NaiveDate, _>("week_of")?.to_string(),
                    published: i.try_get("published")?,
                    verdicts,
                })
            })
            .collect()
    }
}

#[async_trait]
impl BlogRepo for PgStore {
    async fn categories(&self) -> RepoResult<Vec<Category>> {
        let rows = sqlx::query("SELECT * FROM categories ORDER BY position")
            .fetch_all(&self.pool)
            .await?;
        rows.iter()
            .map(|r| {
                Ok(Category {
                    slug: r.try_get("slug")?,
                    label: r.try_get("label")?,
                    bg: r.try_get("bg")?,
                    fg: r.try_get("fg")?,
                    position: r.try_get("position")?,
                })
            })
            .collect()
    }

    async fn posts(&self) -> RepoResult<Vec<Post>> {
        let rows = sqlx::query("SELECT * FROM posts ORDER BY published_on DESC, slug")
            .fetch_all(&self.pool)
            .await?;
        rows.iter()
            .map(|r| {
                Ok(Post {
                    slug: r.try_get("slug")?,
                    category: r.try_get("category_slug")?,
                    title: r.try_get("title")?,
                    excerpt: r.try_get("excerpt")?,
                    cover: r.try_get::<Json<Cover>, _>("cover")?.0,
                    featured: r
                        .try_get::<Option<Json<Featured>>, _>("featured")?
                        .map(|j| j.0),
                    dive: r.try_get("dive_slug")?,
                    body: r.try_get::<Json<Vec<Block>>, _>("body")?.0,
                    published_on: r.try_get::<NaiveDate, _>("published_on")?.to_string(),
                })
            })
            .collect()
    }
}

#[async_trait]
impl ChallengeRepo for PgStore {
    async fn current(&self) -> RepoResult<Challenge> {
        let r = sqlx::query("SELECT * FROM challenges WHERE is_current LIMIT 1")
            .fetch_optional(&self.pool)
            .await?
            .context("no current challenge; run `cargo run -- seed`")?;
        Ok(Challenge {
            slug: r.try_get("slug")?,
            status: r.try_get("status")?,
            goal: r.try_get("goal")?,
            title: r.try_get("title")?,
            blurb: r.try_get("blurb")?,
            facts: r.try_get::<Json<Vec<Fact>>, _>("facts")?.0,
            date: r.try_get("date_text")?,
            time: r.try_get("time_text")?,
            meet_link: r.try_get("meet_link")?,
        })
    }

    async fn projects(&self) -> RepoResult<Vec<Project>> {
        let rows = sqlx::query("SELECT * FROM past_projects ORDER BY position")
            .fetch_all(&self.pool)
            .await?;
        rows.iter()
            .map(|r| {
                Ok(Project {
                    slug: r.try_get("slug")?,
                    name: r.try_get("name")?,
                    eyebrow: r.try_get("eyebrow")?,
                    category: r.try_get("category")?,
                    title: r.try_get("title")?,
                    description: r.try_get("description")?,
                    tags: r.try_get("tags")?,
                    cover: r.try_get::<Json<ProjectCover>, _>("cover")?.0,
                    position: r.try_get("position")?,
                })
            })
            .collect()
    }
}

// ---------------------------------------------------------------- submissions

#[async_trait]
impl SubmissionRepo for PgStore {
    async fn join_waitlist(&self, e: WaitlistEntry) -> RepoResult<AddOutcome> {
        let mut tx = self.pool.begin().await?;
        // One signup at a time per challenge, so positions never collide.
        sqlx::query("SELECT pg_advisory_xact_lock(hashtext($1))")
            .bind(&e.challenge)
            .execute(&mut *tx)
            .await?;
        if let Some(pos) = sqlx::query_scalar::<_, i32>(
            "SELECT position FROM waitlist_signups WHERE challenge_slug = $1 AND (phone = $2 OR email = $3)
             ORDER BY position LIMIT 1",
        )
        .bind(&e.challenge)
        .bind(&e.phone)
        .bind(&e.email)
        .fetch_optional(&mut *tx)
        .await?
        {
            return Ok(AddOutcome { position: pos, duplicate: true });
        }
        let position: i32 = sqlx::query_scalar(
            "INSERT INTO waitlist_signups (id, challenge_slug, position, name, phone, email, created_at)
             VALUES ($1, $2, (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist_signups WHERE challenge_slug = $2), $3, $4, $5, $6)
             RETURNING position",
        )
        .bind(e.id)
        .bind(&e.challenge)
        .bind(&e.name)
        .bind(&e.phone)
        .bind(&e.email)
        .bind(e.created_at)
        .fetch_one(&mut *tx)
        .await?;
        tx.commit().await?;
        Ok(AddOutcome {
            position,
            duplicate: false,
        })
    }

    async fn waitlist_count(&self, challenge: &str) -> RepoResult<i32> {
        let n: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM waitlist_signups WHERE challenge_slug = $1")
                .bind(challenge)
                .fetch_one(&self.pool)
                .await?;
        Ok(n as i32)
    }

    async fn waitlist(&self, challenge: &str) -> RepoResult<Vec<WaitlistEntry>> {
        let rows = sqlx::query(
            "SELECT * FROM waitlist_signups WHERE challenge_slug = $1 ORDER BY position",
        )
        .bind(challenge)
        .fetch_all(&self.pool)
        .await?;
        rows.iter()
            .map(|r| {
                Ok(WaitlistEntry {
                    id: r.try_get("id")?,
                    challenge: r.try_get("challenge_slug")?,
                    position: r.try_get("position")?,
                    name: r.try_get("name")?,
                    phone: r.try_get("phone")?,
                    email: r.try_get("email")?,
                    created_at: r.try_get("created_at")?,
                })
            })
            .collect()
    }

    async fn subscribe(&self, s: Subscriber) -> RepoResult<bool> {
        let res = sqlx::query(
            "INSERT INTO subscribers (id, kind, value, source, created_at) VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (value) DO NOTHING",
        )
        .bind(s.id)
        .bind(to_text(&s.kind))
        .bind(&s.value)
        .bind(&s.source)
        .bind(s.created_at)
        .execute(&self.pool)
        .await?;
        Ok(res.rows_affected() == 1)
    }

    async fn subscribers(&self) -> RepoResult<Vec<Subscriber>> {
        let rows = sqlx::query("SELECT * FROM subscribers ORDER BY created_at")
            .fetch_all(&self.pool)
            .await?;
        rows.iter()
            .map(|r| {
                Ok(Subscriber {
                    id: r.try_get("id")?,
                    kind: from_text::<ContactKind>(r.try_get::<&str, _>("kind")?)?,
                    value: r.try_get("value")?,
                    source: r.try_get("source")?,
                    created_at: r.try_get("created_at")?,
                })
            })
            .collect()
    }

    async fn add_suggestion(&self, s: Suggestion) -> RepoResult<()> {
        sqlx::query(
            "INSERT INTO suggestions (id, about, title, details, link, contact, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO NOTHING",
        )
        .bind(s.id)
        .bind(&s.about)
        .bind(&s.title)
        .bind(&s.details)
        .bind(&s.link)
        .bind(&s.contact)
        .bind(s.created_at)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn suggestions(&self) -> RepoResult<Vec<Suggestion>> {
        let rows = sqlx::query("SELECT * FROM suggestions ORDER BY created_at")
            .fetch_all(&self.pool)
            .await?;
        rows.iter()
            .map(|r| {
                Ok(Suggestion {
                    id: r.try_get("id")?,
                    about: r.try_get("about")?,
                    title: r.try_get("title")?,
                    details: r.try_get("details")?,
                    link: r.try_get("link")?,
                    contact: r.try_get("contact")?,
                    created_at: r.try_get("created_at")?,
                })
            })
            .collect()
    }

    async fn add_contact(&self, m: ContactMessage) -> RepoResult<()> {
        sqlx::query(
            "INSERT INTO contact_messages (id, name, email, college, message, created_at) VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO NOTHING",
        )
        .bind(m.id)
        .bind(&m.name)
        .bind(&m.email)
        .bind(&m.college)
        .bind(&m.message)
        .bind(m.created_at)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn contacts(&self) -> RepoResult<Vec<ContactMessage>> {
        let rows = sqlx::query("SELECT * FROM contact_messages ORDER BY created_at")
            .fetch_all(&self.pool)
            .await?;
        rows.iter()
            .map(|r| {
                Ok(ContactMessage {
                    id: r.try_get("id")?,
                    name: r.try_get("name")?,
                    email: r.try_get("email")?,
                    college: r.try_get("college")?,
                    message: r.try_get("message")?,
                    created_at: r.try_get("created_at")?,
                })
            })
            .collect()
    }
}

// ---------------------------------------------------------------- seeding and imports

impl PgStore {
    /// Replace all site content with what's in the seed files. Safe to run again and
    /// again; form submissions are never touched.
    pub async fn load_seed(&self, seed: &SeedStore) -> anyhow::Result<()> {
        let mut tx = self.pool.begin().await?;
        for table in [
            "verdicts",
            "weekly_issues",
            "posts",
            "categories",
            "dive_tools",
            "dives",
            "tracks",
            "start_list_tools",
            "start_lists",
            "tool_tags",
            "tools",
            "past_projects",
        ] {
            // Table names come from the fixed list above, never from input.
            sqlx::query(sqlx::AssertSqlSafe(format!("DELETE FROM {table}")))
                .execute(&mut *tx)
                .await?;
        }
        insert_tools(&mut tx, seed).await?;
        insert_tracks(&mut tx, seed).await?;
        insert_weekly(&mut tx, seed).await?;
        insert_blog(&mut tx, seed).await?;
        insert_challenge(&mut tx, seed).await?;
        tx.commit().await?;
        Ok(())
    }

    /// Copy submissions from another store (the JSON files) into Postgres, keeping
    /// waitlist positions. Rows already present are skipped, so it can be re-run.
    pub async fn import_submissions(
        &self,
        from: &dyn SubmissionRepo,
        challenge: &str,
    ) -> anyhow::Result<[usize; 4]> {
        let mut counts = [0usize; 4];
        for e in from.waitlist(challenge).await? {
            let res = sqlx::query(
                "INSERT INTO waitlist_signups (id, challenge_slug, position, name, phone, email, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING",
            )
            .bind(e.id)
            .bind(&e.challenge)
            .bind(e.position)
            .bind(&e.name)
            .bind(&e.phone)
            .bind(&e.email)
            .bind(e.created_at)
            .execute(&self.pool)
            .await?;
            counts[0] += res.rows_affected() as usize;
        }
        for s in from.subscribers().await? {
            counts[1] += usize::from(self.subscribe(s).await?);
        }
        for s in from.suggestions().await? {
            self.add_suggestion(s).await?;
            counts[2] += 1;
        }
        for m in from.contacts().await? {
            self.add_contact(m).await?;
            counts[3] += 1;
        }
        Ok(counts)
    }
}

async fn insert_tools(tx: &mut Transaction<'_, Postgres>, seed: &SeedStore) -> anyhow::Result<()> {
    for t in seed.tools_ref() {
        sqlx::query(
            "INSERT INTO tools (slug, name, kind, grp, short, plain, use_when, skip_when, runs_on, cost, get_it, status, note, position)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",
        )
        .bind(&t.slug)
        .bind(&t.name)
        .bind(to_text(&t.kind))
        .bind(to_text(&t.group))
        .bind(&t.short)
        .bind(&t.plain)
        .bind(&t.use_when)
        .bind(&t.skip_when)
        .bind(&t.runs_on)
        .bind(&t.cost)
        .bind(&t.get_it)
        .bind(to_text(&t.status))
        .bind(&t.note)
        .bind(t.position)
        .execute(&mut **tx)
        .await?;
        for (i, tag) in t.tags.iter().enumerate() {
            sqlx::query("INSERT INTO tool_tags (tool_slug, tag, position) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING")
                .bind(&t.slug)
                .bind(tag)
                .bind(i as i32)
                .execute(&mut **tx)
                .await?;
        }
    }
    for (i, l) in seed.start_lists_ref().iter().enumerate() {
        sqlx::query("INSERT INTO start_lists (slug, label, position) VALUES ($1, $2, $3)")
            .bind(&l.slug)
            .bind(&l.label)
            .bind(i as i32)
            .execute(&mut **tx)
            .await?;
        for (j, tool) in l.tools.iter().enumerate() {
            sqlx::query(
                "INSERT INTO start_list_tools (list_slug, tool_slug, position) VALUES ($1, $2, $3)",
            )
            .bind(&l.slug)
            .bind(tool)
            .bind(j as i32)
            .execute(&mut **tx)
            .await?;
        }
    }
    Ok(())
}

async fn insert_tracks(tx: &mut Transaction<'_, Postgres>, seed: &SeedStore) -> anyhow::Result<()> {
    for t in seed.tracks_ref() {
        sqlx::query("INSERT INTO tracks (slug, name, who, tone, blurb, start_if, duration, position, stages, overview) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)")
            .bind(&t.slug)
            .bind(&t.name)
            .bind(&t.who)
            .bind(to_text(&t.tone))
            .bind(&t.blurb)
            .bind(&t.start_if)
            .bind(&t.duration)
            .bind(t.position)
            .bind(Json(&t.stages))
            .bind(t.overview.as_ref().map(Json))
            .execute(&mut **tx)
            .await?;
    }
    for d in seed.dives_ref() {
        sqlx::query(
            "INSERT INTO dives (slug, track_slug, position, title, tldr, read_minutes, body, try_it, interview, published, stage)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
        )
        .bind(&d.slug)
        .bind(&d.track)
        .bind(d.position)
        .bind(&d.title)
        .bind(&d.tldr)
        .bind(d.read_minutes)
        .bind(Json(&d.body))
        .bind(d.try_it.as_ref().map(Json))
        .bind(d.interview.as_ref().map(Json))
        .bind(d.published)
        .bind(&d.stage)
        .execute(&mut **tx)
        .await?;
        for (i, tool) in d.tools.iter().enumerate() {
            sqlx::query(
                "INSERT INTO dive_tools (dive_slug, tool_slug, position) VALUES ($1, $2, $3)",
            )
            .bind(&d.slug)
            .bind(tool)
            .bind(i as i32)
            .execute(&mut **tx)
            .await?;
        }
    }
    Ok(())
}

async fn insert_weekly(tx: &mut Transaction<'_, Postgres>, seed: &SeedStore) -> anyhow::Result<()> {
    for i in seed.issues_ref() {
        sqlx::query("INSERT INTO weekly_issues (number, week_of, published) VALUES ($1, $2, $3)")
            .bind(i.number)
            .bind(date(&i.week_of)?)
            .bind(i.published)
            .execute(&mut **tx)
            .await?;
        for v in &i.verdicts {
            sqlx::query(
                "INSERT INTO verdicts (issue_number, position, name, kind, summary, why, best_for_label, best_for, verdict, qualifier, tool_slug)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
            )
            .bind(i.number)
            .bind(v.position)
            .bind(&v.name)
            .bind(to_text(&v.kind))
            .bind(&v.summary)
            .bind(&v.why)
            .bind(&v.best_for_label)
            .bind(&v.best_for)
            .bind(to_text(&v.verdict))
            .bind(&v.qualifier)
            .bind(&v.tool)
            .execute(&mut **tx)
            .await?;
        }
    }
    Ok(())
}

async fn insert_blog(tx: &mut Transaction<'_, Postgres>, seed: &SeedStore) -> anyhow::Result<()> {
    for c in seed.categories_ref() {
        sqlx::query(
            "INSERT INTO categories (slug, label, bg, fg, position) VALUES ($1,$2,$3,$4,$5)",
        )
        .bind(&c.slug)
        .bind(&c.label)
        .bind(&c.bg)
        .bind(&c.fg)
        .bind(c.position)
        .execute(&mut **tx)
        .await?;
    }
    for p in seed.posts_ref() {
        sqlx::query(
            "INSERT INTO posts (slug, category_slug, title, excerpt, cover, featured, dive_slug, body, published_on)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        )
        .bind(&p.slug)
        .bind(&p.category)
        .bind(&p.title)
        .bind(&p.excerpt)
        .bind(Json(&p.cover))
        .bind(p.featured.as_ref().map(Json))
        .bind(&p.dive)
        .bind(Json(&p.body))
        .bind(date(&p.published_on)?)
        .execute(&mut **tx)
        .await?;
    }
    Ok(())
}

async fn insert_challenge(
    tx: &mut Transaction<'_, Postgres>,
    seed: &SeedStore,
) -> anyhow::Result<()> {
    let c = seed.challenge_ref();
    // Challenges are upserted, never deleted: waitlist signups point at them.
    sqlx::query("UPDATE challenges SET is_current = FALSE WHERE slug <> $1")
        .bind(&c.slug)
        .execute(&mut **tx)
        .await?;
    sqlx::query(
        "INSERT INTO challenges (slug, status, goal, title, blurb, facts, date_text, time_text, meet_link, is_current)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE)
         ON CONFLICT (slug) DO UPDATE SET status = EXCLUDED.status, goal = EXCLUDED.goal, title = EXCLUDED.title,
           blurb = EXCLUDED.blurb, facts = EXCLUDED.facts, date_text = EXCLUDED.date_text,
           time_text = EXCLUDED.time_text, meet_link = EXCLUDED.meet_link, is_current = TRUE",
    )
    .bind(&c.slug)
    .bind(&c.status)
    .bind(c.goal)
    .bind(&c.title)
    .bind(&c.blurb)
    .bind(Json(&c.facts))
    .bind(&c.date)
    .bind(&c.time)
    .bind(&c.meet_link)
    .execute(&mut **tx)
    .await?;
    for p in seed.projects_ref() {
        sqlx::query(
            "INSERT INTO past_projects (slug, name, eyebrow, category, title, description, tags, cover, position)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        )
        .bind(&p.slug)
        .bind(&p.name)
        .bind(&p.eyebrow)
        .bind(&p.category)
        .bind(&p.title)
        .bind(&p.description)
        .bind(&p.tags)
        .bind(Json(&p.cover))
        .bind(p.position)
        .execute(&mut **tx)
        .await?;
    }
    Ok(())
}
