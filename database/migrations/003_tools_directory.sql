-- Migration 003: Tools Directory & Software Discovery Platform Schema
-- Non-destructive: adds new normalized tables and indexes for Section 1 Tools Directory

-- 1. Ensure role column on users table for admin authorization
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

-- 2. Tool Categories Table
CREATE TABLE IF NOT EXISTS tool_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_categories_slug ON tool_categories(slug);
CREATE INDEX IF NOT EXISTS idx_tool_categories_active ON tool_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_tool_categories_name ON tool_categories(name ASC);

-- 3. Tools Table
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES tool_categories(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  icon_url TEXT NOT NULL,
  short_description TEXT NOT NULL,
  overview TEXT,
  main_purpose TEXT,
  typical_use_cases TEXT[] DEFAULT '{}',
  intended_audience TEXT,
  deployment_model VARCHAR(50) DEFAULT 'Cloud',
  official_website_url TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_is_published ON tools(is_published);
CREATE INDEX IF NOT EXISTS idx_tools_published_at ON tools(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_provider ON tools(provider_name);
CREATE INDEX IF NOT EXISTS idx_tools_name ON tools(name ASC);

-- 4. Tool Pricing Plans Table
CREATE TABLE IF NOT EXISTS tool_pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) NOT NULL,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'subscription', -- 'free', 'subscription', 'usage_based', 'per_seat', 'custom'
  amount NUMERIC(10, 2) DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'month', -- 'day', 'month', 'year', 'usage', 'one_time'
  interval_count INTEGER DEFAULT 1,
  pricing_model VARCHAR(50) NOT NULL DEFAULT 'subscription', -- 'free', 'flat_rate', 'per_seat', 'usage_based', 'custom'
  per_unit VARCHAR(50), -- e.g. 'seat', '10,000 emails', '1,000 loads'
  minimum_commitment TEXT,
  free_tier_available BOOLEAN NOT NULL DEFAULT FALSE,
  pricing_source_url TEXT,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_pricing_plans_tool_id ON tool_pricing_plans(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_pricing_plans_amount ON tool_pricing_plans(amount);
CREATE INDEX IF NOT EXISTS idx_tool_pricing_plans_interval ON tool_pricing_plans(billing_interval);
CREATE INDEX IF NOT EXISTS idx_tool_pricing_plans_free_tier ON tool_pricing_plans(free_tier_available);

-- 5. Tool Features Table
CREATE TABLE IF NOT EXISTS tool_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  group_name VARCHAR(100) DEFAULT 'Core Features',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  source_url TEXT,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_features_tool_id ON tool_features(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_features_group ON tool_features(group_name);

-- 6. Tool Integrations Table
CREATE TABLE IF NOT EXISTS tool_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  integration_url TEXT,
  category VARCHAR(50) DEFAULT 'SDK', -- 'SDK', 'Language', 'Cloud', 'Framework', 'Service'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_integrations_tool_id ON tool_integrations(tool_id);

-- 7. Tool Specifications Table (Flexible Category-Specific Technical Specs)
CREATE TABLE IF NOT EXISTS tool_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  attribute_key VARCHAR(100) NOT NULL,
  attribute_label VARCHAR(100) NOT NULL,
  attribute_value TEXT NOT NULL,
  value_type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'quota'
  unit VARCHAR(50),
  group_name VARCHAR(100) DEFAULT 'Technical Specifications',
  source_url TEXT,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_specifications_tool_id ON tool_specifications(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_specifications_key ON tool_specifications(attribute_key);

-- 8. Tool Pros & Cons Table
CREATE TABLE IF NOT EXISTS tool_pros_cons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('pro', 'con')),
  content TEXT NOT NULL,
  source_url TEXT,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_pros_cons_tool_id ON tool_pros_cons(tool_id);

-- 9. Tool Security & Compliance Table
CREATE TABLE IF NOT EXISTS tool_security_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID UNIQUE NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  auth_methods TEXT[] DEFAULT '{}',
  encryption_in_transit TEXT,
  encryption_at_rest TEXT,
  data_residency TEXT,
  certifications TEXT[] DEFAULT '{}',
  security_doc_url TEXT,
  privacy_policy_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_security_tool_id ON tool_security_compliance(tool_id);

-- 10. Tool Resources Table
CREATE TABLE IF NOT EXISTS tool_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- 'documentation', 'api_reference', 'pricing', 'status', 'privacy', 'security'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_resources_tool_id ON tool_resources(tool_id);

-- 11. Tool Tags Table
CREATE TABLE IF NOT EXISTS tool_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_tool_tags_tag ON tool_tags(tag);
CREATE INDEX IF NOT EXISTS idx_tool_tags_tool_id ON tool_tags(tool_id);
