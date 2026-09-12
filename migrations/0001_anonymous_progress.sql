CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  alias TEXT NOT NULL COLLATE NOCASE UNIQUE,
  recovery_code_hash TEXT NOT NULL,
  session_token_hash TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  profile_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  score INTEGER,
  xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (profile_id, lesson_id),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
