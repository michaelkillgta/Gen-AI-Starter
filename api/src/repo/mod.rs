//! Storage interfaces, one per content area.
//!
//! Today everything is served by [`memory::SeedStore`], which loads `api/seed/*.json`
//! at start-up. Phase 8 adds Postgres implementations of the same traits; handlers
//! and services never know which one they are talking to.

pub mod memory;

use async_trait::async_trait;

use crate::models::seed::{
    Category, Challenge, Dive, Post, Project, StartList, Tool, Track, WeeklyIssue,
};

pub type RepoResult<T> = anyhow::Result<T>;

#[async_trait]
pub trait ToolRepo: Send + Sync {
    /// All tools, in display order.
    async fn tools(&self) -> RepoResult<Vec<Tool>>;
    async fn start_lists(&self) -> RepoResult<Vec<StartList>>;
}

#[async_trait]
pub trait TrackRepo: Send + Sync {
    /// All tracks, in display order.
    async fn tracks(&self) -> RepoResult<Vec<Track>>;
    /// All published deep dives, ordered by track then position.
    async fn dives(&self) -> RepoResult<Vec<Dive>>;
}

#[async_trait]
pub trait WeeklyRepo: Send + Sync {
    /// Published issues, newest first.
    async fn issues(&self) -> RepoResult<Vec<WeeklyIssue>>;
}

#[async_trait]
pub trait BlogRepo: Send + Sync {
    async fn categories(&self) -> RepoResult<Vec<Category>>;
    /// Posts, newest first.
    async fn posts(&self) -> RepoResult<Vec<Post>>;
}

#[async_trait]
pub trait ChallengeRepo: Send + Sync {
    /// The challenge currently shown on /challenge.
    async fn current(&self) -> RepoResult<Challenge>;
    async fn projects(&self) -> RepoResult<Vec<Project>>;
}
