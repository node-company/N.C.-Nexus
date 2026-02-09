-- ==============================================================================
-- FEATURE: Customer Phone in Sales (For WhatsApp Contact)
-- ==============================================================================

ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS customer_phone text;

-- Recarregar cache de schema
NOTIFY pgrst, 'reload schema';
