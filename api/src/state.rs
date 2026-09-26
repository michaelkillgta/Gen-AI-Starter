use std::{sync::Arc, time::Duration};

use sqlx::postgres::PgPoolOptions;

use crate::{
    config::{Config, Storage},
    repo::{
        BlogRepo, ChallengeRepo, SubmissionRepo, ToolRepo, TrackRepo, WeeklyRepo,
        files::FileSubmissions, memory::SeedStore, postgres::PgStore,
    },
    services::ratelimit::RateLimiter,
};

/// One handle per content area. Which store backs them is decided in `AppState::build`.
#[derive(Clone)]
pub struct Repos {
    pub tools: Arc<dyn ToolRepo>,
    pub tracks: Arc<dyn TrackRepo>,
    pub weekly: Arc<dyn WeeklyRepo>,
    pub blog: Arc<dyn BlogRepo>,
    pub challenge: Arc<dyn ChallengeRepo>,
}

impl Repos {
    fn from<S>(store: Arc<S>) -> Self
    where
        S: ToolRepo + TrackRepo + WeeklyRepo + BlogRepo + ChallengeRepo + 'static,
    {
        Self {
            tools: store.clone(),
            tracks: store.clone(),
            weekly: store.clone(),
            blog: store.clone(),
            challenge: store,
        }
    }
}

#[derive(Clone)]
pub struct AppState {
    pub repos: Repos,
    pub submissions: Arc<dyn SubmissionRepo>,
    pub limiter: Arc<RateLimiter>,
    pub config: Config,
    /// Set in postgres mode (first-run seeding, tests).
    pub pg: Option<Arc<PgStore>>,
}

/// Connect to Postgres, retrying for up to 30 seconds so the API can start
/// alongside the database (`pnpm dev`, docker compose).
pub async fn connect(url: &str) -> anyhow::Result<sqlx::PgPool> {
    let mut last = None;
    for attempt in 0..30 {
        let pool = PgPoolOptions::new()
            .max_connections(10)
            .acquire_timeout(Duration::from_secs(5))
            .connect(url)
            .await;
        match pool {
            Ok(pool) => return Ok(pool),
            Err(e) => {
                if attempt == 0 {
                    tracing::info!("waiting for the database…");
                }
                last = Some(e);
                tokio::time::sleep(Duration::from_secs(1)).await;
            }
        }
    }
    Err(last.map_or_else(
        || anyhow::anyhow!("could not connect to the database"),
        Into::into,
    ))
}

impl AppState {
    /// Build the app for the configured storage. In postgres mode, migrations run first.
    pub async fn build(config: Config) -> anyhow::Result<Self> {
        match config.storage {
            Storage::Files => {
                let seed = Arc::new(SeedStore::load(&config.seed_dir)?);
                let files = Arc::new(FileSubmissions::open(&config.data_dir)?);
                Ok(Self::assemble(Repos::from(seed), files, None, config))
            }
            Storage::Postgres => {
                let pool = connect(config.database_url.as_deref().unwrap_or_default()).await?;
                Self::with_pool(pool, config).await
            }
        }
    }

    pub async fn with_pool(pool: sqlx::PgPool, config: Config) -> anyhow::Result<Self> {
        let pg = Arc::new(PgStore::new(pool));
        pg.migrate().await?;
        Ok(Self::assemble(
            Repos::from(pg.clone()),
            pg.clone(),
            Some(pg),
            config,
        ))
    }

    fn assemble(
        repos: Repos,
        submissions: Arc<dyn SubmissionRepo>,
        pg: Option<Arc<PgStore>>,
        config: Config,
    ) -> Self {
        Self {
            repos,
            submissions,
            limiter: Arc::new(RateLimiter::new(
                config.form_posts_per_minute,
                Duration::from_secs(60),
            )),
            config,
            pg,
        }
    }

    /// People on the current challenge's waitlist.
    pub async fn waitlist_count(&self) -> anyhow::Result<i32> {
        let challenge = self.repos.challenge.current().await?;
        self.submissions.waitlist_count(&challenge.slug).await
    }
}
