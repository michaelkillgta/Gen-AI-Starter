//! Storage interfaces, one per content area.
//!
//! Today everything is served by [`memory::SeedStore`], which loads `api/seed/*.json`
//! at start-up. Phase 8 adds Postgres implementations of the same traits; handlers
//! and services never know which one they are talking to.

pub mod files;
pub mod memory;

use async_trait::async_trait;

use crate::models::{
    forms::{ContactMessage, Subscriber, Suggestion, WaitlistEntry},
    seed::{Category, Challenge, Dive, Post, Project, StartList, Tool, Track, WeeklyIssue},
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

/// Result of joining the waitlist.
#[derive(Debug, Clone, Copy)]
pub struct AddOutcome {
    pub position: i32,
    /// The phone or email was already on the list; `position` is their original place.
    pub duplicate: bool,
}

/// Form submissions. Today: JSON files in `api/data/`. Phase 8: Postgres tables.
#[async_trait]
pub trait SubmissionRepo: Send + Sync {
    async fn join_waitlist(&self, entry: WaitlistEntry) -> RepoResult<AddOutcome>;
    async fn waitlist_count(&self, challenge: &str) -> RepoResult<i32>;
    async fn waitlist(&self, challenge: &str) -> RepoResult<Vec<WaitlistEntry>>;
    /// Returns false when this contact was already subscribed.
    async fn subscribe(&self, sub: Subscriber) -> RepoResult<bool>;
    async fn subscribers(&self) -> RepoResult<Vec<Subscriber>>;
    async fn add_suggestion(&self, s: Suggestion) -> RepoResult<()>;
    async fn suggestions(&self) -> RepoResult<Vec<Suggestion>>;
    async fn add_contact(&self, m: ContactMessage) -> RepoResult<()>;
    async fn contacts(&self) -> RepoResult<Vec<ContactMessage>>;
}
