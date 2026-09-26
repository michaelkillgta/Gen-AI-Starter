use std::path::PathBuf;

/// Settings read from the environment (see `.env.example` at the repo root).
#[derive(Clone, Debug)]
pub struct Config {
    pub bind_addr: String,
    /// Origins allowed to call the API from a browser (comma separated).
    pub cors_origins: Vec<String>,
    /// Folder holding the content JSON files.
    pub seed_dir: PathBuf,
    /// Folder for form submissions until the database arrives (phase 8).
    pub data_dir: PathBuf,
    /// Cloudflare Turnstile secret. Unset = bot check off (local development).
    pub turnstile_secret: Option<String>,
    /// Form posts allowed per visitor per minute.
    pub form_posts_per_minute: usize,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let here = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let var = |k: &str| std::env::var(k).ok().filter(|v| !v.is_empty());
        Ok(Self {
            bind_addr: var("API_BIND").unwrap_or_else(|| "127.0.0.1:8080".into()),
            cors_origins: var("CORS_ORIGINS")
                .unwrap_or_else(|| "http://localhost:3000".into())
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect(),
            seed_dir: var("SEED_DIR").map(PathBuf::from).unwrap_or_else(|| here.join("seed")),
            data_dir: var("DATA_DIR").map(PathBuf::from).unwrap_or_else(|| here.join("data")),
            turnstile_secret: var("TURNSTILE_SECRET"),
            form_posts_per_minute: var("FORM_POSTS_PER_MINUTE").and_then(|v| v.parse().ok()).unwrap_or(6),
        })
    }
}
