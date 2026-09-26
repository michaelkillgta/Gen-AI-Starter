//! Command-line jobs run with `cargo run -- <job>`.
//!
//! `export <waitlist|subscribers|suggestions|contact>` prints a CSV of form
//! submissions to stdout, e.g. `cargo run -- export waitlist > waitlist.csv`.
//! This is the only way to read personal data out; no endpoint exposes it.

use crate::state::AppState;

fn csv_row(cells: &[&str]) -> String {
    cells
        .iter()
        .map(|c| {
            // Quote everything, and defuse spreadsheet formulas.
            let c = if c.starts_with(['=', '+', '-', '@']) && !c.starts_with("+91") { format!("'{c}") } else { c.to_string() };
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
            out.push(csv_row(&["position", "name", "phone", "email", "joined_at"]));
            for e in state.submissions.waitlist(&challenge.slug).await? {
                out.push(csv_row(&[&e.position.to_string(), &e.name, &e.phone, &e.email, &e.created_at.to_rfc3339()]));
            }
        }
        "subscribers" => {
            out.push(csv_row(&["kind", "contact", "source", "joined_at"]));
            for s in state.submissions.subscribers().await? {
                let kind = serde_json::to_value(&s.kind)?.as_str().unwrap_or_default().to_string();
                out.push(csv_row(&[&kind, &s.value, &s.source, &s.created_at.to_rfc3339()]));
            }
        }
        "suggestions" => {
            out.push(csv_row(&["about", "title", "details", "link", "contact", "sent_at"]));
            for s in state.submissions.suggestions().await? {
                out.push(csv_row(&[&s.about, &s.title, &s.details, &s.link, &s.contact, &s.created_at.to_rfc3339()]));
            }
        }
        "contact" => {
            out.push(csv_row(&["name", "email", "college", "message", "sent_at"]));
            for m in state.submissions.contacts().await? {
                out.push(csv_row(&[&m.name, &m.email, &m.college, &m.message, &m.created_at.to_rfc3339()]));
            }
        }
        other => anyhow::bail!("unknown export '{other}'. Use waitlist, subscribers, suggestions or contact."),
    }
    Ok(out.join("\n") + "\n")
}

#[cfg(test)]
mod tests {
    use super::csv_row;

    #[test]
    fn csv_escapes_quotes_and_formulas() {
        assert_eq!(csv_row(&["a\"b", "=SUM(A1)", "+919876543210"]), "\"a\"\"b\",\"'=SUM(A1)\",\"+919876543210\"");
    }
}
