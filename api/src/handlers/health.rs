use axum::{Json, extract::State};
use serde::Serialize;

use crate::{config::Storage, error::ApiResult, state::AppState};

#[derive(Serialize)]
pub struct Health {
    status: &'static str,
    storage: &'static str,
}

/// GET /health: the API is up and its storage answers.
pub async fn health(State(s): State<AppState>) -> ApiResult<Json<Health>> {
    // A cheap read that goes through whichever store is configured.
    s.repos.challenge.current().await?;
    let storage = match s.config.storage {
        Storage::Postgres => "postgres",
        Storage::Files => "files",
    };
    Ok(Json(Health {
        status: "ok",
        storage,
    }))
}
