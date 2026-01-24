-- Add subscription columns to company_settings
alter table company_settings
add column if not exists subscription_status text check (subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')),
add column if not exists subscription_plan text,
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text,
add column if not exists trial_ends_at timestamp with time zone;

-- Create index for faster lookups
create index if not exists company_settings_stripe_subscription_id_idx on company_settings(stripe_subscription_id);
create index if not exists company_settings_stripe_customer_id_idx on company_settings(stripe_customer_id);
