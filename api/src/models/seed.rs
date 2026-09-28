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
    /// e.g. "About 6 months at 8–10 hours a week".
    pub duration: String,
    pub position: i32,
    /// The step-by-step plan, in order.
    pub stages: Vec<Stage>,
    /// Roles, the plan at a glance and how to check yourself. Optional per track.
    #[serde(default)]
    pub overview: Option<TrackOverview>,
}

/// The big picture shown above a track's stages.
#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct TrackOverview {
    /// Jobs this track prepares you for.
    pub roles: Vec<CardItem>,
    /// Stages grouped into phases, in order; every stage is in exactly one phase.
    pub phases: Vec<TrackPhase>,
    /// e.g. "Timings assume about 10 hours a week."
    pub pace_note: String,
    /// How to know you're really learning.
    pub checks: Vec<CardItem>,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct TrackPhase {
    pub title: String,
    /// e.g. "Months 1–2".
    pub when: String,
    pub text: String,
    /// Stage slugs in this phase.
    pub stages: Vec<String>,
}

/// One step of a track: what to learn, the best resources, a project and a checklist.
#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Stage {
    pub slug: String,
    pub position: i32,
    pub title: String,
    /// e.g. "4 weeks".
    pub weeks: String,
    pub why: String,
    pub topics: Vec<String>,
    pub resources: Vec<Resource>,
    pub project: StageProject,
    pub done_when: Vec<String>,
    /// Mistakes students often make at this stage.
    #[serde(default)]
    pub mistakes: Vec<String>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum ResourceKind {
    Course,
    Video,
    Book,
    Docs,
    Paper,
    Practice,
    Community,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "kebab-case")]
#[ts(export)]
pub enum ResourceCost {
    Free,
    /// Free to audit; paid for a certificate.
    FreeAudit,
    /// Has a free plan with limits.
    FreeTier,
    Paid,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Resource {
    pub title: String,
    pub by: String,
    pub url: String,
    pub kind: ResourceKind,
    pub cost: ResourceCost,
    pub note: Option<String>,
    /// Toolkit slug, when the resource is a tool we cover.
    pub tool: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct StageProject {
    pub title: String,
    pub text: String,
    /// How you'll know it works: a concrete, checkable result.
    #[serde(default)]
    pub check: Option<String>,
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

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LinkItem {
    pub label: String,
    /// A path on the site ("/toolkit/docling"), an anchor ("#step-1") or a full URL.
    pub href: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct PairItem {
    /// A small line above the text (optional).
    #[serde(default)]
    pub label: Option<String>,
    pub text: String,
}

/// One block of a deep dive or blog post body.
///
/// Paragraph, list and flow text may contain `[label](href)` links.
#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(tag = "type", rename_all = "lowercase")]
#[ts(export)]
pub enum Block {
    Paragraph {
        text: String,
    },
    Heading {
        text: String,
        /// Anchor for links to this heading (`#id`).
        #[serde(default)]
        id: Option<String>,
    },
    /// A picture from `web/public` (e.g. "/blog/<post>/step-1.webp"); click to enlarge.
    Image {
        src: String,
        alt: String,
        width: u32,
        height: u32,
        #[serde(default)]
        caption: Option<String>,
    },
    /// A YouTube video, embedded privacy-friendly (youtube-nocookie) and lazy-loaded.
    Video {
        youtube_id: String,
        title: String,
        #[serde(default)]
        caption: Option<String>,
    },
    /// A bullet or numbered list.
    List {
        #[serde(default)]
        ordered: bool,
        items: Vec<String>,
    },
    /// Numbered steps with an arrow between each: a row on wide screens, a
    /// vertical line on phones. A leading "3. " in an item becomes its number.
    Flow {
        items: Vec<String>,
    },
    /// A row of links, e.g. jump links to a post's steps.
    Links {
        #[serde(default)]
        label: Option<String>,
        items: Vec<LinkItem>,
    },
    /// Short opening lines set in larger type (a post's hook).
    Lead {
        items: Vec<String>,
    },
    /// One line set big: a pull-quote or pull-question.
    Pull {
        text: String,
    },
    /// Two short statements side by side (stacked on phones), e.g. a contrast.
    Pair {
        items: Vec<PairItem>,
    },
    /// A call-to-action button.
    Cta {
        label: String,
        href: String,
    },
    Compare {
        left: CompareSide,
        right: CompareSide,
    },
    Cards {
        items: Vec<CardItem>,
    },
    Callout {
        label: String,
        text: String,
    },
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
    /// The stage of the track this deep dive belongs to.
    pub stage: String,
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
    /// A picture for the post's top block and its card (e.g. an infographic).
    #[serde(default)]
    pub image: Option<CoverImage>,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CoverImage {
    pub src: String,
    pub alt: String,
    pub width: u32,
    pub height: u32,
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
    /// "What you'll learn": a few short points shown at the top of the post.
    #[serde(default)]
    pub learn: Vec<String>,
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
