-- A post can list "what you'll learn" points; covers can carry an image (inside the cover JSON).
ALTER TABLE posts ADD COLUMN learn JSONB NOT NULL DEFAULT '[]';
