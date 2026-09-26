//! In-memory content store loaded from `api/seed/*.json`.

use std::{collections::HashSet, path::Path};

use anyhow::{Context, bail};
use async_trait::async_trait;
use serde::de::DeserializeOwned;

use super::{BlogRepo, ChallengeRepo, RepoResult, ToolRepo, TrackRepo, WeeklyRepo};
use crate::models::seed::{
    Category, Challenge, Dive, Post, Project, StartList, Tool, Track, WeeklyIssue,
};

#[derive(Debug)]
pub struct SeedStore {
    tools: Vec<Tool>,
    start_lists: Vec<StartList>,
    tracks: Vec<Track>,
    dives: Vec<Dive>,
    issues: Vec<WeeklyIssue>,
    categories: Vec<Category>,
    posts: Vec<Post>,
    challenge: Challenge,
    projects: Vec<Project>,
}

fn read<T: DeserializeOwned>(dir: &Path, file: &str) -> anyhow::Result<T> {
    let path = dir.join(file);
    let text =
        std::fs::read_to_string(&path).with_context(|| format!("reading {}", path.display()))?;
    serde_json::from_str(&text).with_context(|| format!("parsing {}", path.display()))
}

impl SeedStore {
    /// Load every seed file and check that all cross-references point at something real.
    pub fn load(dir: &Path) -> anyhow::Result<Self> {
        let mut tools: Vec<Tool> = read(dir, "tools.json")?;
        let mut tracks: Vec<Track> = read(dir, "tracks.json")?;
        let mut dives: Vec<Dive> = read(dir, "dives.json")?;
        let mut issues: Vec<WeeklyIssue> = read(dir, "weekly.json")?;
        let mut categories: Vec<Category> = read(dir, "categories.json")?;
        let mut posts: Vec<Post> = read(dir, "posts.json")?;
        let mut projects: Vec<Project> = read(dir, "projects.json")?;

        tools.sort_by_key(|t| t.position);
        tracks.sort_by_key(|t| t.position);
        let track_pos = |slug: &str| tracks.iter().position(|t| t.slug == slug);
        dives.retain(|d| d.published);
        dives.sort_by_key(|d| (track_pos(&d.track), d.position));
        issues.retain(|i| i.published);
        issues.sort_by_key(|i| std::cmp::Reverse(i.number));
        for issue in &mut issues {
            issue.verdicts.sort_by_key(|v| v.position);
        }
        categories.sort_by_key(|c| c.position);
        posts.sort_by(|a, b| b.published_on.cmp(&a.published_on));
        projects.sort_by_key(|p| p.position);

        let store = Self {
            start_lists: read(dir, "start_lists.json")?,
            challenge: read(dir, "challenge.json")?,
            tools,
            tracks,
            dives,
            issues,
            categories,
            posts,
            projects,
        };
        store.validate()?;
        Ok(store)
    }

