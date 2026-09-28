use crate::{
    error::{ApiError, ApiResult},
    models::{
        api::{
            ChallengeResponse, DiveDetail, DiveRef, DiveSummary, IssueDetail, IssueSummary,
            PostDetail, PostRef, PostSummary, PostsResponse, Tally, ToolRef, ToolWithDives,
            ToolsResponse, TrackDetail, TrackOutline, TrackSummary,
        },
        seed::{Block, Category, Dive, Post, Track, WeeklyIssue},
    },
    state::AppState,
};

const WORDS_PER_MINUTE: usize = 200;

fn words(s: &str) -> usize {
    s.split_whitespace().count()
}

/// Reading time: the hand-set value if there is one, otherwise worked out from the text.
pub fn read_minutes(d: &Dive) -> i32 {
    if let Some(m) = d.read_minutes {
        return m;
    }
    let mut n: usize = d.tldr.iter().map(|s| words(s)).sum();
    n += blocks_words(&d.body);
    if let Some(t) = &d.try_it {
        n += words(&t.text) + t.code.as_ref().map_or(0, |c| words(&c.code));
    }
    if let Some(i) = &d.interview {
        n += words(&i.question) + words(&i.answer);
    }
    n.div_ceil(WORDS_PER_MINUTE).max(1) as i32
}

fn blocks_words(blocks: &[Block]) -> usize {
    blocks
        .iter()
        .map(|b| match b {
            Block::Paragraph { text } | Block::Heading { text, .. } => words(text),
            // Looking at a picture takes a few seconds; links and videos aren't reading.
            Block::Image { .. } => 20,
            Block::Video { .. } | Block::Links { .. } => 0,
            Block::List { items, .. } | Block::Flow { items } => {
                items.iter().map(|x| words(x)).sum()
            }
            Block::Callout { label, text } => words(label) + words(text),
            Block::Compare { left, right } => [left, right]
                .iter()
                .map(|s| {
                    words(&s.title)
                        + s.steps.iter().map(|x| words(x)).sum::<usize>()
                        + words(&s.result)
                })
                .sum(),
            Block::Cards { items } => items.iter().map(|c| words(&c.title) + words(&c.text)).sum(),
            Block::Code(c) => words(&c.code),
        })
        .sum()
}

fn dive_ref(d: &Dive, tracks: &[Track]) -> DiveRef {
    let track_name = tracks
        .iter()
        .find(|t| t.slug == d.track)
        .map(|t| t.name.clone())
        .unwrap_or_default();
    DiveRef {
        slug: d.slug.clone(),
        title: d.title.clone(),
        position: d.position,
        track_slug: d.track.clone(),
        track_name,
    }
}

// ---------- Tools ----------

pub async fn tools(state: &AppState) -> ApiResult<ToolsResponse> {
    let tools = state.repos.tools.tools().await?;
    let tracks = state.repos.tracks.tracks().await?;
    let dives = state.repos.tracks.dives().await?;
    let tools = tools
        .into_iter()
        .map(|tool| {
            let dives = dives
                .iter()
                .filter(|d| d.tools.contains(&tool.slug))
                .map(|d| dive_ref(d, &tracks))
                .collect();
            ToolWithDives { tool, dives }
        })
        .collect();
    Ok(ToolsResponse {
        tools,
        start_lists: state.repos.tools.start_lists().await?,
    })
}

pub async fn tool(state: &AppState, slug: &str) -> ApiResult<ToolWithDives> {
    tools(state)
        .await?
        .tools
        .into_iter()
        .find(|t| t.tool.slug == slug)
        .ok_or(ApiError::NotFound)
}

// ---------- Tracks and deep dives ----------

