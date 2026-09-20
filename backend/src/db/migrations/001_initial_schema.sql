CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  refresh_token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
ON sessions(user_id);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  key_prefix VARCHAR(30) NOT NULL,
  key_hash TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id
ON api_keys(user_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_prefix
ON api_keys(key_prefix);

CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  api_key_id UUID NOT NULL
    REFERENCES api_keys(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  endpoint TEXT NOT NULL,
  method VARCHAR(10) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_api_key_id
ON api_usage(api_key_id);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id
ON api_usage(user_id);

CREATE INDEX IF NOT EXISTS idx_api_usage_created_at
ON api_usage(created_at);