    fn validate(&self) -> anyhow::Result<()> {
        fn unique<'a>(
            what: &str,
            slugs: impl Iterator<Item = &'a str>,
        ) -> anyhow::Result<HashSet<&'a str>> {
            let mut seen = HashSet::new();
            for s in slugs {
                if !seen.insert(s) {
                    bail!("duplicate {what} slug: {s}");
                }
            }
            Ok(seen)
        }
        let tools = unique("tool", self.tools.iter().map(|t| t.slug.as_str()))?;
        let tracks = unique("track", self.tracks.iter().map(|t| t.slug.as_str()))?;
        let dives = unique("dive", self.dives.iter().map(|d| d.slug.as_str()))?;
        let cats = unique("category", self.categories.iter().map(|c| c.slug.as_str()))?;
        unique("post", self.posts.iter().map(|p| p.slug.as_str()))?;
        unique("project", self.projects.iter().map(|p| p.slug.as_str()))?;

        let need = |ok: bool, msg: String| {
            if ok {
                Ok(())
            } else {
                Err(anyhow::anyhow!(msg))
            }
        };
        for l in &self.start_lists {
            for t in &l.tools {
                need(
                    tools.contains(t.as_str()),
                    format!("start list {} → unknown tool {t}", l.slug),
                )?;
            }
        }
        for d in &self.dives {
            need(
                tracks.contains(d.track.as_str()),
                format!("dive {} → unknown track {}", d.slug, d.track),
            )?;
            for t in &d.tools {
                need(
                    tools.contains(t.as_str()),
                    format!("dive {} → unknown tool {t}", d.slug),
                )?;
            }
        }
        for i in &self.issues {
            for v in &i.verdicts {
                if let Some(t) = &v.tool {
                    need(
                        tools.contains(t.as_str()),
                        format!("issue {} → unknown tool {t}", i.number),
                    )?;
                }
            }
        }
        for p in &self.posts {
            need(
                cats.contains(p.category.as_str()),
                format!("post {} → unknown category {}", p.slug, p.category),
            )?;
            if let Some(d) = &p.dive {
                need(
                    dives.contains(d.as_str()),
                    format!("post {} → unknown dive {d}", p.slug),
                )?;
            }
        }
        Ok(())
    }
}

/// Read-only views used when copying the seed into Postgres.
impl SeedStore {
    pub fn tools_ref(&self) -> &[Tool] {
        &self.tools
    }
    pub fn start_lists_ref(&self) -> &[StartList] {
        &self.start_lists
    }
    pub fn tracks_ref(&self) -> &[Track] {
        &self.tracks
    }
    pub fn dives_ref(&self) -> &[Dive] {
        &self.dives
    }
    pub fn issues_ref(&self) -> &[WeeklyIssue] {
        &self.issues
    }
    pub fn categories_ref(&self) -> &[Category] {
        &self.categories
    }
    pub fn posts_ref(&self) -> &[Post] {
        &self.posts
    }
    pub fn challenge_ref(&self) -> &Challenge {
        &self.challenge
    }
    pub fn projects_ref(&self) -> &[Project] {
        &self.projects
    }
}

#[async_trait]
impl ToolRepo for SeedStore {
    async fn tools(&self) -> RepoResult<Vec<Tool>> {
        Ok(self.tools.clone())
    }
    async fn start_lists(&self) -> RepoResult<Vec<StartList>> {
        Ok(self.start_lists.clone())
    }
}

#[async_trait]
impl TrackRepo for SeedStore {
    async fn tracks(&self) -> RepoResult<Vec<Track>> {
        Ok(self.tracks.clone())
    }
    async fn dives(&self) -> RepoResult<Vec<Dive>> {
        Ok(self.dives.clone())
    }
}

#[async_trait]
impl WeeklyRepo for SeedStore {
    async fn issues(&self) -> RepoResult<Vec<WeeklyIssue>> {
        Ok(self.issues.clone())
    }
}

#[async_trait]
impl BlogRepo for SeedStore {
    async fn categories(&self) -> RepoResult<Vec<Category>> {
        Ok(self.categories.clone())
    }
    async fn posts(&self) -> RepoResult<Vec<Post>> {
        Ok(self.posts.clone())
    }
}

#[async_trait]
impl ChallengeRepo for SeedStore {
    async fn current(&self) -> RepoResult<Challenge> {
        Ok(self.challenge.clone())
    }
    async fn projects(&self) -> RepoResult<Vec<Project>> {
        Ok(self.projects.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn repo_seed_files_load_and_link_up() {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("seed");
        let store = SeedStore::load(&dir).expect("seed should load");
        assert_eq!(store.tools.len(), 28);
        assert_eq!(store.tracks.len(), 3);
        assert_eq!(store.dives.len(), 21);
        assert_eq!(store.issues[0].verdicts.len(), 5);
        assert_eq!(store.projects.len(), 4);
    }
}