pub async fn tracks(state: &AppState) -> ApiResult<Vec<TrackSummary>> {
    let dives = state.repos.tracks.dives().await?;
    Ok(state
        .repos
        .tracks
        .tracks()
        .await?
        .into_iter()
        .map(|track| {
            let mine: Vec<&Dive> = dives.iter().filter(|d| d.track == track.slug).collect();
            TrackSummary {
                dive_count: mine.len() as i32,
                first_dive: mine.first().map(|d| d.slug.clone()),
                stage_count: track.stages.len() as i32,
                resource_count: track.stages.iter().map(|s| s.resources.len() as i32).sum(),
                track,
            }
        })
        .collect())
}

pub async fn track(state: &AppState, slug: &str) -> ApiResult<TrackDetail> {
    let track = state
        .repos
        .tracks
        .tracks()
        .await?
        .into_iter()
        .find(|t| t.slug == slug)
        .ok_or(ApiError::NotFound)?;
    let dives = state
        .repos
        .tracks
        .dives()
        .await?
        .into_iter()
        .filter(|d| d.track == track.slug)
        .map(|d| DiveSummary {
            read_minutes: read_minutes(&d),
            has_body: !d.body.is_empty(),
            tldr: d.tldr.first().cloned().unwrap_or_default(),
            stage: d.stage,
            slug: d.slug,
            position: d.position,
            title: d.title,
        })
        .collect();
    Ok(TrackDetail { track, dives })
}

pub async fn dive(state: &AppState, slug: &str) -> ApiResult<DiveDetail> {
    let tracks = state.repos.tracks.tracks().await?;
    let all = state.repos.tracks.dives().await?;
    let dive = all
        .iter()
        .find(|d| d.slug == slug)
        .ok_or(ApiError::NotFound)?;
    let track = tracks
        .iter()
        .find(|t| t.slug == dive.track)
        .ok_or(ApiError::NotFound)?;
    let siblings: Vec<&Dive> = all.iter().filter(|d| d.track == dive.track).collect();
    let idx = siblings
        .iter()
        .position(|d| d.slug == dive.slug)
        .unwrap_or(0);

    let tool_list = state.repos.tools.tools().await?;
    let tools = dive
        .tools
        .iter()
        .filter_map(|s| tool_list.iter().find(|t| &t.slug == s))
        .map(|t| ToolRef {
            slug: t.slug.clone(),
            name: t.name.clone(),
            kind: t.kind,
        })
        .collect();

    let blog_post = state
        .repos
        .blog
        .posts()
        .await?
        .into_iter()
        .find(|p| p.dive.as_deref() == Some(dive.slug.as_str()))
        .map(|p| PostRef {
            slug: p.slug,
            title: p.title,
        });

    Ok(DiveDetail {
        slug: dive.slug.clone(),
        title: dive.title.clone(),
        position: dive.position,
        tldr: dive.tldr.clone(),
        read_minutes: read_minutes(dive),
        body: dive.body.clone(),
        try_it: dive.try_it.clone(),
        interview: dive.interview.clone(),
        tools,
        track: {
            let stage = track.stages.iter().find(|s| s.slug == dive.stage);
            TrackOutline {
                slug: track.slug.clone(),
                name: track.name.clone(),
                tone: track.tone,
                stage_slug: dive.stage.clone(),
                stage_title: stage.map(|s| s.title.clone()).unwrap_or_default(),
                stage_position: stage.map_or(0, |s| s.position),
                dives: siblings
                    .iter()
                    .filter(|d| d.stage == dive.stage)
                    .map(|d| dive_ref(d, &tracks))
                    .collect(),
            }
        },
        prev: idx.checked_sub(1).map(|i| dive_ref(siblings[i], &tracks)),
        next: siblings.get(idx + 1).map(|d| dive_ref(d, &tracks)),
        blog_post,
    })
}

// ---------- Weekly ----------

fn tally(issue: &WeeklyIssue) -> Tally {
    let mut t = Tally::default();
    for v in &issue.verdicts {
        t.add(v.verdict);
    }
    t
}

