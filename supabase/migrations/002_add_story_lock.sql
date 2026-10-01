-- Add password protection support to stories.
-- Safe for existing stories: all existing rows remain public.

ALTER TABLE "Story"
ADD COLUMN IF NOT EXISTS "isLocked" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Story"
ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

COMMENT ON COLUMN "Story"."isLocked"
IS 'Whether this story requires a password to read.';

COMMENT ON COLUMN "Story"."passwordHash"
IS 'Secure bcrypt hash for the story password. Never store the plaintext password.';