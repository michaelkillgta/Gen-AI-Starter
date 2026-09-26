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
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let here = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        Ok(Self {
            bind_addr: std::env::var("API_BIND").unwrap_or_else(|_| "127.0.0.1:8080".into()),
            cors_origins: std::env::var("CORS_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:3000".into())
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect(),
            seed_dir: std::env::var("SEED_DIR").map(PathBuf::from).unwrap_or_else(|_| here.join("seed")),
            data_dir: std::env::var("DATA_DIR").map(PathBuf::from).unwrap_or_else(|_| here.join("data")),
        })
    }
}
