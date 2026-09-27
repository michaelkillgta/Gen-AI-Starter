-- Tracks become step-by-step plans: each track holds its stages (with curated
-- resources, a project and a checklist) and every deep dive belongs to a stage.
ALTER TABLE tracks ADD COLUMN duration TEXT NOT NULL DEFAULT '';
ALTER TABLE tracks ADD COLUMN stages JSONB NOT NULL DEFAULT '[]';
ALTER TABLE dives ADD COLUMN stage TEXT NOT NULL DEFAULT '';
