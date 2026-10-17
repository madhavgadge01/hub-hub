-- Migration 007: Production-Ready Authentication System Upgrade
-- Non-destructive schema additions for Email Verification, Secure OTPs, Password Reset Authorizations, and Google OAuth

-- 1. Extend users table for email verification status and Google OAuth provider
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- Allow password_hash to be NULL for pure Google OAuth accounts
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id 
ON users(google_id) 
WHERE google_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_email_verified 
ON users(email_verified);

-- 2. Verification OTPs table (for Registration and Password Reset OTPs)
CREATE TABLE IF NOT EXISTS verification_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_hash TEXT NOT NULL,
  purpose VARCHAR(50) NOT NULL, -- 'registration', 'password_reset'
  metadata JSONB NOT NULL DEFAULT '{}',
  attempts_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  resend_available_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '60 seconds'),
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_otps_lookup 
ON verification_otps(email, purpose, is_used);

CREATE INDEX IF NOT EXISTS idx_verification_otps_expires 
ON verification_otps(expires_at);

-- 3. Password Reset Authorizations table (Single-use short-lived authorization after OTP verification)
CREATE TABLE IF NOT EXISTS password_reset_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pwd_reset_auth_user 
ON password_reset_authorizations(user_id, is_used);

CREATE INDEX IF NOT EXISTS idx_pwd_reset_auth_token 
ON password_reset_authorizations(token_hash);

-- 4. OAuth CSRF State Verification Table
CREATE TABLE IF NOT EXISTS oauth_states (
  state VARCHAR(255) PRIMARY KEY,
  redirect_uri TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_expires 
ON oauth_states(expires_at);

-- 5. Extend email_outbox table with text_content column for multi-part plain-text email alternatives
ALTER TABLE email_outbox 
ADD COLUMN IF NOT EXISTS text_content TEXT;
