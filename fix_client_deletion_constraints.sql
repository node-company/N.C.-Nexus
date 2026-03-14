-- ==============================================================================
-- FIX: Client Deletion & Sales Referential Integrity
-- ==============================================================================

DO $$ 
BEGIN 
    -- 1. FIX client_id FK in 'sales'
    -- Change 'ON DELETE RESTRICT' (default) to 'ON DELETE SET NULL'
    -- This ensures that if a client is physically deleted, sales records are preserved.
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'sales' AND constraint_name = 'sales_client_id_fkey') THEN
        ALTER TABLE sales DROP CONSTRAINT sales_client_id_fkey;
    END IF;
    
    ALTER TABLE sales 
    ADD CONSTRAINT sales_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

END $$;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
