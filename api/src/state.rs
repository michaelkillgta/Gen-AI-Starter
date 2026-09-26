use std::sync::Arc;

use crate::{
    config::Config,
    repo::{BlogRepo, ChallengeRepo, ToolRepo, TrackRepo, WeeklyRepo, memory::SeedStore},
};

/// One handle per content area. Swapping storage (phase 8) only changes `Repos::from_seed`.
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
    #[allow(dead_code)] // read by the form endpoints in phase 5
    pub config: Config,
}

impl AppState {
    pub fn new(repos: Repos, config: Config) -> Self {
        Self { repos, config }
    }

    /// People on the challenge waitlist. Real count arrives with the forms in phase 5.
    pub async fn waitlist_count(&self) -> anyhow::Result<i32> {
        Ok(0)
    }
}
