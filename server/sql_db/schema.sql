-- USERS (case-sensitive email)
CREATE TABLE IF NOT EXISTS users (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT      NOT NULL UNIQUE,  -- case-sensitive uniqueness
  password   TEXT      NOT NULL,         -- store a HASH (e.g., bcrypt/argon2), not raw
  first_name TEXT      NOT NULL,
  last_name  TEXT      NOT NULL
);

-- One status row per user (keyed by user ID)
CREATE TABLE IF NOT EXISTS user_statuses (
  user_id    BIGINT PRIMARY KEY
             REFERENCES users(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,              -- e.g., 'working', 'on_vacation', 'remote'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional helper index if you often filter by status
CREATE INDEX IF NOT EXISTS idx_user_statuses_status ON user_statuses(status);
