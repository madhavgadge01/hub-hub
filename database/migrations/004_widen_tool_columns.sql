-- Migration 004: Widen attribute & per_unit columns in tools directory schema
ALTER TABLE tool_pricing_plans 
ALTER COLUMN per_unit TYPE TEXT;

ALTER TABLE tool_pricing_plans 
ALTER COLUMN plan_type TYPE VARCHAR(100);

ALTER TABLE tool_pricing_plans 
ALTER COLUMN pricing_model TYPE VARCHAR(100);

ALTER TABLE tools 
ALTER COLUMN deployment_model TYPE VARCHAR(100);

ALTER TABLE tool_integrations 
ALTER COLUMN category TYPE VARCHAR(100);

ALTER TABLE tool_specifications 
ALTER COLUMN unit TYPE VARCHAR(100);

ALTER TABLE tool_tags 
ALTER COLUMN tag TYPE VARCHAR(100);
