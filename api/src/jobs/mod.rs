//! Command-line jobs run with `cargo run -- <job>`:
//!
//! - `seed`: load `api/seed/*.json` into Postgres (safe to repeat; never touches signups).
//! - `import-files`: copy form submissions from `api/data/*.json` into Postgres,
//!   keeping waitlist positions (safe to repeat).
//! - `export <waitlist|subscribers|suggestions|contact>`: CSV to stdout. The only
//!   way to read personal data out; no endpoint exposes it.

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
