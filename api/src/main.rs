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

use crate::{config::Config, state::AppState};

const USAGE: &str = "usage: api [serve | seed | import-files | export <waitlist|subscribers|suggestions|contact> | admin-password]";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "api=debug,tower_http=info".into()),
        )
        .with_writer(std::io::stderr)
        .init();

    let args: Vec<String> = std::env::args().skip(1).collect();
    let args: Vec<&str> = args.iter().map(String::as_str).collect();
    // Needs no database or config: it only asks for a password and writes its hash.
    if args.as_slice() == ["admin-password"] {
        return jobs::admin_password();
    }
    let config = Config::from_env()?;

    match args.as_slice() {
        [] | ["serve"] => serve(config).await,
        ["seed"] => jobs::seed(config).await,
        ["import-files"] => jobs::import_files(config).await,
        ["export", what] => {
            let state = AppState::build(config).await?;
            print!("{}", jobs::export(&state, what).await?);
            Ok(())
        }
        _ => anyhow::bail!(USAGE),
    }
}

async fn serve(config: Config) -> anyhow::Result<()> {
    let state = AppState::build(config.clone()).await?;
    // A brand-new database gets the seed content automatically.
    if let Some(pg) = &state.pg
        && pg.has_no_content().await?
    {
        tracing::info!(
            "empty database: loading content from {}",
            config.seed_dir.display()
        );
        pg.load_seed(&repo::memory::SeedStore::load(&config.seed_dir)?)
            .await?;
    }
    tracing::info!(storage = ?config.storage, "storage ready");
    let app = routes::router(state);
    let addr: SocketAddr = config.bind_addr.parse()?;
    tracing::info!("api listening on http://{addr}");
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
