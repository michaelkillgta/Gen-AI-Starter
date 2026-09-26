-- Form submissions. Personal data: never returned by a public endpoint.

CREATE TABLE waitlist_signups (
    id             UUID PRIMARY KEY,
    challenge_slug TEXT        NOT NULL REFERENCES challenges (slug),
    position       INT         NOT NULL,
    name           TEXT        NOT NULL,
    phone          TEXT        NOT NULL, -- normalised, e.g. +919876543210
    email          TEXT        NOT NULL, -- lower-cased
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (challenge_slug, phone),
    UNIQUE (challenge_slug, email),
    UNIQUE (challenge_slug, position)
);

CREATE TABLE subscribers (
    id         UUID PRIMARY KEY,
    kind       TEXT        NOT NULL CHECK (kind IN ('phone', 'email')),
    value      TEXT        NOT NULL UNIQUE,
    source     TEXT        NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE suggestions (
    id         UUID PRIMARY KEY,
    about      TEXT        NOT NULL,
    title      TEXT        NOT NULL,
    details    TEXT        NOT NULL DEFAULT '',
    link       TEXT        NOT NULL DEFAULT '',
    contact    TEXT        NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contact_messages (
    id         UUID PRIMARY KEY,
    name       TEXT        NOT NULL,
    email      TEXT        NOT NULL,
    college    TEXT        NOT NULL DEFAULT '',
    message    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
