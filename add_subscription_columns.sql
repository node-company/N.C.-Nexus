-- Add Subscription Columns to Company Settings
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

-- Index for performance
CREATE INDEX IF NOT EXISTS company_settings_subscription_status_idx ON company_settings(subscription_status);
