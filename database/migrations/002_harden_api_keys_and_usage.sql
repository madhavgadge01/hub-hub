-- Migration 002: Harden API keys and usage tracking schema
-- Non-destructive changes that preserve all existing records

-- 1. Add hash_algorithm column to api_keys to distinguish legacy bcrypt from modern sha256
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS hash_algorithm VARCHAR(20) NOT NULL DEFAULT 'bcrypt';

-- 2. Enhance api_usage table with status_code and latency tracking
ALTER TABLE api_usage 
ADD COLUMN IF NOT EXISTS status_code INTEGER DEFAULT 200;

ALTER TABLE api_usage 
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER DEFAULT 0;

-- 3. Add last_login_at to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 4. Create performance indexes for key lookups and active user queries
CREATE INDEX IF NOT EXISTS idx_api_keys_user_revoked 
ON api_keys(user_id, revoked_at);

CREATE INDEX IF NOT EXISTS idx_api_usage_created_at_api_key 
ON api_usage(api_key_id, created_at DESC);
