//! A small in-memory rate limiter: at most `max` form posts per visitor per window.

use std::{
    collections::HashMap,
    sync::Mutex,
    time::{Duration, Instant},
};

pub struct RateLimiter {
    max: usize,
    window: Duration,
    hits: Mutex<HashMap<String, Vec<Instant>>>,
}

impl RateLimiter {
    pub fn new(max: usize, window: Duration) -> Self {
        Self {
            max,
            window,
            hits: Mutex::new(HashMap::new()),
        }
    }

    /// Records a hit for `key` and says whether it is allowed.
    pub fn check(&self, key: &str) -> bool {
        let now = Instant::now();
        let mut hits = self.hits.lock().expect("rate limiter lock");
        // Forget old visitors now and then so the map can't grow forever.
        if hits.len() > 10_000 {
            hits.retain(|_, v| {
                v.last()
                    .is_some_and(|t| now.duration_since(*t) < self.window)
            });
        }
        let list = hits.entry(key.to_string()).or_default();
        list.retain(|t| now.duration_since(*t) < self.window);
        if list.len() >= self.max {
            return false;
        }
        list.push(now);
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn blocks_after_max() {
        let rl = RateLimiter::new(2, Duration::from_secs(60));
        assert!(rl.check("a"));
        assert!(rl.check("a"));
        assert!(!rl.check("a"));
        assert!(rl.check("b"));
    }
}
