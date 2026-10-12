-- Migration 005: API Marketplace, Entitlements, Checkout, Analytics & User Profile Schema
-- Non-destructive additions to support Section 2 API Marketplace

-- 1. Extend users table with avatar selection
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(100) NOT NULL DEFAULT '/avatars/avatar-1.svg';

-- 2. API Product Categories Table
CREATE TABLE IF NOT EXISTS api_product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_name VARCHAR(100) DEFAULT 'Sparkles',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_categories_slug ON api_product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_api_categories_active ON api_product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_api_categories_sort ON api_product_categories(sort_order ASC, name ASC);

-- 3. API Products Table
CREATE TABLE IF NOT EXISTS api_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES api_product_categories(id) ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  overview TEXT,
  provider_name VARCHAR(100) NOT NULL DEFAULT 'Hub&Hub Edge',
  icon_url TEXT NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT 'v1.0.0',
  status VARCHAR(50) NOT NULL DEFAULT 'published', -- 'published', 'draft', 'archived'
  playground_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  playground_auth_required BOOLEAN NOT NULL DEFAULT FALSE,
  base_url VARCHAR(255) NOT NULL DEFAULT '/api/v1',
  endpoint_path VARCHAR(255) NOT NULL, -- e.g. '/qr', '/url-metadata', '/json-validator'
  http_method VARCHAR(10) NOT NULL DEFAULT 'POST',
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  documentation JSONB NOT NULL DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_products_slug ON api_products(slug);
CREATE INDEX IF NOT EXISTS idx_api_products_category ON api_products(category_id);
CREATE INDEX IF NOT EXISTS idx_api_products_status ON api_products(status);
CREATE INDEX IF NOT EXISTS idx_api_products_published ON api_products(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_products_name ON api_products(name ASC);

-- 4. API Plans Table (Authoritative pricing & quotas)
CREATE TABLE IF NOT EXISTS api_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_product_id UUID NOT NULL REFERENCES api_products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- 'Free Starter', 'Developer Pro', 'Enterprise'
  description TEXT,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'prepaid', -- 'free', 'prepaid', 'subscription'
  price_amount INTEGER NOT NULL DEFAULT 0, -- Minor units (e.g. cents / paise, 0 for free)
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'month', -- 'one_time', 'month', 'year'
  included_requests INTEGER NOT NULL DEFAULT 1000,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 120,
  overage_policy VARCHAR(50) NOT NULL DEFAULT 'hard_stop', -- 'hard_stop', 'metered'
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_plans_product_id ON api_plans(api_product_id);
CREATE INDEX IF NOT EXISTS idx_api_plans_is_active ON api_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_api_plans_price ON api_plans(price_amount ASC);
CREATE INDEX IF NOT EXISTS idx_api_plans_sort ON api_plans(sort_order ASC);

-- 5. Payment Orders Table (Authoritative pending/completed checkout orders)
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference VARCHAR(100) UNIQUE NOT NULL, -- 'ord_hh_...'
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_product_id UUID NOT NULL REFERENCES api_products(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES api_plans(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL, -- Authoritative minor units from api_plans
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'created', -- 'created', 'paid', 'failed', 'cancelled'
  razorpay_order_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_rzp_order ON payment_orders(razorpay_order_id);

-- 6. User Purchases Table (Durable historical record of paid entitlements)
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_reference VARCHAR(100) UNIQUE NOT NULL, -- 'pur_...'
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_product_id UUID NOT NULL REFERENCES api_products(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES api_plans(id) ON DELETE RESTRICT,
  payment_order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,
  payment_reference VARCHAR(255), -- razorpay_payment_id
  amount_paid INTEGER NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'paid', -- 'pending', 'paid', 'failed', 'refunded'
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_purchases_product_id ON user_purchases(api_product_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(status);
CREATE INDEX IF NOT EXISTS idx_user_purchases_payment_ref ON user_purchases(payment_reference);

-- 7. User API Entitlements Table (Active rights granting developer access)
CREATE TABLE IF NOT EXISTS user_api_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL UNIQUE REFERENCES user_purchases(id) ON DELETE CASCADE,
  api_product_id UUID NOT NULL REFERENCES api_products(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES api_plans(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'expired'
  requests_quota INTEGER NOT NULL,
  requests_used INTEGER NOT NULL DEFAULT 0,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user_product ON user_api_entitlements(user_id, api_product_id, status);
CREATE INDEX IF NOT EXISTS idx_entitlements_status ON user_api_entitlements(status);

-- 8. Payment Webhook Events Table (Auditing & Idempotency)
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL DEFAULT 'razorpay',
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'processed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_event_id ON payment_events(event_id);

-- 9. Extend api_keys Table with Entitlement Association
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS entitlement_id UUID REFERENCES user_api_entitlements(id) ON DELETE SET NULL;

ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS api_product_id UUID REFERENCES api_products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_api_keys_entitlement ON api_keys(entitlement_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_product ON api_keys(api_product_id);

-- 10. Extend api_usage Table with Product & Entitlement Tracking
ALTER TABLE api_usage 
ADD COLUMN IF NOT EXISTS api_product_id UUID REFERENCES api_products(id) ON DELETE SET NULL;

ALTER TABLE api_usage 
ADD COLUMN IF NOT EXISTS entitlement_id UUID REFERENCES user_api_entitlements(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_api_usage_product_id ON api_usage(api_product_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_product ON api_usage(user_id, api_product_id, created_at DESC);

-- 11. Transactional Email Outbox Table (Brevo Durable Delivery)
CREATE TABLE IF NOT EXISTS email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(100),
  template_type VARCHAR(100) NOT NULL, -- 'purchase_confirmation'
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'config_missing'
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 5,
  last_error TEXT,
  reference_id VARCHAR(255), -- purchase_reference or order_reference for idempotency
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reference_id, template_type)
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_status ON email_outbox(status);
CREATE INDEX IF NOT EXISTS idx_email_outbox_reference ON email_outbox(reference_id);
