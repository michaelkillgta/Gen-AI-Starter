//! End-to-end checks of every read endpoint against the real seed files.

use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use http_body_util::BodyExt;
use serde_json::Value;
use tower::ServiceExt;

use crate::{
    config::Config,
    repo::memory::SeedStore,
    state::{AppState, Repos},
};

fn app() -> axum::Router {
    let config = Config::from_env().unwrap();
    let store = SeedStore::load(&config.seed_dir).unwrap();
    super::router(AppState::new(Repos::from_seed(store), config))
}

async fn get(path: &str) -> (StatusCode, Value) {
    let res = app()
        .oneshot(Request::get(path).body(Body::empty()).unwrap())
        .await
        .unwrap();
    let status = res.status();
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    (status, serde_json::from_slice(&bytes).unwrap_or(Value::Null))
}

#[tokio::test]
async fn health_is_ok() {
    let (s, body) = get("/health").await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(body["status"], "ok");
}

#[tokio::test]
async fn tools_include_deep_dive_links() {
    let (s, body) = get("/tools").await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(body["tools"].as_array().unwrap().len(), 28);
    let langgraph = body["tools"].as_array().unwrap().iter().find(|t| t["slug"] == "langgraph").unwrap();
    assert!(!langgraph["dives"].as_array().unwrap().is_empty());
    assert_eq!(get("/tools/docling").await.0, StatusCode::OK);
    assert_eq!(get("/tools/nope").await.0, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn tracks_and_dives() {
    let (_, tracks) = get("/tracks").await;
    assert_eq!(tracks.as_array().unwrap().len(), 3);
    let (s, track) = get("/tracks/agents-that-dont-break").await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(track["dives"].as_array().unwrap().len(), 9);

    let (s, dive) = get("/dives/know-when-to-stop").await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(dive["track"]["dives"].as_array().unwrap().len(), 9);
    assert!(dive["prev"].is_null());
    assert_eq!(dive["next"]["slug"], "data-is-not-authority");
    assert_eq!(dive["blog_post"]["slug"], "why-your-agent-should-know-when-to-stop");
    assert!(dive["read_minutes"].as_i64().unwrap() >= 1);
}

#[tokio::test]
async fn weekly_issue_has_tally() {
    let (s, issue) = get("/weekly/latest").await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(issue["tally"]["use"], 2);
    assert_eq!(issue["tally"]["wait"], 2);
    assert_eq!(issue["tally"]["skip"], 1);
    assert_eq!(get("/weekly/1").await.0, StatusCode::OK);
    assert_eq!(get("/weekly/99").await.0, StatusCode::NOT_FOUND);
    assert_eq!(get("/weekly/abc").await.0, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn blog_filters_by_category() {
    let (_, all) = get("/posts").await;
    assert_eq!(all["posts"].as_array().unwrap().len(), 10);
    let (_, agents) = get("/posts?category=agents").await;
    assert_eq!(agents["posts"].as_array().unwrap().len(), 4);
    assert_eq!(get("/posts?category=nope").await.0, StatusCode::NOT_FOUND);
    let (s, post) = get("/posts/memory-is-not-truth").await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(post["category"]["label"], "Agents");
}

#[tokio::test]
async fn challenge_has_projects() {
    let (s, body) = get("/challenge").await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(body["challenge"]["goal"], 50);
    assert_eq!(body["projects"].as_array().unwrap().len(), 4);
}
