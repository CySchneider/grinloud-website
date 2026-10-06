-- One-time setup: paste this into the D1 database's Console tab in the
-- Cloudflare dashboard (Workers & Pages -> D1 -> your database -> Console)
-- and run it once, after creating the database and before the first deploy
-- that uses functions/api/hit.js and functions/api/stats.js.
-- See functions/api/hit.js for the full setup steps.

CREATE TABLE IF NOT EXISTS events (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      TEXT NOT NULL,     -- ISO timestamp
  type    TEXT NOT NULL,     -- 'view' | 'play'
  path    TEXT,              -- e.g. /pick/2026-09-11/
  track   TEXT,              -- Spotify preview URL, only set for 'play'
  country TEXT,              -- 2-letter country code from Cloudflare, e.g. 'CH'
  source     TEXT,           -- bucket, see classifySource() in functions/api/hit.js
  ref_host   TEXT,           -- referrer hostname only
  utm_source TEXT,
  utm_medium TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_type_ts ON events(type, ts);

CREATE TABLE IF NOT EXISTS filtered (
  day    TEXT NOT NULL,      -- YYYY-MM-DD (UTC)
  reason TEXT NOT NULL,      -- 'self' | 'bot-cf' | 'bot-ua'
  n      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, reason)
);
