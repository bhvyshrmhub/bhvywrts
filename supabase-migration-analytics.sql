-- Run this SQL in the Supabase SQL Editor to create the Visit table for analytics
-- Table: "Visit"

CREATE TABLE IF NOT EXISTS "Visit" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'Desktop',
  browser TEXT NOT NULL DEFAULT 'Unknown',
  country TEXT DEFAULT 'Unknown',
  region TEXT DEFAULT 'Unknown',
  referrer TEXT DEFAULT 'Direct',
  is_new_visitor BOOLEAN DEFAULT true,
  visitor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visit_date ON "Visit" (date);
CREATE INDEX IF NOT EXISTS idx_visit_page ON "Visit" (page);
CREATE INDEX IF NOT EXISTS idx_visit_device_type ON "Visit" (device_type);
CREATE INDEX IF NOT EXISTS idx_visit_created_at ON "Visit" (created_at);
CREATE INDEX IF NOT EXISTS idx_visit_visitor_id ON "Visit" (visitor_id);
