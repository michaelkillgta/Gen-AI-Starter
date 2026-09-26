mod config;
mod error;
mod handlers;
mod jobs;
mod middleware;
mod models;
mod repo;
mod routes;
mod services;
mod state;

use std::net::SocketAddr;

use tracing_subscriber::EnvFilter;

use crate::{
    config::Config,
    repo::memory::SeedStore,
    state::{AppState, Repos},
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| "api=debug,tower_http=info".into()),
        )
        .init();

    let config = Config::from_env()?;
    let store = SeedStore::load(&config.seed_dir)?;
    tracing::info!("content loaded from {}", config.seed_dir.display());

    let state = AppState::new(Repos::from_seed(store), config.clone());
    let app = routes::router(state);

    let addr: SocketAddr = config.bind_addr.parse()?;
    tracing::info!("api listening on http://{addr}");
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
