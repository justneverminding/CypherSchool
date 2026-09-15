CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  certificate_hash TEXT NOT NULL UNIQUE,
  profile_id TEXT NOT NULL UNIQUE,
  issued_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS certificates_issued_at_idx
ON certificates (issued_at DESC);
