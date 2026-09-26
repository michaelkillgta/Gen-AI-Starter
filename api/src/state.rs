use std::{sync::Arc, time::Duration};

use crate::{
    config::Config,
    repo::{
        BlogRepo, ChallengeRepo, SubmissionRepo, ToolRepo, TrackRepo, WeeklyRepo, files::FileSubmissions,
        memory::SeedStore,
    },
    services::{ratelimit::RateLimiter, turnstile::Turnstile},
};

/// One handle per content area. Swapping storage (phase 8) only changes how these are built.
#[derive(Clone)]
pub struct Repos {
    pub tools: Arc<dyn ToolRepo>,
    pub tracks: Arc<dyn TrackRepo>,
    pub weekly: Arc<dyn WeeklyRepo>,
    pub blog: Arc<dyn BlogRepo>,
    pub challenge: Arc<dyn ChallengeRepo>,
}

impl Repos {
    pub fn from_seed(store: SeedStore) -> Self {
        let store = Arc::new(store);
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
    pub turnstile: Arc<Turnstile>,
    pub config: Config,
}

impl AppState {
    pub fn new(repos: Repos, config: Config) -> anyhow::Result<Self> {
        Ok(Self {
            repos,
            submissions: Arc::new(FileSubmissions::open(&config.data_dir)?),
            limiter: Arc::new(RateLimiter::new(config.form_posts_per_minute, Duration::from_secs(60))),
            turnstile: Arc::new(Turnstile::new(config.turnstile_secret.clone())),
            config,
        })
    }

    /// People on the current challenge's waitlist.
    pub async fn waitlist_count(&self) -> anyhow::Result<i32> {
        let challenge = self.repos.challenge.current().await?;
        self.submissions.waitlist_count(&challenge.slug).await
    }
}
