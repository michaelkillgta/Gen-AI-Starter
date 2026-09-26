-- pgvector, for semantic search later. Installed only where the extension is
-- available (the Docker image and production have it; the local embedded
-- Postgres on this laptop does not), so the migration never fails.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector') THEN
        CREATE EXTENSION IF NOT EXISTS vector;
    END IF;
END
$$;
