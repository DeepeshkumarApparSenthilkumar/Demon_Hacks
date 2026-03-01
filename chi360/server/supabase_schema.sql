-- =============================================
-- chi360 Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS TABLE ──────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  name            TEXT,
  area            TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  totp_secret     TEXT,           -- encrypted TOTP secret
  totp_enabled    BOOLEAN DEFAULT FALSE,
  totp_verified   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── SESSIONS TABLE ────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL,          -- hashed JWT token
  device_info     TEXT,                   -- user agent
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_active     TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  is_revoked      BOOLEAN DEFAULT FALSE
);

-- ── LOGIN HISTORY TABLE ───────────────────────
CREATE TABLE IF NOT EXISTS login_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,          -- store even for failed attempts
  ip_address      TEXT,
  device_info     TEXT,
  location        TEXT,                   -- geo-resolved city
  status          TEXT NOT NULL CHECK (status IN ('success', 'failed', 'blocked', '2fa_required', '2fa_failed')),
  failure_reason  TEXT,                   -- e.g. 'wrong_password', 'rate_limited'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── RATE LIMIT TABLE (fallback if no Redis) ───
CREATE TABLE IF NOT EXISTS rate_limits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key             TEXT NOT NULL UNIQUE,   -- e.g. "login:ip:1.2.3.4"
  attempts        INTEGER DEFAULT 1,
  window_start    TIMESTAMPTZ DEFAULT NOW(),
  blocked_until   TIMESTAMPTZ
);

-- ── TOTP BACKUP CODES TABLE ───────────────────
CREATE TABLE IF NOT EXISTS totp_backup_codes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash       TEXT NOT NULL,          -- bcrypt hashed backup code
  used            BOOLEAN DEFAULT FALSE,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_email ON login_history(email);
CREATE INDEX IF NOT EXISTS idx_login_history_ip ON login_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);

-- ── AUTO-UPDATE updated_at ────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE totp_backup_codes ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by our backend)
-- Anon/auth roles cannot access these tables directly

-- ── CLEANUP FUNCTION (run periodically) ───────
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW() OR is_revoked = TRUE;
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup every hour (requires pg_cron extension in Supabase)
-- SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions()');
