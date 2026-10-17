-- Migration 006: Admin Control Center, Audit Logs, and Internship Certificate Schema
-- Non-destructive additions to support Admin operations and Secure Internship Certificates

-- 1. Extend users table with account status & suspension fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Internship Certificate Eligibility Table
CREATE TABLE IF NOT EXISTS internship_certificate_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_title VARCHAR(255) NOT NULL, -- e.g. 'Software Engineering Intern'
  organization VARCHAR(255) NOT NULL DEFAULT 'Kruu',
  start_date DATE,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'eligible', -- 'eligible', 'payment_pending', 'paid', 'issued', 'revoked'
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, program_title)
);

CREATE INDEX IF NOT EXISTS idx_cert_eligibility_user ON internship_certificate_eligibility(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_eligibility_status ON internship_certificate_eligibility(status);

-- 3. Certificate Payment Orders Table (Authoritative ₹100 payment orders)
CREATE TABLE IF NOT EXISTS certificate_payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference VARCHAR(100) UNIQUE NOT NULL, -- 'ord_cert_...'
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  eligibility_id UUID NOT NULL REFERENCES internship_certificate_eligibility(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 10000, -- Authoritative 100 INR in paise
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'created', -- 'created', 'paid', 'failed', 'refunded'
  razorpay_order_id VARCHAR(100) UNIQUE,
  razorpay_payment_id VARCHAR(100),
  refund_reference VARCHAR(100),
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_orders_user ON certificate_payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_orders_eligibility ON certificate_payment_orders(eligibility_id);
CREATE INDEX IF NOT EXISTS idx_cert_orders_status ON certificate_payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_cert_orders_rzp_order ON certificate_payment_orders(razorpay_order_id);

-- 4. Issued Internship Certificates Table
CREATE TABLE IF NOT EXISTS internship_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'KRUU-CERT-2026-A1B2C3'
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  eligibility_id UUID NOT NULL REFERENCES internship_certificate_eligibility(id) ON DELETE CASCADE,
  payment_order_id UUID REFERENCES certificate_payment_orders(id) ON DELETE SET NULL,
  recipient_name VARCHAR(255) NOT NULL,
  program_title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL DEFAULT 'Kruu',
  start_date DATE,
  completion_date DATE NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  verification_code VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'valid', -- 'valid', 'revoked'
  download_count INTEGER NOT NULL DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON internship_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON internship_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON internship_certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON internship_certificates(status);

-- 5. Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_email VARCHAR(255),
  action VARCHAR(100) NOT NULL, -- 'user_suspend', 'user_reactivate', 'grant_certificate_eligibility', 'revoke_certificate_eligibility', etc.
  target_type VARCHAR(100) NOT NULL, -- 'user', 'certificate', 'api_key', 'api_product', 'payment', 'report'
  target_id VARCHAR(255),
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_target ON admin_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_logs(created_at DESC);
