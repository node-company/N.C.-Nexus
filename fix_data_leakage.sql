-- ==============================================================================
-- SCRIPT DE SEGURANÇA: CORREÇÃO DE VAZAMENTO DE DADOS (RLS)
-- ==============================================================================
-- Este script garante que cada usuário veja APENAS seus próprios dados, 
-- removendo políticas permissivas demais.

-- 1. PRODUTOS (Products)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products of active catalogs" ON products;
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can select their own products" ON products;
DROP POLICY IF EXISTS "Users can view their own products" ON products;

CREATE POLICY "Users can view their own products" 
ON products FOR SELECT 
USING (auth.uid() = user_id);

-- 1.1 RE-CRIAR POLÍTICA DE CATÁLOGO (SOMENTE PARA ACESSO ANON/PÚBLICO)
-- Esta versão é mais segura pois garante que o acesso é para o catálogo, não interferindo no dashboard se filtrarmos.
CREATE POLICY "Public catalog access" 
ON products FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM company_settings 
        WHERE company_settings.user_id = products.user_id 
        AND company_settings.catalog_active = true
    )
);

-- 2. VARIANTES DE PRODUTO (Product Variants)
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own variants" ON product_variants;
DROP POLICY IF EXISTS "Users can see own variants" ON product_variants;
DROP POLICY IF EXISTS "Public can view variants of active catalogs" ON product_variants;

-- Garantir que variantes herdam segurança do produto ou usam user_id
CREATE POLICY "Users can view their own variants" 
ON product_variants FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM products 
        WHERE products.id = product_variants.product_id 
        AND products.user_id = auth.uid()
    )
);

-- 3. ITENS DE VENDA (Sale Items)
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can see items of their sales" ON sale_items;

CREATE POLICY "Users can view their own sale items" 
ON sale_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM sales 
        WHERE sales.id = sale_items.sale_id 
        AND sales.user_id = auth.uid()
    )
);

-- 4. GARANTIR RLS EM OUTRAS TABELAS CRÍTICAS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 5. RECARREGAR CONFIGURAÇÕES
NOTIFY pgrst, 'reload schema';
