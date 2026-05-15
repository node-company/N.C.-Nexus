-- ==============================================================================
-- FEATURE: Public Digital Catalog
-- ==============================================================================

-- 1. ADICIONAR COLUNAS NAS CONFIGURAÇÕES DA EMPRESA
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS catalog_slug text UNIQUE,
ADD COLUMN IF NOT EXISTS catalog_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- 2. CRIAR ÍNDICE PARA BUSCA RÁPIDA POR SLUG
CREATE INDEX IF NOT EXISTS company_settings_catalog_slug_idx ON company_settings(catalog_slug);

-- 3. AJUSTAR POLÍTICAS DE RLS PARA ACESSO PÚBLICO (ANON)

-- 3.1 Company Settings (Público pode ver nome, logo, etc para o catálogo)
CREATE POLICY "Public can view active company settings"
ON company_settings FOR SELECT
USING (catalog_active = true);

-- 3.2 Products (Público pode ver produtos se o catálogo estiver ativo)
CREATE POLICY "Public can view products of active catalogs"
ON products FOR SELECT
USING (EXISTS (
    SELECT 1 FROM company_settings 
    WHERE company_settings.user_id = products.user_id 
    AND company_settings.catalog_active = true
));

-- 3.3 Services (Público pode ver serviços se o catálogo estiver ativo)
CREATE POLICY "Public can view services of active catalogs"
ON services FOR SELECT
USING (EXISTS (
    SELECT 1 FROM company_settings 
    WHERE company_settings.user_id = services.user_id 
    AND company_settings.catalog_active = true
));

-- 3.4 Product Variants (Público pode ver variantes se o catálogo estiver ativo)
CREATE POLICY "Public can view variants of active catalogs"
ON product_variants FOR SELECT
USING (EXISTS (
    SELECT 1 FROM products
    JOIN company_settings ON company_settings.user_id = products.user_id
    WHERE products.id = product_variants.product_id
    AND company_settings.catalog_active = true
));

-- 4. PERMITIR QUE O PÚBLICO ENVIE PEDIDOS (PENDENTES)

-- 4.1 Sales (Público pode inserir vendas com status pending)
CREATE POLICY "Public can insert pending orders"
ON sales FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM company_settings 
        WHERE company_settings.user_id = sales.user_id 
        AND company_settings.catalog_active = true
    )
    AND status = 'pending'
);

-- 4.2 Sale Items (Público pode inserir itens em vendas pendentes)
CREATE POLICY "Public can insert items for pending orders"
ON sale_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM sales
        WHERE sales.id = sale_items.sale_id
        AND sales.status = 'pending'
    )
);

-- Recarregar cache de schema
NOTIFY pgrst, 'reload schema';
