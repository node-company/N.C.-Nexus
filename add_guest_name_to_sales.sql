-- ==============================================================================
-- FEATURE: Guest Checkout and Discounts in Sales
-- ==============================================================================
-- 1. ADICIONAR NOME DO CLIENTE MANUAL (Para vendas sem cadastro)
-- 2. ADICIONAR COLUNA DE DESCONTO (Para registro histórico do valor abatido)

ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS discount decimal(10,2) DEFAULT 0;

-- Recarregar cache de schema
NOTIFY pgrst, 'reload schema';
