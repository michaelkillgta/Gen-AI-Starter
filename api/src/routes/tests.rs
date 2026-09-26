//! End-to-end checks of every endpoint against the real seed files, in files mode
//! and (with `TEST_DATABASE_URL`) in Postgres mode.

use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use http_body_util::BodyExt;
use serde_json::Value;
use tower::ServiceExt;

use crate::{
    config::{Config, Storage},
    repo::memory::SeedStore,
    state::AppState,
};

/// A fresh app with empty submissions. Runs against Postgres when
/// `TEST_DATABASE_URL` is set (each app gets its own schema), otherwise files mode.
async fn app() -> axum::Router {
    let mut config = Config::from_env().unwrap();
    let state = match std::env::var("TEST_DATABASE_URL")
        .ok()
        .filter(|v| !v.is_empty())
    {
        Some(url) => {
            let schema = format!("t_{}", uuid::Uuid::new_v4().simple());
            let admin = sqlx::PgPool::connect(&url).await.unwrap();
            sqlx::query(sqlx::AssertSqlSafe(format!("CREATE SCHEMA {schema}")))
                .execute(&admin)
                .await
                .unwrap();
            admin.close().await;
            let search_path = schema.clone();
            let pool = sqlx::postgres::PgPoolOptions::new()
                .max_connections(4)
                .after_connect(move |conn, _| {
                    let sql = format!("SET search_path TO {search_path}");
                    Box::pin(async move {
                        sqlx::query(sqlx::AssertSqlSafe(sql))
                            .execute(&mut *conn)
                            .await?;
                        Ok(())
                    })
                })
                .connect(&url)
                .await
                .unwrap();
            config.storage = Storage::Postgres;
            let state = AppState::with_pool(pool, config.clone()).await.unwrap();
            let seed = SeedStore::load(&config.seed_dir).unwrap();
            state.pg.as_ref().unwrap().load_seed(&seed).await.unwrap();
            state
        }
        None => {
            config.storage = Storage::Files;
            config.data_dir =
                std::env::temp_dir().join(format!("ft-test-{}", uuid::Uuid::new_v4()));
            AppState::build(config).await.unwrap()
        }
    };
    super::router(state)
}

async fn send(
    app: &axum::Router,
    method: &str,
    path: &str,
    ip: &str,
    body: Value,
) -> (StatusCode, Value) {
    let req = Request::builder()
        .method(method)
        .uri(path)
        .header("content-type", "application/json")
        .header("x-forwarded-for", ip)
        .body(Body::from(body.to_string()))
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    let status = res.status();
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    (
        status,
        serde_json::from_slice(&bytes).unwrap_or(Value::Null),
    )
}

async fn get(path: &str) -> (StatusCode, Value) {
    let res = app()
        .await
        .oneshot(Request::get(path).body(Body::empty()).unwrap())
        .await
        .unwrap();
    let status = res.status();
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    (
        status,
        serde_json::from_slice(&bytes).unwrap_or(Value::Null),
    )
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
    let langgraph = body["tools"]
        .as_array()
        .unwrap()
        .iter()
        .find(|t| t["slug"] == "langgraph")
        .unwrap();
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
    assert_eq!(
        dive["blog_post"]["slug"],
        "why-your-agent-should-know-when-to-stop"
    );
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

#[tokio::test]
async fn waitlist_signup_counts_and_dedupes() {
    let app = app().await;
    let body =
        serde_json::json!({ "name": "Uma K", "phone": "98765 43210", "email": "uma@example.com" });
    let (s, res) = send(&app, "POST", "/challenge/waitlist", "1.1.1.1", body.clone()).await;
    assert_eq!(s, StatusCode::CREATED);
    assert_eq!(res["position"], 1);
    assert_eq!(res["already_joined"], false);

    // Same phone written differently: same person, same place.
    let again = serde_json::json!({ "name": "Uma", "phone": "+91 98765-43210", "email": "other@example.com" });
    let (s, res) = send(&app, "POST", "/challenge/waitlist", "1.1.1.2", again).await;
    assert_eq!(s, StatusCode::OK);
    assert_eq!(res["position"], 1);
    assert_eq!(res["already_joined"], true);

    let second =
        serde_json::json!({ "name": "Ravi", "phone": "9123456789", "email": "ravi@example.com" });
    let (_, res) = send(&app, "POST", "/challenge/waitlist", "1.1.1.3", second).await;
    assert_eq!(res["position"], 2);

    let (_, challenge) = send(&app, "GET", "/challenge", "1.1.1.4", Value::Null).await;
    assert_eq!(challenge["joined"], 2);
    // Personal data never appears in public answers.
    assert!(!challenge.to_string().contains("uma@example.com"));
}

#[tokio::test]
async fn waitlist_reports_every_bad_field() {
    let app = app().await;
    let body = serde_json::json!({ "name": "", "phone": "123", "email": "nope" });
    let (s, res) = send(&app, "POST", "/challenge/waitlist", "2.2.2.2", body).await;
    assert_eq!(s, StatusCode::UNPROCESSABLE_ENTITY);
    for f in ["name", "phone", "email"] {
        assert!(res["fields"][f].is_string(), "missing error for {f}");
    }
}

#[tokio::test]
async fn forms_are_rate_limited() {
    let app = app().await;
    let body = serde_json::json!({ "contact": "uma@example.com" });
    for _ in 0..6 {
        let (s, _) = send(&app, "POST", "/subscribe", "3.3.3.3", body.clone()).await;
        assert_eq!(s, StatusCode::OK);
    }
    let (s, _) = send(&app, "POST", "/subscribe", "3.3.3.3", body.clone()).await;
    assert_eq!(s, StatusCode::TOO_MANY_REQUESTS);
    // Another visitor is unaffected.
    assert_eq!(
        send(&app, "POST", "/subscribe", "4.4.4.4", body).await.0,
        StatusCode::OK
    );
}

#[tokio::test]
async fn subscribe_suggest_and_contact() {
    let app = app().await;
    let (s, _) = send(
        &app,
        "POST",
        "/subscribe",
        "5.5.5.1",
        serde_json::json!({ "contact": "98765 43210" }),
    )
    .await;
    assert_eq!(s, StatusCode::OK);
    let (s, res) = send(
        &app,
        "POST",
        "/subscribe",
        "5.5.5.2",
        serde_json::json!({ "contact": "hello" }),
    )
    .await;
    assert_eq!(s, StatusCode::UNPROCESSABLE_ENTITY);
    assert!(res["fields"]["contact"].is_string());

    let ok =
        serde_json::json!({ "about": "tool", "title": "Docling", "link": "github.com/docling" });
    assert_eq!(
        send(&app, "POST", "/suggestions", "5.5.5.3", ok).await.0,
        StatusCode::OK
    );
    let empty = serde_json::json!({ "title": "  " });
    assert_eq!(
        send(&app, "POST", "/suggestions", "5.5.5.4", empty).await.0,
        StatusCode::UNPROCESSABLE_ENTITY
    );

    let msg = serde_json::json!({ "name": "Asha", "email": "asha@college.edu", "message": "Can we run this at our college?" });
    assert_eq!(
        send(&app, "POST", "/contact", "5.5.5.5", msg).await.0,
        StatusCode::OK
    );
}
