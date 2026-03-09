-- ==============================================================================
-- FIX: Public Digital Catalog Product Variants RLS
-- ==============================================================================
-- Este script corrige o problema onde tamanhos (variantes) de produtos 
-- apareciam para o administrador/dono (logado no Chrome), mas não 
-- apareciam para clientes normais no catálogo público (Edge, Safari, etc).

-- Garante que o RLS está ativado
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Remove a política pública caso ela exista (para recriar corretamente)
DROP POLICY IF EXISTS "Public can view variants of active catalogs" ON product_variants;

-- Cria a política pública permitindo que qualquer pessoa acesse as variações de
-- produtos se a empresa dona do produto estiver com o catálogo ativo.
CREATE POLICY "Public can view variants of active catalogs"
ON product_variants FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM products
        JOIN company_settings ON company_settings.user_id = products.user_id
        WHERE products.id = product_variants.product_id
        AND company_settings.catalog_active = true
    )
);

-- Recarrega o cache do PostgREST para aplicar imediatamente
NOTIFY pgrst, 'reload schema';
