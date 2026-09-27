//! The admin area's sign-in: one password, stored only as an argon2id hash
//! (`ADMIN_PASSWORD_HASH`), sessions kept in memory for 12 hours, and a lockout
//! after too many wrong tries from one IP.
//!
//! Sessions live in memory on purpose: restarting the API signs the admin out,
//! which is fine for one person and means no session table to leak.

use std::{
    collections::HashMap,
    sync::Mutex,
    time::{Duration, Instant},
};

use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::{
        SaltString,
        rand_core::{OsRng, RngCore},
    },
};

/// How long a sign-in lasts.
pub const SESSION_TTL: Duration = Duration::from_secs(12 * 60 * 60);
/// Wrong passwords allowed from one IP before it is locked out.
pub const MAX_FAILS: u32 = 5;
/// How long a locked-out IP has to wait.
pub const LOCKOUT: Duration = Duration::from_secs(15 * 60);
/// Shortest password `pnpm admin:password` accepts.
pub const MIN_PASSWORD_LEN: usize = 12;

#[derive(Debug, PartialEq, Eq)]
pub enum LoginError {
    /// No `ADMIN_PASSWORD_HASH` set.
    NotConfigured,
    /// Too many wrong tries from this IP.
    Locked { retry_after: Duration },
    Wrong { tries_left: u32 },
}

#[derive(Default)]
struct Fails {
    count: u32,
    locked_until: Option<Instant>,
}

pub struct AdminAuth {
    hash: Option<String>,
    sessions: Mutex<HashMap<String, Instant>>,
    fails: Mutex<HashMap<String, Fails>>,
}

impl AdminAuth {
    pub fn new(hash: Option<String>) -> Self {
        Self {
            hash,
            sessions: Mutex::new(HashMap::new()),
            fails: Mutex::new(HashMap::new()),
        }
    }

    pub fn configured(&self) -> bool {
        self.hash.is_some()
    }

    /// Checks the password for a visitor at `ip`. On success returns a new session token.
    pub fn login(&self, ip: &str, password: &str) -> Result<String, LoginError> {
        let Some(hash) = &self.hash else {
            return Err(LoginError::NotConfigured);
        };
        let now = Instant::now();
        {
            let mut fails = self.fails.lock().expect("admin fails lock");
            if let Some(f) = fails.get_mut(ip)
                && let Some(until) = f.locked_until
            {
                if until > now {
                    return Err(LoginError::Locked {
                        retry_after: until - now,
                    });
                }
                *f = Fails::default();
            }
        }

        // The slow check runs without holding any lock.
        if verify(hash, password) {
            self.fails.lock().expect("admin fails lock").remove(ip);
            let token = new_token();
            let mut sessions = self.sessions.lock().expect("admin sessions lock");
            sessions.retain(|_, until| *until > now);
            sessions.insert(token.clone(), now + SESSION_TTL);
            return Ok(token);
        }

        let mut fails = self.fails.lock().expect("admin fails lock");
        if fails.len() > 10_000 {
            fails.retain(|_, f| f.locked_until.is_some_and(|u| u > now));
        }
        let f = fails.entry(ip.to_string()).or_default();
        f.count += 1;
        if f.count >= MAX_FAILS {
            f.count = 0;
            f.locked_until = Some(now + LOCKOUT);
            return Err(LoginError::Locked {
                retry_after: LOCKOUT,
            });
        }
        Err(LoginError::Wrong {
            tries_left: MAX_FAILS - f.count,
        })
    }

    /// True when `token` is a live session.
    pub fn check(&self, token: &str) -> bool {
        let sessions = self.sessions.lock().expect("admin sessions lock");
        sessions
            .get(token)
            .is_some_and(|until| *until > Instant::now())
    }

    pub fn logout(&self, token: &str) {
        self.sessions
            .lock()
            .expect("admin sessions lock")
            .remove(token);
    }
}

fn verify(hash: &str, password: &str) -> bool {
    match PasswordHash::new(hash) {
        Ok(parsed) => Argon2::default()
            .verify_password(password.as_bytes(), &parsed)
            .is_ok(),
        Err(e) => {
            tracing::error!(error = %e, "ADMIN_PASSWORD_HASH is not a valid argon2 hash");
            false
        }
    }
}

/// 32 random bytes as hex.
fn new_token() -> String {
    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

/// An argon2id hash (default parameters: 19 MiB, 2 passes) in PHC string form.
pub fn hash_password(password: &str) -> anyhow::Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|e| anyhow::anyhow!("could not hash the password: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn right_password_gives_a_session_wrong_one_counts_down() {
        let auth = AdminAuth::new(Some(hash_password("correct horse battery").unwrap()));
        assert_eq!(
            auth.login("1.1.1.1", "nope"),
            Err(LoginError::Wrong { tries_left: 4 })
        );
        let token = auth.login("1.1.1.1", "correct horse battery").unwrap();
        assert!(auth.check(&token));
        assert!(!auth.check("forged"));
        auth.logout(&token);
        assert!(!auth.check(&token));
    }

    #[test]
    fn five_wrong_tries_lock_the_ip_even_for_the_right_password() {
        let auth = AdminAuth::new(Some(hash_password("correct horse battery").unwrap()));
        for _ in 0..4 {
            assert!(matches!(
                auth.login("2.2.2.2", "nope"),
                Err(LoginError::Wrong { .. })
            ));
        }
        assert!(matches!(
            auth.login("2.2.2.2", "nope"),
            Err(LoginError::Locked { .. })
        ));
        assert!(matches!(
            auth.login("2.2.2.2", "correct horse battery"),
            Err(LoginError::Locked { .. })
        ));
        // Other visitors aren't affected.
        assert!(auth.login("3.3.3.3", "correct horse battery").is_ok());
    }

    #[test]
    fn not_configured_without_a_hash() {
        let auth = AdminAuth::new(None);
        assert!(!auth.configured());
        assert_eq!(
            auth.login("1.1.1.1", "anything"),
            Err(LoginError::NotConfigured)
        );
    }
}