pub async fn issues(state: &AppState) -> ApiResult<Vec<IssueSummary>> {
    Ok(state
        .repos
        .weekly
        .issues()
        .await?
        .iter()
        .map(|i| IssueSummary {
            number: i.number,
            week_of: i.week_of.clone(),
            tally: tally(i),
            names: i.verdicts.iter().map(|v| v.name.clone()).collect(),
        })
        .collect())
}

/// `number = None` means the latest issue.
pub async fn issue(state: &AppState, number: Option<i32>) -> ApiResult<IssueDetail> {
    let all = state.repos.weekly.issues().await?; // newest first
    let idx = match number {
        None if !all.is_empty() => 0,
        None => return Err(ApiError::NotFound),
        Some(n) => all
            .iter()
            .position(|i| i.number == n)
            .ok_or(ApiError::NotFound)?,
    };
    let issue = all[idx].clone();
    Ok(IssueDetail {
        tally: tally(&issue),
        next: idx.checked_sub(1).map(|i| all[i].number),
        prev: all.get(idx + 1).map(|i| i.number),
        issue,
    })
}

// ---------- Blog ----------

fn post_summary(p: &Post, cats: &[Category], dives: &[Dive], tracks: &[Track]) -> PostSummary {
    PostSummary {
        slug: p.slug.clone(),
        title: p.title.clone(),
        excerpt: p.excerpt.clone(),
        cover: p.cover.clone(),
        featured: p.featured.clone(),
        category: cats
            .iter()
            .find(|c| c.slug == p.category)
            .cloned()
            .unwrap_or_else(|| Category {
                slug: p.category.clone(),
                label: p.category.clone(),
                bg: "#F3ECE1".into(),
                fg: "#3E352E".into(),
                position: 0,
            }),
        published_on: p.published_on.clone(),
        has_body: !p.body.is_empty() || p.dive.is_some(),
        dive: p
            .dive
            .as_ref()
            .and_then(|s| dives.iter().find(|d| &d.slug == s))
            .map(|d| dive_ref(d, tracks)),
    }
}

pub async fn posts(state: &AppState, category: Option<&str>) -> ApiResult<PostsResponse> {
    let categories = state.repos.blog.categories().await?;
    if let Some(c) = category
        && !categories.iter().any(|x| x.slug == c)
    {
        return Err(ApiError::NotFound);
    }
    let dives = state.repos.tracks.dives().await?;
    let tracks = state.repos.tracks.tracks().await?;
    let posts = state
        .repos
        .blog
        .posts()
        .await?
        .iter()
        .filter(|p| category.is_none_or(|c| p.category == c))
        .map(|p| post_summary(p, &categories, &dives, &tracks))
        .collect();
    Ok(PostsResponse { categories, posts })
}

pub async fn post(state: &AppState, slug: &str) -> ApiResult<PostDetail> {
    let categories = state.repos.blog.categories().await?;
    let dives = state.repos.tracks.dives().await?;
    let tracks = state.repos.tracks.tracks().await?;
    let all = state.repos.blog.posts().await?;
    let post = all
        .iter()
        .find(|p| p.slug == slug)
        .ok_or(ApiError::NotFound)?;
    let related = all
        .iter()
        .filter(|p| p.slug != post.slug && p.category == post.category)
        .chain(
            all.iter()
                .filter(|p| p.slug != post.slug && p.category != post.category),
        )
        .take(3)
        .map(|p| post_summary(p, &categories, &dives, &tracks))
        .collect();
    Ok(PostDetail {
        summary: post_summary(post, &categories, &dives, &tracks),
        body: post.body.clone(),
        related,
    })
}

// ---------- Challenge ----------

pub async fn challenge(state: &AppState) -> ApiResult<ChallengeResponse> {
    Ok(ChallengeResponse {
        challenge: state.repos.challenge.current().await?,
        joined: state.waitlist_count().await?,
        projects: state.repos.challenge.projects().await?,
    })
}
