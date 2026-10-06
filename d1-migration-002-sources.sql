-- Migration for the referrer/UTM + bot-filter stats (functions/api/hit.js,
-- functions/api/stats.js). Additive only: existing rows keep their data, the
-- new columns are just NULL for them. Run once in the D1 Console *before*
-- deploying the code that writes these columns.

ALTER TABLE events ADD COLUMN source     TEXT;  -- Google | YouTube | Instagram | TikTok | Newsletter | Direkt | Intern | Andere
ALTER TABLE events ADD COLUMN ref_host   TEXT;  -- referrer hostname only, e.g. 'l.instagram.com'
ALTER TABLE events ADD COLUMN utm_source TEXT;
ALTER TABLE events ADD COLUMN utm_medium TEXT;

-- Hits that were dropped instead of recorded, counted per day + reason:
-- 'self' (gl_notrack cookie), 'bot-cf' (Cloudflare bot signal), 'bot-ua'
-- (bot/crawler/headless User-Agent or navigator.webdriver).
CREATE TABLE IF NOT EXISTS filtered (
  day    TEXT NOT NULL,  -- YYYY-MM-DD (UTC)
  reason TEXT NOT NULL,
  n      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, reason)
);
