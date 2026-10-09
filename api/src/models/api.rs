//! Response shapes returned by the endpoints.

use serde::Serialize;
use ts_rs::TS;

use super::seed::{
    Block, Category, Challenge, Interview, Project, StartList, Tone, Tool, ToolKind, Track, TryIt,
    VerdictKind, WeeklyIssue,
};

/// A short pointer to a deep dive, e.g. in a tool's "Learn it in a deep dive" list.
#[derive(Clone, Debug, Serialize, TS)]
#[ts(export)]
pub struct DiveRef {
    pub slug: String,
    pub title: String,
    pub position: i32,
    pub track_slug: String,
    pub track_name: String,
}

#[derive(Clone, Debug, Serialize, TS)]
#[ts(export)]
pub struct ToolRef {
    pub slug: String,
    pub name: String,
    pub kind: ToolKind,
}

#[derive(Clone, Debug, Serialize, TS)]
#[ts(export)]
pub struct ToolWithDives {
    #[serde(flatten)]
    #[ts(flatten)]
    pub tool: Tool,
    pub dives: Vec<DiveRef>,
    /// Blog posts that list this tool in their "Tools used" row, newest first.
    pub posts: Vec<PostRef>,
}

/// GET /tools
#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct ToolsResponse {
    pub tools: Vec<ToolWithDives>,
    pub start_lists: Vec<StartList>,
}

#[derive(Clone, Debug, Serialize, TS)]
#[ts(export)]
pub struct TrackSummary {
    #[serde(flatten)]
    #[ts(flatten)]
    pub track: Track,
    pub dive_count: i32,
    pub first_dive: Option<String>,
    pub stage_count: i32,
    pub resource_count: i32,
}

#[derive(Clone, Debug, Serialize, TS)]
#[ts(export)]
pub struct DiveSummary {
    pub slug: String,
    pub stage: String,
    pub position: i32,
    pub title: String,
    pub tldr: String,
    pub read_minutes: i32,
    /// False while only the TL;DR exists.
    pub has_body: bool,
}

/// GET /tracks/:slug
#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct TrackDetail {
    #[serde(flatten)]
    #[ts(flatten)]
    pub track: Track,
    pub dives: Vec<DiveSummary>,
}

#[derive(Clone, Debug, Serialize, TS)]
#[ts(export)]
pub struct PostRef {
    pub slug: String,
    pub title: String,
}

/// GET /dives/:slug
#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct DiveDetail {
    pub slug: String,
    pub title: String,
    pub position: i32,
    pub tldr: Vec<String>,
    pub read_minutes: i32,
    pub body: Vec<Block>,
    pub try_it: Option<TryIt>,
    pub interview: Option<Interview>,
    pub tools: Vec<ToolRef>,
    pub track: TrackOutline,
    pub prev: Option<DiveRef>,
    pub next: Option<DiveRef>,
    pub blog_post: Option<PostRef>,
}

/// The track sidebar on a deep dive page.
#[derive(Debug, Serialize, TS)]
#[ts(export)]
/// The deep dive sidebar: the track, and the dives in this dive's stage.
pub struct TrackOutline {
    pub slug: String,
    pub name: String,
    pub tone: Tone,
    pub stage_slug: String,
    pub stage_title: String,
    /// e.g. 5 for "Stage 5".
    pub stage_position: i32,
    pub dives: Vec<DiveRef>,
}

#[derive(Clone, Debug, Default, Serialize, TS)]
#[ts(export)]
pub struct Tally {
    #[serde(rename = "use")]
    #[ts(rename = "use")]
    pub use_it: i32,
    pub wait: i32,
    pub skip: i32,
}

impl Tally {
    pub fn add(&mut self, v: VerdictKind) {
        match v {
            VerdictKind::Use => self.use_it += 1,
            VerdictKind::Wait => self.wait += 1,
            VerdictKind::Skip => self.skip += 1,
        }
    }
}

/// GET /weekly/latest and /weekly/:number
#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct IssueDetail {
    #[serde(flatten)]
    #[ts(flatten)]
    pub issue: WeeklyIssue,
    pub tally: Tally,
    pub prev: Option<i32>,
    pub next: Option<i32>,
}

/// One row of the weekly archive (GET /weekly).
#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct IssueSummary {
    pub number: i32,
    pub week_of: String,
    pub tally: Tally,
    pub names: Vec<String>,
}

#[derive(Clone, Debug, Serialize, TS)]
#[ts(export)]
pub struct PostSummary {
    pub slug: String,
    pub title: String,
    pub excerpt: String,
    pub cover: super::seed::Cover,
    pub featured: Option<super::seed::Featured>,
    pub category: Category,
    pub published_on: String,
    pub has_body: bool,
    /// Estimated reading time of the body (at least 1).
    pub read_minutes: i32,
    pub dive: Option<DiveRef>,
}

/// GET /posts?category=
#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct PostsResponse {
    pub categories: Vec<Category>,
    pub posts: Vec<PostSummary>,
}

/// GET /posts/:slug
#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct PostDetail {
    #[serde(flatten)]
    #[ts(flatten)]
    pub summary: PostSummary,
    pub body: Vec<Block>,
    /// "What you'll learn" points (may be empty).
    pub learn: Vec<String>,
    pub related: Vec<PostSummary>,
}

/// GET /challenge
#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct ChallengeResponse {
    pub challenge: Challenge,
    pub joined: i32,
    pub projects: Vec<Project>,
}
