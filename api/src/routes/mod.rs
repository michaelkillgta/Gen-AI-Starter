use axum::{Router, routing::get};

use crate::{handlers, middleware, state::AppState};

pub fn router(state: AppState) -> Router {
    let api = Router::new().route("/health", get(handlers::health::health));

    middleware::apply(api, &state.config).with_state(state)
}
