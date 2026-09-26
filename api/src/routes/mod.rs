use axum::{
    Router,
    routing::{get, post},
};

use crate::{handlers, middleware, state::AppState};

pub fn router(state: AppState) -> Router {
    let api = Router::new()
        .route("/health", get(handlers::health::health))
        .route("/tools", get(handlers::content::tools))
        .route("/tools/{slug}", get(handlers::content::tool))
        .route("/tracks", get(handlers::content::tracks))
        .route("/tracks/{slug}", get(handlers::content::track))
        .route("/dives/{slug}", get(handlers::content::dive))
        .route("/weekly", get(handlers::content::issues))
        .route("/weekly/latest", get(handlers::content::latest_issue))
        .route("/weekly/{number}", get(handlers::content::issue))
        .route("/posts", get(handlers::content::posts))
        .route("/posts/{slug}", get(handlers::content::post))
        .route("/challenge", get(handlers::content::challenge))
        .route("/challenge/waitlist", post(handlers::forms::waitlist))
        .route("/subscribe", post(handlers::forms::subscribe))
        .route("/suggestions", post(handlers::forms::suggestion))
        .route("/contact", post(handlers::forms::contact));

    middleware::apply(api, &state.config).with_state(state)
}

#[cfg(test)]
mod tests;
