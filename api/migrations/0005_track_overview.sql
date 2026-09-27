-- A track can carry its big picture: target roles, stages grouped into phases,
-- and how to check you're learning. Stage mistakes and project checks live in
-- the existing stages JSON.
ALTER TABLE tracks ADD COLUMN overview JSONB;
