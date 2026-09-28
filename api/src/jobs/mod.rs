//! Command-line jobs run with `cargo run -- <job>`:
//!
//! - `seed`: load `api/seed/*.json` into Postgres (safe to repeat; never touches signups).
//! - `import-files`: copy form submissions from `api/data/*.json` into Postgres,
//!   keeping waitlist positions (safe to repeat).
//! - `export <waitlist|subscribers|suggestions|contact>`: CSV to stdout. (The
//!   signed-in admin area at /admin shows the same data.)
//! - `admin-password`: set the admin password (`pnpm admin:password`). Asks for it
//!   twice without showing it and writes only its argon2id hash to `api/.env`.

use anyhow::Context;

use crate::{
    config::{Config, Storage},
    repo::{SubmissionRepo, files::FileSubmissions, memory::SeedStore, postgres::PgStore},
    state::{AppState, connect},
};

async fn postgres(config: &Config) -> anyhow::Result<PgStore> {
    let url = config
        .database_url
        .as_deref()
        .context("DATABASE_URL is not set")?;
    let pg = PgStore::new(connect(url).await?);
    pg.migrate().await?;
    Ok(pg)
}

pub async fn seed(config: Config) -> anyhow::Result<()> {
    let seed = SeedStore::load(&config.seed_dir)?;
    postgres(&config).await?.load_seed(&seed).await?;
    eprintln!(
        "seeded: {} tools, {} tracks, {} dives, {} issues, {} posts, {} projects",
        seed.tools_ref().len(),
        seed.tracks_ref().len(),
        seed.dives_ref().len(),
        seed.issues_ref().len(),
        seed.posts_ref().len(),
        seed.projects_ref().len()
    );
    Ok(())
}

pub async fn import_files(config: Config) -> anyhow::Result<()> {
    if config.storage == Storage::Files && config.database_url.is_none() {
        anyhow::bail!("import-files copies into Postgres: set DATABASE_URL");
    }
    let pg = postgres(&config).await?;
    let challenge = SeedStore::load(&config.seed_dir)?
        .challenge_ref()
        .slug
        .clone();
    let files: Box<dyn SubmissionRepo> = Box::new(FileSubmissions::open(&config.data_dir)?);
    let [w, s, g, c] = pg.import_submissions(files.as_ref(), &challenge).await?;
    eprintln!(
        "imported from {}: {w} waitlist, {s} subscribers, {g} suggestions, {c} contact messages",
        config.data_dir.display()
    );
    Ok(())
}

fn csv_row(cells: &[&str]) -> String {
    cells
        .iter()
        .map(|c| {
            // Quote everything, and defuse spreadsheet formulas.
            let c = if c.starts_with(['=', '+', '-', '@']) && !c.starts_with("+91") {
                format!("'{c}")
            } else {
                c.to_string()
            };
            format!("\"{}\"", c.replace('"', "\"\""))
        })
        .collect::<Vec<_>>()
        .join(",")
}

pub async fn export(state: &AppState, what: &str) -> anyhow::Result<String> {
    let mut out = Vec::new();
    match what {
        "waitlist" => {
            let challenge = state.repos.challenge.current().await?;
            out.push(csv_row(&[
                "position",
                "name",
                "phone",
                "email",
                "joined_at",
            ]));
            for e in state.submissions.waitlist(&challenge.slug).await? {
                out.push(csv_row(&[
                    &e.position.to_string(),
                    &e.name,
                    &e.phone,
                    &e.email,
                    &e.created_at.to_rfc3339(),
                ]));
            }
        }
        "subscribers" => {
            out.push(csv_row(&["kind", "contact", "source", "joined_at"]));
            for s in state.submissions.subscribers().await? {
                let kind = serde_json::to_value(&s.kind)?
                    .as_str()
                    .unwrap_or_default()
                    .to_string();
                out.push(csv_row(&[
                    &kind,
                    &s.value,
                    &s.source,
                    &s.created_at.to_rfc3339(),
                ]));
            }
        }
        "suggestions" => {
            out.push(csv_row(&[
                "about", "title", "details", "link", "contact", "sent_at",
            ]));
            for s in state.submissions.suggestions().await? {
                out.push(csv_row(&[
                    &s.about,
                    &s.title,
                    &s.details,
                    &s.link,
                    &s.contact,
                    &s.created_at.to_rfc3339(),
                ]));
            }
        }
        "contact" => {
            out.push(csv_row(&["name", "email", "college", "message", "sent_at"]));
            for m in state.submissions.contacts().await? {
                out.push(csv_row(&[
                    &m.name,
                    &m.email,
                    &m.college,
                    &m.message,
                    &m.created_at.to_rfc3339(),
                ]));
            }
        }
        other => anyhow::bail!(
            "unknown export '{other}'. Use waitlist, subscribers, suggestions or contact."
        ),
    }
    Ok(out.join("\n") + "\n")
}

/// `pnpm admin:password`: asks for the admin password twice (never shown, printed or
/// logged) and stores only its hash as `ADMIN_PASSWORD_HASH` in `api/.env`.
pub fn admin_password() -> anyhow::Result<()> {
    use crate::services::admin::{MIN_PASSWORD_LEN, hash_password};

    println!("Set the admin password for /admin.");
    println!("Use at least {MIN_PASSWORD_LEN} characters. Nothing shows while you type.");
    let password = loop {
        let first = rpassword::prompt_password("Password: ")
            .context("could not read the password (run this in a normal terminal)")?;
        if first.chars().count() < MIN_PASSWORD_LEN {
            println!("That's shorter than {MIN_PASSWORD_LEN} characters. Try again.");
            continue;
        }
        let again = rpassword::prompt_password("Same password again: ")
            .context("could not read the password")?;
        if first != again {
            println!("The two didn't match. Try again.");
            continue;
        }
        break first;
    };

    let hash = hash_password(&password)?;
    let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(".env");
    let existing = std::fs::read_to_string(&path).unwrap_or_default();
    let mut out: String = existing
        .lines()
        .filter(|l| {
            !l.trim_start().starts_with("ADMIN_PASSWORD_HASH=")
                && !l.starts_with("# Admin password hash")
        })
        .map(|l| format!("{l}\n"))
        .collect();
    if !out.is_empty() && !out.ends_with("\n\n") {
        out.push('\n');
    }
    // Single quotes: the hash contains '$', which .env loaders would otherwise expand.
    out.push_str("# Admin password hash (set with pnpm admin:password; never commit this file).\n");
    out.push_str(&format!("ADMIN_PASSWORD_HASH='{hash}'\n"));
    std::fs::write(&path, out).with_context(|| format!("could not write {}", path.display()))?;

    println!("Done. The password's hash is saved in api/.env (the password itself isn't stored).");
    println!("Sign in at http://localhost:3001/admin (just reload the page).");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::csv_row;

    #[test]
    fn csv_escapes_quotes_and_formulas() {
        assert_eq!(
            csv_row(&["a\"b", "=SUM(A1)", "+919876543210"]),
            "\"a\"\"b\",\"'=SUM(A1)\",\"+919876543210\""
        );
    }
}
