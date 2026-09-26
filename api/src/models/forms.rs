//! Form submissions: what the website sends, and what we store.
//! Stored records hold personal data and are never returned by a public endpoint.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

// ---------- Requests (from the website) ----------

#[derive(Debug, Deserialize, TS)]
#[ts(export)]
pub struct WaitlistRequest {
    pub name: String,
    pub phone: String,
    pub email: String,
    #[serde(default)]
    pub turnstile: String,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export)]
pub struct SubscribeRequest {
    /// A WhatsApp number or an email address.
    pub contact: String,
    #[serde(default)]
    pub source: String,
    #[serde(default)]
    pub turnstile: String,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export)]
pub struct SuggestionRequest {
    #[serde(default)]
    pub about: String,
    pub title: String,
    #[serde(default)]
    pub details: String,
    #[serde(default)]
    pub link: String,
    #[serde(default)]
    pub contact: String,
    #[serde(default)]
    pub turnstile: String,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export)]
pub struct ContactRequest {
    pub name: String,
    pub email: String,
    #[serde(default)]
    pub college: String,
    pub message: String,
    #[serde(default)]
    pub turnstile: String,
}

// ---------- Responses ----------

#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct WaitlistResponse {
    /// Your place in the queue (1-based).
    pub position: i32,
    pub joined: i32,
    pub goal: i32,
    /// True when this phone or email had already joined.
    pub already_joined: bool,
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
pub struct OkResponse {
    pub ok: bool,
}

// ---------- Stored records ----------

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WaitlistEntry {
    pub id: uuid::Uuid,
    pub challenge: String,
    pub position: i32,
    pub name: String,
    /// Normalised, e.g. +919876543210.
    pub phone: String,
    /// Lower-cased.
    pub email: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ContactKind {
    Phone,
    Email,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Subscriber {
    pub id: uuid::Uuid,
    pub kind: ContactKind,
    pub value: String,
    pub source: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Suggestion {
    pub id: uuid::Uuid,
    pub about: String,
    pub title: String,
    pub details: String,
    pub link: String,
    pub contact: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ContactMessage {
    pub id: uuid::Uuid,
    pub name: String,
    pub email: String,
    pub college: String,
    pub message: String,
    pub created_at: DateTime<Utc>,
}
