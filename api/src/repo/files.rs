//! Form submissions stored as JSON files in `api/data/` (gitignored) until the
//! database arrives in phase 8. Writes go to a temp file and are renamed into
//! place, so a crash never leaves a half-written file.

use std::path::{Path, PathBuf};

use anyhow::Context;
use async_trait::async_trait;
use serde::{Serialize, de::DeserializeOwned};
use tokio::sync::Mutex;

use super::{AddOutcome, RepoResult, SubmissionRepo};
use crate::models::forms::{ContactMessage, Subscriber, Suggestion, WaitlistEntry};

pub struct FileSubmissions {
    dir: PathBuf,
    // One lock for all files: submissions are rare, simplicity wins.
    lock: Mutex<()>,
}

impl FileSubmissions {
    pub fn open(dir: &Path) -> anyhow::Result<Self> {
        std::fs::create_dir_all(dir).with_context(|| format!("creating {}", dir.display()))?;
        Ok(Self { dir: dir.to_path_buf(), lock: Mutex::new(()) })
    }

    fn path(&self, file: &str) -> PathBuf {
        self.dir.join(file)
    }

    async fn load<T: DeserializeOwned>(&self, file: &str) -> anyhow::Result<Vec<T>> {
        match tokio::fs::read_to_string(self.path(file)).await {
            Ok(text) if text.trim().is_empty() => Ok(Vec::new()),
            Ok(text) => serde_json::from_str(&text).with_context(|| format!("parsing {file}")),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(Vec::new()),
            Err(e) => Err(e).with_context(|| format!("reading {file}")),
        }
    }

    async fn save<T: Serialize>(&self, file: &str, items: &[T]) -> anyhow::Result<()> {
        let tmp = self.path(&format!("{file}.tmp"));
        tokio::fs::write(&tmp, serde_json::to_vec_pretty(items)?).await?;
        tokio::fs::rename(&tmp, self.path(file)).await?;
        Ok(())
    }

    async fn append<T: Serialize + DeserializeOwned>(&self, file: &str, item: T) -> anyhow::Result<()> {
        let _g = self.lock.lock().await;
        let mut all: Vec<T> = self.load(file).await?;
        all.push(item);
        self.save(file, &all).await
    }
}

const WAITLIST: &str = "waitlist.json";
const SUBSCRIBERS: &str = "subscribers.json";
const SUGGESTIONS: &str = "suggestions.json";
const CONTACT: &str = "contact.json";

#[async_trait]
impl SubmissionRepo for FileSubmissions {
    async fn join_waitlist(&self, mut entry: WaitlistEntry) -> RepoResult<AddOutcome> {
        let _g = self.lock.lock().await;
        let mut all: Vec<WaitlistEntry> = self.load(WAITLIST).await?;
        let mine = all.iter().filter(|e| e.challenge == entry.challenge);
        if let Some(existing) = mine.clone().find(|e| e.phone == entry.phone || e.email == entry.email) {
            return Ok(AddOutcome { position: existing.position, duplicate: true });
        }
        entry.position = mine.count() as i32 + 1;
        let position = entry.position;
        all.push(entry);
        self.save(WAITLIST, &all).await?;
        Ok(AddOutcome { position, duplicate: false })
    }

    async fn waitlist_count(&self, challenge: &str) -> RepoResult<i32> {
        let _g = self.lock.lock().await;
        let all: Vec<WaitlistEntry> = self.load(WAITLIST).await?;
        Ok(all.iter().filter(|e| e.challenge == challenge).count() as i32)
    }

    async fn waitlist(&self, challenge: &str) -> RepoResult<Vec<WaitlistEntry>> {
        let _g = self.lock.lock().await;
        let all: Vec<WaitlistEntry> = self.load(WAITLIST).await?;
        Ok(all.into_iter().filter(|e| e.challenge == challenge).collect())
    }

    async fn subscribe(&self, sub: Subscriber) -> RepoResult<bool> {
        let _g = self.lock.lock().await;
        let mut all: Vec<Subscriber> = self.load(SUBSCRIBERS).await?;
        if all.iter().any(|s| s.value == sub.value) {
            return Ok(false);
        }
        all.push(sub);
        self.save(SUBSCRIBERS, &all).await?;
        Ok(true)
    }

    async fn subscribers(&self) -> RepoResult<Vec<Subscriber>> {
        let _g = self.lock.lock().await;
        self.load(SUBSCRIBERS).await
    }

    async fn add_suggestion(&self, s: Suggestion) -> RepoResult<()> {
        self.append(SUGGESTIONS, s).await
    }

    async fn suggestions(&self) -> RepoResult<Vec<Suggestion>> {
        let _g = self.lock.lock().await;
        self.load(SUGGESTIONS).await
    }

    async fn add_contact(&self, m: ContactMessage) -> RepoResult<()> {
        self.append(CONTACT, m).await
    }

    async fn contacts(&self) -> RepoResult<Vec<ContactMessage>> {
        let _g = self.lock.lock().await;
        self.load(CONTACT).await
    }
}
