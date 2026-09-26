use serde::{Deserialize, Serialize};
use ts_rs::TS;

// ---------- Toolkit ----------

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum ToolKind {
    Tool,
    Library,
    Package,
    Mcp,
}

/// The homepage/toolkit grouping a tool belongs to.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum ToolGroup {
    Foundations,
    Rag,
    Agents,
    Ship,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum ToolStatus {
    Using,
    Notes,
    Tested,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Tool {
    pub slug: String,
    pub name: String,
    pub kind: ToolKind,
    pub group: ToolGroup,
    pub short: String,
    pub plain: String,
    pub use_when: String,
    pub skip_when: String,
    pub runs_on: String,
    pub cost: String,
    pub get_it: String,
    pub status: ToolStatus,
    pub note: Option<String>,
    pub tags: Vec<String>,
    pub position: i32,
}

/// "Start here" persona chips on the homepage → the tools they show.
#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct StartList {
    pub slug: String,
    pub label: String,
    pub tools: Vec<String>,
}

// ---------- Tracks and deep dives ----------

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum Tone {
    Light,
    Dark,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Track {
    pub slug: String,
    pub name: String,
    pub who: String,
    pub tone: Tone,
    pub blurb: String,
    pub start_if: String,
    pub position: i32,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CompareSide {
    pub title: String,
    /// "good" or "bad": colours the box green or red.
    pub tone: String,
    pub steps: Vec<String>,
    pub result: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CardItem {
    pub title: String,
    pub text: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CodeSample {
    pub language: String,
    pub code: String,
}

/// One block of a deep dive or blog post body.
#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(tag = "type", rename_all = "lowercase")]
#[ts(export)]
pub enum Block {
    Paragraph { text: String },
    Heading { text: String },
    Compare { left: CompareSide, right: CompareSide },
    Cards { items: Vec<CardItem> },
    Callout { label: String, text: String },
    Code(CodeSample),
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct TryIt {
    pub time: String,
    pub hardware: String,
    pub cost: String,
    pub text: String,
    pub code: Option<CodeSample>,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Interview {
    pub question: String,
    pub answer: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Dive {
    pub slug: String,
    pub track: String,
    pub position: i32,
    pub title: String,
    pub tldr: Vec<String>,
    /// Set by hand, or worked out from the body length when empty.
    pub read_minutes: Option<i32>,
    pub tools: Vec<String>,
    pub body: Vec<Block>,
    pub try_it: Option<TryIt>,
    pub interview: Option<Interview>,
    pub published: bool,
}

// ---------- Worth It? Weekly ----------

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum VerdictKind {
    Use,
    Wait,
    Skip,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Verdict {
    pub position: i32,
    pub name: String,
    pub kind: ToolKind,
    pub summary: String,
    pub why: String,
    /// "Best for" or "Instead".
    pub best_for_label: String,
    pub best_for: String,
    pub verdict: VerdictKind,
    pub qualifier: Option<String>,
    /// Toolkit slug, when the tool is in the toolkit.
    pub tool: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct WeeklyIssue {
    pub number: i32,
    /// ISO date of the Monday the issue covers.
    pub week_of: String,
    pub published: bool,
    pub verdicts: Vec<Verdict>,
}

// ---------- Blog ----------

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Category {
    pub slug: String,
    pub label: String,
    pub bg: String,
    pub fg: String,
    pub position: i32,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Cover {
    pub text: String,
    pub bg: String,
    pub fg: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Featured {
    pub stat: String,
    pub caption: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Post {
    pub slug: String,
    pub category: String,
    pub title: String,
    pub excerpt: String,
    pub cover: Cover,
    pub featured: Option<Featured>,
    /// The deep dive this post is a copy of, if any.
    pub dive: Option<String>,
    pub body: Vec<Block>,
    pub published_on: String,
}

// ---------- Build challenge ----------

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Fact {
    pub label: String,
    pub value: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Challenge {
    pub slug: String,
    pub status: String,
    pub goal: i32,
    pub title: String,
    pub blurb: String,
    pub facts: Vec<Fact>,
    pub date: String,
    pub time: String,
    pub meet_link: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ProjectCover {
    /// roles | chat | flow | pills: which illustration the card uses.
    pub style: String,
    pub bg: String,
    pub fg: String,
    pub items: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Project {
    pub slug: String,
    pub name: String,
    pub eyebrow: String,
    pub category: String,
    pub title: String,
    pub description: String,
    pub tags: Vec<String>,
    pub cover: ProjectCover,
    pub position: i32,
}
