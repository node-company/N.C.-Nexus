-- ==============================================================================
-- FIX: Employee Deletion Error
-- ==============================================================================
-- This script updates the foreign key constraint on the 'sales' table.
-- It changes the behavior when an employee is deleted from 'RESTRICT' (default)
-- to 'SET NULL'. This allows deleting an employee while preserving their
-- sales records (the salesman field will become empty).

DO $$ 
BEGIN 
    -- 1. Identificar o nome da constraint de chave estrangeira (geralmente sales_employee_id_fkey)
    -- Se ela existir, nós a removemos para recriar com a nova regra.
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'sales' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'sales_employee_id_fkey'
    ) THEN
        ALTER TABLE sales DROP CONSTRAINT sales_employee_id_fkey;
    END IF;
END $$;

-- 2. Recriar a constraint com ON DELETE SET NULL
ALTER TABLE sales
ADD CONSTRAINT sales_employee_id_fkey
FOREIGN KEY (employee_id)
REFERENCES employees(id)
ON DELETE SET NULL;

-- 3. Notificar o sistema sobre a mudança de schema (Opcional, bom para Supabase)
NOTIFY pgrst, 'reload schema';
