//! Form endpoints. The website's server forwards the visitor's IP in
//! `x-forwarded-for` (Cloudflare's `cf-connecting-ip` wins when present).

use axum::{
    Json,
    extract::State,
    http::{HeaderMap, StatusCode},
};

use crate::{
    error::ApiResult,
    models::forms::{
        ContactRequest, OkResponse, SubscribeRequest, SuggestionRequest, WaitlistRequest,
        WaitlistResponse,
    },
    services::forms,
    state::AppState,
};

pub(crate) fn client_ip(headers: &HeaderMap) -> String {
    let get = |k: &str| {
        headers
            .get(k)
            .and_then(|v| v.to_str().ok())
            .map(str::trim)
            .filter(|v| !v.is_empty())
    };
    get("cf-connecting-ip")
        .or_else(|| {
            get("x-forwarded-for")
                .and_then(|v| v.split(',').next())
                .map(str::trim)
        })
        .unwrap_or("unknown")
        .to_string()
}

pub async fn waitlist(
    State(s): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<WaitlistRequest>,
) -> ApiResult<(StatusCode, Json<WaitlistResponse>)> {
    let res = forms::join_waitlist(&s, &client_ip(&headers), req).await?;
    let status = if res.already_joined {
        StatusCode::OK
    } else {
        StatusCode::CREATED
    };
    Ok((status, Json(res)))
}

pub async fn subscribe(
    State(s): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<SubscribeRequest>,
) -> ApiResult<Json<OkResponse>> {
    forms::subscribe(&s, &client_ip(&headers), req).await?;
    Ok(Json(OkResponse { ok: true }))
}

pub async fn suggestion(
    State(s): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<SuggestionRequest>,
) -> ApiResult<Json<OkResponse>> {
    forms::suggest(&s, &client_ip(&headers), req).await?;
    Ok(Json(OkResponse { ok: true }))
}

pub async fn contact(
    State(s): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<ContactRequest>,
) -> ApiResult<Json<OkResponse>> {
    forms::contact(&s, &client_ip(&headers), req).await?;
    Ok(Json(OkResponse { ok: true }))
}
