-- ==============================================================================
-- 1. Tabela de Funcionários
-- ==============================================================================

-- Drop if exists (for idempotency during dev)
-- Drop if exists (for idempotency during dev)
DROP TABLE IF EXISTS employees CASCADE;

CREATE TABLE IF NOT EXISTS employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id) NOT NULL, -- O Dono da empresa
  auth_id uuid REFERENCES auth.users(id), -- O Login do funcionário (pode ser null até ele aceitar/criar)
  name text NOT NULL,
  email text NOT NULL, -- Email para convite/login
  role text DEFAULT 'employee', -- 'manager', 'seller'
  phone text,
  salary numeric,
  permissions jsonb DEFAULT '{}'::jsonb, -- Ex: {"can_manage_products": true}
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index para performance
CREATE INDEX IF NOT EXISTS employees_owner_id_idx ON employees(owner_id);
CREATE INDEX IF NOT EXISTS employees_auth_id_idx ON employees(auth_id);

-- RLS para employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Dono pode fazer tudo em seus funcionários
CREATE POLICY "Owners can manage their employees"
  ON employees
  USING (auth.uid() = owner_id);

-- Funcionário pode ver seus próprios dados (opcional, para profile)
CREATE POLICY "Employees can view own data"
  ON employees FOR SELECT
  USING (auth.uid() = auth_id);

-- ==============================================================================
-- 2. Helper Function: Obter ID do Dono Real (Owner)
-- ==============================================================================
-- Esta função retorna o ID do Dono dos dados.
-- Se quem chama é o Dono, retorna o próprio ID.
-- Se quem chama é um Funcionário, retorna o ID do seu Chefe (owner_id).

CREATE OR REPLACE FUNCTION get_owner_id()
RETURNS uuid AS $$
DECLARE
  v_owner_id uuid;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  -- 1. Tenta achar se é um funcionário
  SELECT owner_id INTO v_owner_id
  FROM employees
  WHERE auth_id = v_user_id
  AND active = true
  LIMIT 1;
  
  -- 2. Se achou, retorna o owner_id
  IF v_owner_id IS NOT NULL THEN
    RETURN v_owner_id;
  END IF;

  -- 3. Se não achou, assume que é o próprio dono (ou user isolado)
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. Atualizar Policies existentes para usar get_owner_id()
-- ==============================================================================
-- Nota: Para aplicar isso, precisaremos DROPAR as policies antigas e criar novas,
-- ou alterá-las. Vou optar por DROPAR e recriar para garantir limpeza.

-- --- PRODUCTS ---
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

DROP POLICY IF EXISTS "Access products based on hierarchy" ON products;

CREATE POLICY "Access products based on hierarchy"
  ON products
  USING ( user_id = get_owner_id() )
  WITH CHECK ( user_id = get_owner_id() );

-- --- SERVICES ---
DROP POLICY IF EXISTS "Usuários podem ver seus próprios serviços" ON services;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios serviços" ON services;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios serviços" ON services;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios serviços" ON services;

DROP POLICY IF EXISTS "Access services based on hierarchy" ON services;

CREATE POLICY "Access services based on hierarchy"
  ON services
  USING ( user_id = get_owner_id() )
  WITH CHECK ( user_id = get_owner_id() );

-- --- CLIENTS ---
DROP POLICY IF EXISTS "Usuários podem ver seus próprios clientes" ON clients;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios clientes" ON clients;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios clientes" ON clients;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios clientes" ON clients;

DROP POLICY IF EXISTS "Access clients based on hierarchy" ON clients;

CREATE POLICY "Access clients based on hierarchy"
  ON clients
  USING ( user_id = get_owner_id() )
  WITH CHECK ( user_id = get_owner_id() );

-- --- SALES ---
DROP POLICY IF EXISTS "Usuários podem ver suas próprias vendas" ON sales;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias vendas" ON sales;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias vendas" ON sales;

DROP POLICY IF EXISTS "Access sales based on hierarchy" ON sales;

CREATE POLICY "Access sales based on hierarchy"
  ON sales
  USING ( user_id = get_owner_id() )
  WITH CHECK ( user_id = get_owner_id() );

-- --- INVENTORY MOVEMENTS ---
DROP POLICY IF EXISTS "Usuários podem ver seus próprios movimentos de estoque" ON inventory_movements;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios movimentos de estoque" ON inventory_movements;

DROP POLICY IF EXISTS "Access inventory based on hierarchy" ON inventory_movements;

CREATE POLICY "Access inventory based on hierarchy"
  ON inventory_movements
  USING ( user_id = get_owner_id() )
  WITH CHECK ( user_id = get_owner_id() );

-- --- TRANSACTIONS ---
DROP POLICY IF EXISTS "Usuários podem ver suas próprias transações" ON transactions;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias transações" ON transactions;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias transações" ON transactions;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias transações" ON transactions;

DROP POLICY IF EXISTS "Access transactions based on hierarchy" ON transactions;

CREATE POLICY "Access transactions based on hierarchy"
  ON transactions
  USING ( user_id = get_owner_id() )
  WITH CHECK ( user_id = get_owner_id() );

-- --- COMPANY SETTINGS ---
-- (Assumindo que exista, se não, crie se necessário ou ignore erro)
-- create table if not exists company_settings ... (já deve existir do passo anterior)

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'company_settings') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own settings" ON company_settings';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own settings" ON company_settings';
        EXECUTE 'DROP POLICY IF EXISTS "Access settings based on hierarchy" ON company_settings';
        EXECUTE 'CREATE POLICY "Access settings based on hierarchy" ON company_settings USING (user_id = get_owner_id()) WITH CHECK (user_id = get_owner_id())';
    END IF;
END $$;

-- ==============================================================================
-- 4. Trigger para Link Automático (Auth -> Employees)
-- ==============================================================================
-- Quando um usuário é criado (via Invite ou SignUp), verificamos se existe
-- um registro na tabela 'employees' com o mesmo email. Se sim, atualizamos o auth_id.

CREATE OR REPLACE FUNCTION public.handle_new_user_employee_link()
RETURNS trigger AS $$
BEGIN
  UPDATE public.employees
  SET auth_id = NEW.id
  WHERE email = NEW.email
  AND auth_id IS NULL; -- Apenas se ainda não estiver vinculado
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger na tabela auth.users
-- Nota: Triggers em auth.users requerem permissões de superadmin ou dashboard.
-- Se der erro ao rodar, o usuário terá que rodar via Dashboard SQL Editor.
DROP TRIGGER IF EXISTS on_auth_user_created_link_employee ON auth.users;

CREATE TRIGGER on_auth_user_created_link_employee
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_employee_link();

