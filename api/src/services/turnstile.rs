//! Cloudflare Turnstile check for form posts. Off unless TURNSTILE_SECRET is set,
//! so local development and tests don't need Cloudflare.

use serde::Deserialize;

const VERIFY_URL: &str = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

#[derive(Deserialize)]
struct VerifyAnswer {
    success: bool,
}

pub struct Turnstile {
    secret: Option<String>,
    http: reqwest::Client,
}

impl Turnstile {
    pub fn new(secret: Option<String>) -> Self {
        Self {
            secret: secret.filter(|s| !s.is_empty()),
            http: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(8))
                .build()
                .expect("http client"),
        }
    }

    /// True if the token is valid, or if Turnstile is switched off.
    pub async fn verify(&self, token: &str, ip: &str) -> bool {
        let Some(secret) = &self.secret else { return true };
        if token.is_empty() {
            return false;
        }
        let body = serde_json::json!({ "secret": secret, "response": token, "remoteip": ip });
        match self.http.post(VERIFY_URL).json(&body).send().await {
            Ok(res) => res.json::<VerifyAnswer>().await.map(|a| a.success).unwrap_or(false),
            Err(e) => {
                tracing::warn!(error = %e, "turnstile check failed");
                false
            }
        }
    }
}
