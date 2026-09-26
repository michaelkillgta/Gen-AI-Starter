use std::collections::HashMap;

use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;

/// Every handler returns `Result<T, ApiError>`, so errors reach the client as
/// `{ "error": "...", "fields"?: { field: message } }` with a matching status code.
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("not found")]
    NotFound,
    /// Form field problems, keyed by field name.
    #[error("Please check the highlighted fields.")]
    Validation(HashMap<String, String>),
    #[error("Too many tries. Please wait a minute and try again.")]
    TooManyRequests,
    #[error(transparent)]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let body = match &self {
            ApiError::Validation(fields) => json!({ "error": self.to_string(), "fields": fields }),
            ApiError::Internal(e) => {
                tracing::error!(error = %e, "internal error");
                json!({ "error": "Something went wrong on our side. Please try again." })
            }
            _ => json!({ "error": self.to_string() }),
        };
        let status = match self {
            ApiError::NotFound => StatusCode::NOT_FOUND,
            ApiError::Validation(_) => StatusCode::UNPROCESSABLE_ENTITY,
            ApiError::TooManyRequests => StatusCode::TOO_MANY_REQUESTS,
            ApiError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        };
        (status, Json(body)).into_response()
    }
}

pub type ApiResult<T> = Result<T, ApiError>;
