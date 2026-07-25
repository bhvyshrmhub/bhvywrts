-- Analytics: Visit tracking table
-- Run this SQL in your Supabase SQL Editor to create the table.

CREATE TABLE IF NOT EXISTS "Visit" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '/',
  story_slug TEXT,
  category TEXT,
  device TEXT NOT NULL DEFAULT 'desktop',
  browser TEXT NOT NULL DEFAULT 'unknown',
  country TEXT,
  referrer TEXT NOT NULL DEFAULT 'direct',
  is_returning BOOLEAN NOT NULL DEFAULT false,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_visit_created_at ON "Visit" (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_page ON "Visit" (page);
CREATE INDEX IF NOT EXISTS idx_visit_story_slug ON "Visit" (story_slug);
CREATE INDEX IF NOT EXISTS idx_visit_device ON "Visit" (device);
CREATE INDEX IF NOT EXISTS idx_visit_visitor_id ON "Visit" (visitor_id);
CREATE INDEX IF NOT EXISTS idx_visit_date ON "Visit" (created_at);

-- Row-level security: only service role can access
ALTER TABLE "Visit" ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role key only (API routes use service role)
CREATE POLICY "Service role full access" ON "Visit"
  USING (true)
  WITH CHECK (true);
