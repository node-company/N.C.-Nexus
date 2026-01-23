-- 1. Adicionar porcentagem de comissão na tabela employees
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS commission_percentage decimal(5,2) DEFAULT 0;

-- 2. Adicionar employee_id e commission_amount na tabela sales
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS commission_amount decimal(10,2) DEFAULT 0;

-- 3. Índice para performance em relatórios
CREATE INDEX IF NOT EXISTS sales_employee_id_idx ON sales(employee_id);

-- 4. Função para validar se o employee pertence ao mesmo dono (Opcional, mas boa prática)
-- (Simplificado: O frontend vai garantir que o ID enviado é válido)
