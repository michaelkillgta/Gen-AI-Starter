use std::path::PathBuf;

use anyhow::bail;

/// Where content and form submissions live.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Storage {
    /// PostgreSQL (`DATABASE_URL`).
    Postgres,
    /// Seed JSON files for content, JSON files in `DATA_DIR` for submissions.
    Files,
}

/// Settings read from the environment (see `.env.example` at the repo root).
#[derive(Clone, Debug)]
pub struct Config {
    pub bind_addr: String,
    /// Origins allowed to call the API from a browser (comma separated).
    pub cors_origins: Vec<String>,
    /// `STORAGE=postgres|files`. Defaults to postgres when `DATABASE_URL` is set.
    pub storage: Storage,
    pub database_url: Option<String>,
    /// Folder holding the content JSON files (the seed).
    pub seed_dir: PathBuf,
    /// Folder for form submissions in files mode.
    pub data_dir: PathBuf,
    /// Form posts allowed per visitor per minute.
    pub form_posts_per_minute: usize,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let here = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let var = |k: &str| std::env::var(k).ok().filter(|v| !v.is_empty());
        let database_url = var("DATABASE_URL");
        let storage = match var("STORAGE").as_deref() {
            Some("postgres") => Storage::Postgres,
            Some("files") => Storage::Files,
            Some(other) => bail!("STORAGE must be 'postgres' or 'files', not '{other}'"),
            None if database_url.is_some() => Storage::Postgres,
            None => Storage::Files,
        };
        if storage == Storage::Postgres && database_url.is_none() {
            bail!("STORAGE=postgres needs DATABASE_URL");
        }
        Ok(Self {
            bind_addr: var("API_BIND").unwrap_or_else(|| "127.0.0.1:8080".into()),
            cors_origins: var("CORS_ORIGINS")
                .unwrap_or_else(|| "http://localhost:3000".into())
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect(),
            storage,
            database_url,
            seed_dir: var("SEED_DIR")
                .map(PathBuf::from)
                .unwrap_or_else(|| here.join("seed")),
            data_dir: var("DATA_DIR")
                .map(PathBuf::from)
                .unwrap_or_else(|| here.join("data")),
            form_posts_per_minute: var("FORM_POSTS_PER_MINUTE")
                .and_then(|v| v.parse().ok())
                .unwrap_or(6),
        })
    }
}
