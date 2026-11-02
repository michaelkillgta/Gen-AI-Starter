-- The website now reads and writes the database itself from short-lived serverless
-- functions (Vercel), so what the Rust API used to keep in memory lives here.

-- Admin sign-ins. Only a SHA-256 of each session token is stored.
CREATE TABLE admin_sessions (
    token_hash TEXT PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Wrong admin passwords per visitor IP, for the 15-minute lockout.
CREATE TABLE admin_login_fails (
    ip           TEXT PRIMARY KEY,
    count        INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ
);

-- Form posts per visitor IP, for the per-minute rate limit.
CREATE TABLE form_hits (
    ip TEXT        NOT NULL,
    at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX form_hits_ip_at ON form_hits (ip, at);

-- Supabase publishes every table in "public" through its auto-generated REST API.
-- Row level security with no policies closes that door for the public keys; the
-- site connects as the tables' owner, which RLS doesn't restrict.
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END
$$;
