//! Shapes for the admin area (`/admin/*`). Rows are flat, newest first, dates as
//! RFC 3339 strings, so the website can show and export them as they are.

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::forms::{ContactKind, ContactMessage, Subscriber, Suggestion, WaitlistEntry};

#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct AdminStatus {
    /// False until `pnpm admin:password` has been run.
    pub configured: bool,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export)]
pub struct AdminLoginRequest {
    pub password: String,
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct AdminLoginResponse {
    /// Session token; the website keeps it in an httpOnly cookie.
    pub token: String,
    pub expires_in_secs: u32,
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct AdminData {
    /// Slug of the current challenge (the waitlist below is for it).
    pub challenge: String,
    pub waitlist: Vec<AdminWaitlistRow>,
    pub suggestions: Vec<AdminSuggestionRow>,
    pub subscribers: Vec<AdminSubscriberRow>,
    pub contacts: Vec<AdminContactRow>,
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct AdminWaitlistRow {
    pub position: i32,
    pub name: String,
    pub phone: String,
    pub email: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct AdminSuggestionRow {
    pub about: String,
    pub title: String,
    pub details: String,
    pub link: String,
    pub contact: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct AdminSubscriberRow {
    /// "phone" (WhatsApp) or "email".
    pub kind: String,
    pub value: String,
    pub source: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct AdminContactRow {
    pub name: String,
    pub email: String,
    pub college: String,
    pub message: String,
    pub created_at: String,
}

impl From<WaitlistEntry> for AdminWaitlistRow {
    fn from(e: WaitlistEntry) -> Self {
        Self {
            position: e.position,
            name: e.name,
            phone: e.phone,
            email: e.email,
            created_at: e.created_at.to_rfc3339(),
        }
    }
}

impl From<Suggestion> for AdminSuggestionRow {
    fn from(s: Suggestion) -> Self {
        Self {
            about: s.about,
            title: s.title,
            details: s.details,
            link: s.link,
            contact: s.contact,
            created_at: s.created_at.to_rfc3339(),
        }
    }
}

impl From<Subscriber> for AdminSubscriberRow {
    fn from(s: Subscriber) -> Self {
        Self {
            kind: match s.kind {
                ContactKind::Phone => "phone",
                ContactKind::Email => "email",
            }
            .into(),
            value: s.value,
            source: s.source,
            created_at: s.created_at.to_rfc3339(),
        }
    }
}

impl From<ContactMessage> for AdminContactRow {
    fn from(m: ContactMessage) -> Self {
        Self {
            name: m.name,
            email: m.email,
            college: m.college,
            message: m.message,
            created_at: m.created_at.to_rfc3339(),
        }
    }
}
