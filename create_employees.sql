-- Tabela de Funcionários
create table if not exists employees (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  role text not null, -- Ex: Vendedor, Gerente, Atendente
  email text,
  phone text,
  salary decimal(10,2) default 0,
  admission_date date default CURRENT_DATE,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table employees enable row level security;

-- Políticas de Segurança
create policy "Usuários podem ver seus próprios funcionários"
  on employees for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir seus próprios funcionários"
  on employees for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus próprios funcionários"
  on employees for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar seus próprios funcionários"
  on employees for delete
  using (auth.uid() = user_id);

-- Índices
create index employees_user_id_idx on employees(user_id);
create index employees_active_idx on employees(active);

-- Recarregar schema (para Supabase GUI/API)
notify pgrst, 'reload schema';
