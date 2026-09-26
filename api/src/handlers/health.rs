use axum::{Json, extract::State};
use serde::Serialize;

use crate::{error::ApiResult, state::AppState};

#[derive(Serialize)]
pub struct Health {
    status: &'static str,
    database: &'static str,
}

/// GET /health: confirms the API is up and can reach Postgres.
pub async fn health(State(state): State<AppState>) -> ApiResult<Json<Health>> {
    sqlx::query("SELECT 1").execute(&state.db).await?;
    Ok(Json(Health {
        status: "ok",
        database: "ok",
    }))
}
