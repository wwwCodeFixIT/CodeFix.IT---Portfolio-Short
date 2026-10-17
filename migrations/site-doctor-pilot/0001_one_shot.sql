-- LAB-9 private pilot: one global claim across all Cloudflare Pages instances.
-- Provision and bind a D1 database before turning on SITE_DOCTOR_PILOT_ENABLED.
-- Run this migration exactly once. No automatic deletion/reset.
CREATE TABLE IF NOT EXISTS site_doctor_pilot_claims (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  claimed_at TEXT NOT NULL
);

-- Atomic claim performed by Pages Function:
-- INSERT OR IGNORE INTO site_doctor_pilot_claims
--   (id, claimed_at) VALUES (1, datetime('now'));
-- meta.changes = 1 => first attempt, 0 => already consumed.
--
-- Never DELETE the record to "retry" automatically, even after timeout.
