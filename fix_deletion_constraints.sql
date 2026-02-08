-- ==============================================================================
-- FIX: Deletion Errors (Employees, Services, Products)
-- ==============================================================================
-- This script updates foreign key behavior to allow deleting base records
-- while preserving historical data in sales and sale_items.

DO $$ 
BEGIN 
    -- 1. FIX EMPLOYEES in 'sales' table
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'sales' AND constraint_name = 'sales_employee_id_fkey') THEN
        ALTER TABLE sales DROP CONSTRAINT sales_employee_id_fkey;
    END IF;
    ALTER TABLE sales ADD CONSTRAINT sales_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;

    -- 2. FIX SERVICES in 'sale_items' table
    -- First, relax the check constraint that requires an item to be present
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'sale_items' AND constraint_name = 'sale_items_item_check') THEN
        ALTER TABLE sale_items DROP CONSTRAINT sale_items_item_check;
    END IF;

    -- Drop and recreate service_id FK
    -- (The name might vary, checking common patterns)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'sale_items' AND constraint_name = 'sale_items_service_id_fkey') THEN
        ALTER TABLE sale_items DROP CONSTRAINT sale_items_service_id_fkey;
    END IF;
    -- Re-adding with ON DELETE SET NULL
    ALTER TABLE sale_items ADD CONSTRAINT sale_items_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

    -- 3. FIX PRODUCTS in 'sale_items' table (Proactive fix)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'sale_items' AND constraint_name = 'sale_items_product_id_fkey') THEN
        ALTER TABLE sale_items DROP CONSTRAINT sale_items_product_id_fkey;
    END IF;
    ALTER TABLE sale_items ADD CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

END $$;

-- Optional: Re-add a less strict check constraint if desired, 
-- but usually leaving it off is safer for hard-deletes of history.
-- ALTER TABLE sale_items ADD CONSTRAINT sale_items_item_check CHECK (product_id IS NOT NULL OR service_id IS NOT NULL);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
