//! Form rules: bot check, rate limit, validation, then storage.

use std::collections::HashMap;

use chrono::Utc;
use uuid::Uuid;

use super::validate;
use crate::{
    error::{ApiError, ApiResult},
    models::forms::{
        ContactKind, ContactMessage, ContactRequest, SubscribeRequest, Subscriber, Suggestion,
        SuggestionRequest, WaitlistEntry, WaitlistRequest, WaitlistResponse,
    },
    state::AppState,
};

/// Collects field errors so the form can show all of them at once.
#[derive(Default)]
struct Fields(HashMap<String, String>);

impl Fields {
    fn take<T>(&mut self, field: &str, r: Result<T, &'static str>) -> Option<T> {
        r.map_err(|m| self.0.insert(field.to_string(), m.to_string())).ok()
    }

    fn finish(self) -> ApiResult<()> {
        if self.0.is_empty() {
            Ok(())
        } else {
            Err(ApiError::Validation(self.0))
        }
    }
}

async fn guard(state: &AppState, ip: &str, token: &str) -> ApiResult<()> {
    if !state.limiter.check(ip) {
        return Err(ApiError::TooManyRequests);
    }
    if !state.turnstile.verify(token, ip).await {
        return Err(ApiError::BadRequest("Please complete the check that you're not a robot.".into()));
    }
    Ok(())
}

pub async fn join_waitlist(state: &AppState, ip: &str, req: WaitlistRequest) -> ApiResult<WaitlistResponse> {
    guard(state, ip, &req.turnstile).await?;
    let mut f = Fields::default();
    let name = f.take("name", validate::name(&req.name));
    let phone = f.take("phone", validate::phone(&req.phone));
    let email = f.take("email", validate::email(&req.email));
    f.finish()?;

    let challenge = state.repos.challenge.current().await?;
    let outcome = state
        .submissions
        .join_waitlist(WaitlistEntry {
            id: Uuid::new_v4(),
            challenge: challenge.slug.clone(),
            position: 0, // set by the store
            name: name.unwrap_or_default(),
            phone: phone.unwrap_or_default(),
            email: email.unwrap_or_default(),
            created_at: Utc::now(),
        })
        .await?;
    Ok(WaitlistResponse {
        position: outcome.position,
        joined: state.submissions.waitlist_count(&challenge.slug).await?,
        goal: challenge.goal,
        already_joined: outcome.duplicate,
    })
}

pub async fn subscribe(state: &AppState, ip: &str, req: SubscribeRequest) -> ApiResult<()> {
    guard(state, ip, &req.turnstile).await?;
    let raw = req.contact.trim();
    let (kind, value) = if raw.contains('@') {
        (ContactKind::Email, validate::email(raw))
    } else {
        (ContactKind::Phone, validate::phone(raw))
    };
    let value = value.map_err(|_| {
        ApiError::Validation(HashMap::from([(
            "contact".to_string(),
            "Enter a WhatsApp number (like 98765 43210) or an email.".to_string(),
        )]))
    })?;
    let source = validate::text(&req.source, 40, "bad source").unwrap_or_default();
    // Already subscribed is fine: same friendly answer, no duplicate row.
    state
        .submissions
        .subscribe(Subscriber { id: Uuid::new_v4(), kind, value, source, created_at: Utc::now() })
        .await?;
    Ok(())
}

pub async fn suggest(state: &AppState, ip: &str, req: SuggestionRequest) -> ApiResult<()> {
    guard(state, ip, &req.turnstile).await?;
    let mut f = Fields::default();
    let about = match req.about.as_str() {
        "tool" | "weekly" | "topic" | "fix" | "other" => req.about.clone(),
        _ => "other".to_string(),
    };
    let title = f.take("title", validate::text(&req.title, 120, "Please keep this under 120 characters."));
    if title.as_deref() == Some("") {
        f.0.insert("title".into(), "Please tell me the name of the tool or topic.".into());
    }
    let details = f.take("details", validate::text(&req.details, 2000, "Please keep this under 2000 characters."));
    let link = f.take("link", validate::url(&req.link));
    let contact = if req.contact.trim().is_empty() {
        Some(String::new())
    } else {
        f.take("contact", validate::email(&req.contact))
    };
    f.finish()?;
    state
        .submissions
        .add_suggestion(Suggestion {
            id: Uuid::new_v4(),
            about,
            title: title.unwrap_or_default(),
            details: details.unwrap_or_default(),
            link: link.unwrap_or_default(),
            contact: contact.unwrap_or_default(),
            created_at: Utc::now(),
        })
        .await?;
    Ok(())
}

pub async fn contact(state: &AppState, ip: &str, req: ContactRequest) -> ApiResult<()> {
    guard(state, ip, &req.turnstile).await?;
    let mut f = Fields::default();
    let name = f.take("name", validate::name(&req.name));
    let email = f.take("email", validate::email(&req.email));
    let college = f.take("college", validate::text(&req.college, 120, "Please keep this under 120 characters."));
    let message = f.take("message", validate::text(&req.message, 4000, "Please keep this under 4000 characters."));
    if message.as_deref().is_some_and(|m| m.chars().count() < 5) {
        f.0.insert("message".into(), "Please write a short message.".into());
    }
    f.finish()?;
    state
        .submissions
        .add_contact(ContactMessage {
            id: Uuid::new_v4(),
            name: name.unwrap_or_default(),
            email: email.unwrap_or_default(),
            college: college.unwrap_or_default(),
            message: message.unwrap_or_default(),
            created_at: Utc::now(),
        })
        .await?;
    Ok(())
}
