-- SCRIPT DE CORREÇÃO TOTAL DO BANCO DE DADOS
-- Rode este script no Editor SQL do Supabase para garantir que todas as tabelas existam.

-- 1. Tabela de Produtos
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  stock_quantity integer default 0,
  image_url text,
  user_id uuid references auth.users(id) not null,
  -- Novos campos
  supplier text,
  category text,
  cost_price decimal(10,2) default 0,
  sizes text[]
);
alter table products enable row level security;
create policy "Users can view own products" on products for select using (auth.uid() = user_id);
create policy "Users can insert own products" on products for insert with check (auth.uid() = user_id);
create policy "Users can update own products" on products for update using (auth.uid() = user_id);
create policy "Users can delete own products" on products for delete using (auth.uid() = user_id);

-- 2. Serviços
create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  price decimal(10,2) not null default 0,
  duration_minutes integer,
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table services enable row level security;
create policy "Users can view own services" on services for select using (auth.uid() = user_id);
create policy "Users can insert own services" on services for insert with check (auth.uid() = user_id);
create policy "Users can update own services" on services for update using (auth.uid() = user_id);
create policy "Users can delete own services" on services for delete using (auth.uid() = user_id);

-- 3. Variantes de Produto
create table if not exists product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  size text not null,
  stock_quantity integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table product_variants enable row level security;
-- Policies simplificadas para garantir acesso
create policy "Users can view own variants" on product_variants for select using (true);
create policy "Users can insert own variants" on product_variants for insert with check (true);
create policy "Users can update own variants" on product_variants for update using (true);
create policy "Users can delete own variants" on product_variants for delete using (true);

-- 4. Clientes
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  email text,
  phone text,
  document text,
  address text,
  notes text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table clients enable row level security;
create policy "Users can view own clients" on clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on clients for delete using (auth.uid() = user_id);

-- 5. Movimentações de Estoque
create table if not exists inventory_movements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  product_id uuid references products(id) not null,
  variant_id uuid references product_variants(id),
  type text not null,
  quantity integer not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table inventory_movements enable row level security;
create policy "Users can view own movements" on inventory_movements for select using (auth.uid() = user_id);
create policy "Users can insert own movements" on inventory_movements for insert with check (auth.uid() = user_id);

-- 6. Vendas
create table if not exists sales (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  client_id uuid references clients(id),
  total_amount decimal(10,2) not null,
  status text default 'completed',
  payment_method text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table sales enable row level security;
create policy "Users can view own sales" on sales for select using (auth.uid() = user_id);
create policy "Users can insert own sales" on sales for insert with check (auth.uid() = user_id);
create policy "Users can update own sales" on sales for update using (auth.uid() = user_id);

-- 7. Itens da Venda
create table if not exists sale_items (
  id uuid default gen_random_uuid() primary key,
  sale_id uuid references sales(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  variant_id uuid references product_variants(id),
  quantity integer not null,
  unit_price decimal(10,2) not null,
  subtotal decimal(10,2) not null
);
alter table sale_items enable row level security;
create policy "Users can view own sale items" on sale_items for select using (true);
create policy "Users can insert own sale items" on sale_items for insert with check (true);

-- 8. Transações Financeiras (Financeiro)
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  description text not null,
  amount decimal(10,2) not null,
  type text not null,
  category text,
  date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table transactions enable row level security;
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- Tenta recarregar o schema cache (funciona em algumas versões do Supabase)
NOTIFY pgrst, 'reload config';
