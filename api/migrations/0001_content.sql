-- Site content. Loaded from api/seed/*.json by `cargo run -- seed`.

CREATE TABLE tools (
    slug        TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    kind        TEXT NOT NULL CHECK (kind IN ('tool', 'library', 'package', 'mcp')),
    grp         TEXT NOT NULL CHECK (grp IN ('foundations', 'rag', 'agents', 'ship')),
    short       TEXT NOT NULL,
    plain       TEXT NOT NULL,
    use_when    TEXT NOT NULL,
    skip_when   TEXT NOT NULL,
    runs_on     TEXT NOT NULL,
    cost        TEXT NOT NULL,
    get_it      TEXT NOT NULL,
    status      TEXT NOT NULL CHECK (status IN ('using', 'notes', 'tested')),
    note        TEXT,
    position    INT  NOT NULL
);

CREATE TABLE tool_tags (
    tool_slug TEXT NOT NULL REFERENCES tools (slug) ON DELETE CASCADE,
    tag       TEXT NOT NULL,
    position  INT  NOT NULL,
    PRIMARY KEY (tool_slug, tag)
);

-- "Start here" persona chips on the homepage.
CREATE TABLE start_lists (
    slug     TEXT PRIMARY KEY,
    label    TEXT NOT NULL,
    position INT  NOT NULL
);

CREATE TABLE start_list_tools (
    list_slug TEXT NOT NULL REFERENCES start_lists (slug) ON DELETE CASCADE,
    tool_slug TEXT NOT NULL REFERENCES tools (slug) ON DELETE CASCADE,
    position  INT  NOT NULL,
    PRIMARY KEY (list_slug, tool_slug)
);

CREATE TABLE tracks (
    slug     TEXT PRIMARY KEY,
    name     TEXT NOT NULL,
    who      TEXT NOT NULL,
    tone     TEXT NOT NULL CHECK (tone IN ('light', 'dark')),
    blurb    TEXT NOT NULL,
    start_if TEXT NOT NULL,
    position INT  NOT NULL
);

CREATE TABLE dives (
    slug         TEXT PRIMARY KEY,
    track_slug   TEXT    NOT NULL REFERENCES tracks (slug) ON DELETE CASCADE,
    position     INT     NOT NULL,
    title        TEXT    NOT NULL,
    tldr         TEXT[]  NOT NULL,
    read_minutes INT,
    body         JSONB   NOT NULL DEFAULT '[]', -- typed blocks: paragraph, heading, compare, cards, callout, code
    try_it       JSONB,
    interview    JSONB,
    published    BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (track_slug, position)
);

CREATE TABLE dive_tools (
    dive_slug TEXT NOT NULL REFERENCES dives (slug) ON DELETE CASCADE,
    tool_slug TEXT NOT NULL REFERENCES tools (slug) ON DELETE CASCADE,
    position  INT  NOT NULL,
    PRIMARY KEY (dive_slug, tool_slug)
);

CREATE TABLE weekly_issues (
    number    INT PRIMARY KEY,
    week_of   DATE    NOT NULL,
    published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE verdicts (
    issue_number   INT  NOT NULL REFERENCES weekly_issues (number) ON DELETE CASCADE,
    position       INT  NOT NULL,
    name           TEXT NOT NULL,
    kind           TEXT NOT NULL CHECK (kind IN ('tool', 'library', 'package', 'mcp')),
    summary        TEXT NOT NULL,
    why            TEXT NOT NULL,
    best_for_label TEXT NOT NULL,
    best_for       TEXT NOT NULL,
    verdict        TEXT NOT NULL CHECK (verdict IN ('use', 'wait', 'skip')),
    qualifier      TEXT,
    tool_slug      TEXT REFERENCES tools (slug) ON DELETE SET NULL,
    PRIMARY KEY (issue_number, position)
);

CREATE TABLE categories (
    slug     TEXT PRIMARY KEY,
    label    TEXT NOT NULL,
    bg       TEXT NOT NULL,
    fg       TEXT NOT NULL,
    position INT  NOT NULL
);

CREATE TABLE posts (
    slug          TEXT PRIMARY KEY,
    category_slug TEXT  NOT NULL REFERENCES categories (slug),
    title         TEXT  NOT NULL,
    excerpt       TEXT  NOT NULL,
    cover         JSONB NOT NULL,
    featured      JSONB,
    dive_slug     TEXT REFERENCES dives (slug) ON DELETE SET NULL,
    body          JSONB NOT NULL DEFAULT '[]',
    published_on  DATE  NOT NULL
);
CREATE INDEX posts_published_on ON posts (published_on DESC);

CREATE TABLE challenges (
    slug       TEXT PRIMARY KEY,
    status     TEXT    NOT NULL,
    goal       INT     NOT NULL,
    title      TEXT    NOT NULL,
    blurb      TEXT    NOT NULL,
    facts      JSONB   NOT NULL,
    date_text  TEXT    NOT NULL,
    time_text  TEXT    NOT NULL,
    meet_link  TEXT    NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE
);
-- Only one challenge is shown on /challenge at a time.
CREATE UNIQUE INDEX challenges_one_current ON challenges (is_current) WHERE is_current;

CREATE TABLE past_projects (
    slug        TEXT PRIMARY KEY,
    name        TEXT   NOT NULL,
    eyebrow     TEXT   NOT NULL,
    category    TEXT   NOT NULL,
    title       TEXT   NOT NULL,
    description TEXT   NOT NULL,
    tags        TEXT[] NOT NULL,
    cover       JSONB  NOT NULL,
    position    INT    NOT NULL
);
