//! Admin endpoints. The website signs in on the admin's behalf and keeps the
//! session token in an httpOnly cookie; it sends the token back here as
//! `Authorization: Bearer …` (a `ft_admin` cookie works too). POSTs must come
//! from an allowed site origin.

use std::cmp::Reverse;

use axum::{
    Json,
    extract::State,
    http::{HeaderMap, HeaderValue, StatusCode, header},
    response::{IntoResponse, Response},
};
use serde_json::json;

use super::forms::client_ip;
use crate::{
    error::ApiResult,
    models::admin::{AdminData, AdminLoginRequest, AdminLoginResponse, AdminStatus},
    services::admin::{LoginError, SESSION_TTL},
    state::AppState,
};

pub const COOKIE: &str = "ft_admin";

fn error(status: StatusCode, message: &str) -> Response {
    (status, Json(json!({ "error": message }))).into_response()
}

/// The session token from `Authorization: Bearer` or the `ft_admin` cookie.
fn session_token(headers: &HeaderMap) -> Option<String> {
    let bearer = headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(str::trim);
    let cookie = || {
        headers
            .get_all(header::COOKIE)
            .iter()
            .filter_map(|v| v.to_str().ok())
            .flat_map(|v| v.split(';'))
            .filter_map(|c| c.trim().split_once('='))
            .find(|(k, _)| *k == COOKIE)
            .map(|(_, v)| v.trim())
    };
    bearer
        .or_else(cookie)
        .filter(|t| !t.is_empty())
        .map(String::from)
}

/// Admin POSTs must say which site sent them, and it must be ours.
fn origin_ok(s: &AppState, headers: &HeaderMap) -> bool {
    headers
        .get(header::ORIGIN)
        .and_then(|v| v.to_str().ok())
        .is_some_and(|o| s.config.admin_origins.iter().any(|a| a == o))
}

/// `Secure` everywhere except plain-http localhost during development.
fn cookie(headers: &HeaderMap, value: &str, max_age: u64) -> HeaderValue {
    let local = headers
        .get(header::ORIGIN)
        .and_then(|v| v.to_str().ok())
        .is_some_and(|o| o.starts_with("http://localhost") || o.starts_with("http://127.0.0.1"));
    let secure = if local { "" } else { "; Secure" };
    HeaderValue::from_str(&format!(
        "{COOKIE}={value}; Path=/; Max-Age={max_age}; HttpOnly; SameSite=Strict{secure}"
    ))
    .expect("cookie header is ascii")
}

/// GET /admin/status
pub async fn status(State(s): State<AppState>) -> Json<AdminStatus> {
    Json(AdminStatus {
        configured: s.admin.configured(),
    })
}

/// POST /admin/login
pub async fn login(
    State(s): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<AdminLoginRequest>,
) -> Response {
    if !origin_ok(&s, &headers) {
        return error(
            StatusCode::FORBIDDEN,
            "This request didn't come from the site.",
        );
    }
    let ip = client_ip(&headers);
    let auth = s.admin.clone();
    // Hashing is slow on purpose; keep it off the async threads.
    let result = tokio::task::spawn_blocking(move || auth.login(&ip, &req.password))
        .await
        .unwrap_or(Err(LoginError::Wrong { tries_left: 0 }));
    match result {
        Ok(token) => {
            let ttl = SESSION_TTL.as_secs();
            let mut res = Json(AdminLoginResponse {
                token: token.clone(),
                expires_in_secs: u32::try_from(ttl).unwrap_or(u32::MAX),
            })
            .into_response();
            res.headers_mut()
                .insert(header::SET_COOKIE, cookie(&headers, &token, ttl));
            res
        }
        Err(LoginError::NotConfigured) => error(
            StatusCode::SERVICE_UNAVAILABLE,
            "Admin not set up yet: run pnpm admin:password",
        ),
        Err(LoginError::Wrong { tries_left }) => (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Wrong password.", "tries_left": tries_left })),
        )
            .into_response(),
        Err(LoginError::Locked { retry_after }) => {
            let mins = retry_after.as_secs().div_ceil(60);
            let mut res = (
                StatusCode::TOO_MANY_REQUESTS,
                Json(json!({
                    "error": format!("Too many wrong tries. Try again in {mins} minutes."),
                    "retry_after_secs": retry_after.as_secs(),
                })),
            )
                .into_response();
            if let Ok(v) = HeaderValue::from_str(&retry_after.as_secs().to_string()) {
                res.headers_mut().insert(header::RETRY_AFTER, v);
            }
            res
        }
    }
}

/// POST /admin/logout
pub async fn logout(State(s): State<AppState>, headers: HeaderMap) -> Response {
    if !origin_ok(&s, &headers) {
        return error(
            StatusCode::FORBIDDEN,
            "This request didn't come from the site.",
        );
    }
    if let Some(token) = session_token(&headers) {
        s.admin.logout(&token);
    }
    let mut res = Json(json!({ "ok": true })).into_response();
    res.headers_mut()
        .insert(header::SET_COOKIE, cookie(&headers, "", 0));
    res
}

/// GET /admin/data: every sign-up, suggestion, subscriber and message, newest first.
pub async fn data(State(s): State<AppState>, headers: HeaderMap) -> ApiResult<Response> {
    if !session_token(&headers).is_some_and(|t| s.admin.check(&t)) {
        return Ok(error(StatusCode::UNAUTHORIZED, "Please sign in."));
    }
    let challenge = s.repos.challenge.current().await?;
    let mut waitlist = s.submissions.waitlist(&challenge.slug).await?;
    waitlist.sort_by_key(|x| Reverse(x.created_at));
    let mut suggestions = s.submissions.suggestions().await?;
    suggestions.sort_by_key(|x| Reverse(x.created_at));
    let mut subscribers = s.submissions.subscribers().await?;
    subscribers.sort_by_key(|x| Reverse(x.created_at));
    let mut contacts = s.submissions.contacts().await?;
    contacts.sort_by_key(|x| Reverse(x.created_at));

    let mut res = Json(AdminData {
        challenge: challenge.slug,
        waitlist: waitlist.into_iter().map(Into::into).collect(),
        suggestions: suggestions.into_iter().map(Into::into).collect(),
        subscribers: subscribers.into_iter().map(Into::into).collect(),
        contacts: contacts.into_iter().map(Into::into).collect(),
    })
    .into_response();
    // Personal data: never cache it anywhere.
    res.headers_mut()
        .insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    Ok(res)
}
