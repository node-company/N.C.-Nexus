-- ==============================================================================
-- FIX: Product Recovery & Deletion Regression
-- ==============================================================================

DO $$ 
BEGIN 
    -- 1. RECUPERAÇÃO DE PRODUTOS DELETADOS ACIDENTALMENTE
    -- Ativa novamente todos os produtos que foram marcados como inativos recentemente.
    UPDATE products 
    SET active = true 
    WHERE active = false;

    -- 2. FIX product_id FK in 'inventory_movements'
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'inventory_movements' AND constraint_name = 'inventory_movements_product_id_fkey') THEN
        ALTER TABLE inventory_movements DROP CONSTRAINT inventory_movements_product_id_fkey;
    END IF;
    ALTER TABLE inventory_movements 
    ADD CONSTRAINT inventory_movements_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

    -- 3. FIX variant_id FK in 'inventory_movements'
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'inventory_movements' AND constraint_name = 'inventory_movements_variant_id_fkey') THEN
        ALTER TABLE inventory_movements DROP CONSTRAINT inventory_movements_variant_id_fkey;
    END IF;
    ALTER TABLE inventory_movements 
    ADD CONSTRAINT inventory_movements_variant_id_fkey 
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;

END $$;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
