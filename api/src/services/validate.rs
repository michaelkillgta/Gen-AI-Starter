//! Input checks for the forms. Each returns the cleaned value or a friendly message.

pub fn name(raw: &str) -> Result<String, &'static str> {
    let v = collapse_spaces(raw);
    match v.chars().count() {
        0 => Err("Please enter your name."),
        1 => Err("Please enter your full name."),
        n if n > 80 => Err("That name is too long."),
        _ if v.chars().any(|c| c.is_control() || "<>{}".contains(c)) => Err("Please use letters only."),
        _ => Ok(v),
    }
}

/// Indian mobile numbers become +91XXXXXXXXXX. Other countries need a leading +.
pub fn phone(raw: &str) -> Result<String, &'static str> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err("Please enter your WhatsApp number.");
    }
    if trimmed.chars().any(|c| !(c.is_ascii_digit() || " +-().".contains(c))) {
        return Err("Use digits only, for example +91 98765 43210.");
    }
    let plus = trimmed.starts_with('+');
    let digits: String = trimmed.chars().filter(|c| c.is_ascii_digit()).collect();

    let indian = |d: &str| d.len() == 10 && matches!(d.as_bytes()[0], b'6'..=b'9');
    let local = if !plus && digits.len() == 11 && digits.starts_with('0') {
        &digits[1..]
    } else if digits.len() == 12 && digits.starts_with("91") {
        &digits[2..]
    } else if !plus {
        &digits[..]
    } else {
        ""
    };
    if indian(local) {
        return Ok(format!("+91{local}"));
    }
    if plus && (8..=15).contains(&digits.len()) && !digits.starts_with("91") {
        return Ok(format!("+{digits}"));
    }
    Err("Enter a 10-digit mobile number, for example 98765 43210.")
}

pub fn email(raw: &str) -> Result<String, &'static str> {
    let v = raw.trim().to_lowercase();
    if v.is_empty() {
        return Err("Please enter your email.");
    }
    let Some((local, domain)) = v.split_once('@') else {
        return Err("That email doesn't look right.");
    };
    let ok = v.len() <= 254
        && !local.is_empty()
        && local.len() <= 64
        && !domain.contains('@')
        && domain.contains('.')
        && !domain.starts_with('.')
        && !domain.ends_with('.')
        && !domain.contains("..")
        && v.chars().all(|c| !c.is_whitespace() && !c.is_control());
    if ok { Ok(v) } else { Err("That email doesn't look right.") }
}

/// Optional free text: trimmed, capped in length.
pub fn text(raw: &str, max: usize, what: &'static str) -> Result<String, &'static str> {
    let v = raw.trim().to_string();
    if v.chars().count() > max {
        return Err(what);
    }
    Ok(v)
}

pub fn url(raw: &str) -> Result<String, &'static str> {
    let v = raw.trim();
    if v.is_empty() {
        return Ok(String::new());
    }
    let with_scheme = if v.starts_with("http://") || v.starts_with("https://") {
        v.to_string()
    } else {
        format!("https://{v}")
    };
    if with_scheme.len() > 500 || with_scheme.contains(char::is_whitespace) || !with_scheme[8..].contains('.') {
        return Err("That link doesn't look right.");
    }
    Ok(with_scheme)
}

fn collapse_spaces(s: &str) -> String {
    s.split_whitespace().collect::<Vec<_>>().join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn indian_numbers_normalise() {
        for input in ["98765 43210", "+91 98765-43210", "919876543210", "09876543210", "(987) 654-3210"] {
            assert_eq!(phone(input).unwrap(), "+919876543210", "{input}");
        }
    }

    #[test]
    fn bad_numbers_are_rejected() {
        for input in ["", "12345", "5876543210", "+91 12345 67890", "98765abc10", "+91"] {
            assert!(phone(input).is_err(), "{input}");
        }
    }

    #[test]
    fn international_needs_plus() {
        assert_eq!(phone("+44 7700 900123").unwrap(), "+447700900123");
    }

    #[test]
    fn emails() {
        assert_eq!(email(" Uma@Example.COM ").unwrap(), "uma@example.com");
        for bad in ["", "uma", "uma@", "@x.com", "uma@x", "a b@x.com", "uma@x..com"] {
            assert!(email(bad).is_err(), "{bad}");
        }
    }

    #[test]
    fn names() {
        assert_eq!(name("  Uma   K ").unwrap(), "Uma K");
        assert!(name("U").is_err());
        assert!(name("<script>").is_err());
    }

    #[test]
    fn urls() {
        assert_eq!(url("github.com/x/y").unwrap(), "https://github.com/x/y");
        assert!(url("not a link").is_err());
        assert_eq!(url("").unwrap(), "");
    }
}
