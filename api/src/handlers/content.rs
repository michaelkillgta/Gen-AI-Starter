//! Read-only content endpoints. Handlers only unpack the request; the work is in
//! `services::content`.

use axum::{
    Json,
    extract::{Path, Query, State},
};
use serde::Deserialize;

use crate::{
    error::{ApiError, ApiResult},
    models::api::{
        ChallengeResponse, DiveDetail, IssueDetail, IssueSummary, PostDetail, PostsResponse,
        ToolWithDives, ToolsResponse, TrackDetail, TrackSummary,
    },
    services::content,
    state::AppState,
};

pub async fn tools(State(s): State<AppState>) -> ApiResult<Json<ToolsResponse>> {
    Ok(Json(content::tools(&s).await?))
}

pub async fn tool(State(s): State<AppState>, Path(slug): Path<String>) -> ApiResult<Json<ToolWithDives>> {
    Ok(Json(content::tool(&s, &slug).await?))
}

pub async fn tracks(State(s): State<AppState>) -> ApiResult<Json<Vec<TrackSummary>>> {
    Ok(Json(content::tracks(&s).await?))
}

pub async fn track(State(s): State<AppState>, Path(slug): Path<String>) -> ApiResult<Json<TrackDetail>> {
    Ok(Json(content::track(&s, &slug).await?))
}

pub async fn dive(State(s): State<AppState>, Path(slug): Path<String>) -> ApiResult<Json<DiveDetail>> {
    Ok(Json(content::dive(&s, &slug).await?))
}

pub async fn issues(State(s): State<AppState>) -> ApiResult<Json<Vec<IssueSummary>>> {
    Ok(Json(content::issues(&s).await?))
}

pub async fn latest_issue(State(s): State<AppState>) -> ApiResult<Json<IssueDetail>> {
    Ok(Json(content::issue(&s, None).await?))
}

pub async fn issue(State(s): State<AppState>, Path(number): Path<String>) -> ApiResult<Json<IssueDetail>> {
    let n: i32 = number.parse().map_err(|_| ApiError::NotFound)?;
    Ok(Json(content::issue(&s, Some(n)).await?))
}

#[derive(Deserialize)]
pub struct PostsQuery {
    category: Option<String>,
}

pub async fn posts(State(s): State<AppState>, Query(q): Query<PostsQuery>) -> ApiResult<Json<PostsResponse>> {
    Ok(Json(content::posts(&s, q.category.as_deref()).await?))
}

pub async fn post(State(s): State<AppState>, Path(slug): Path<String>) -> ApiResult<Json<PostDetail>> {
    Ok(Json(content::post(&s, &slug).await?))
}

pub async fn challenge(State(s): State<AppState>) -> ApiResult<Json<ChallengeResponse>> {
    Ok(Json(content::challenge(&s).await?))
}
