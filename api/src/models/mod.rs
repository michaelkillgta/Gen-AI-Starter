//! Data shapes. `seed` types match the JSON files in `api/seed/` (and later the
//! database rows); `api` types are what the endpoints return. Every type derives
//! `TS`, so `cargo test` writes matching TypeScript into `web/src/lib/api-types/`.

pub mod api;
pub mod forms;
pub mod seed;
