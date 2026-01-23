-- Create a table for products
create table products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  stock_quantity integer default 0,
  image_url text,
  user_id uuid references auth.users(id) not null
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;

-- Create Policy: Users can only see their own products
create policy "Users can view their own products"
  on products for select
  using ( auth.uid() = user_id );

-- Create Policy: Users can insert their own products
create policy "Users can insert their own products"
  on products for insert
  with check ( auth.uid() = user_id );

-- Create Policy: Users can update their own products
create policy "Users can update their own products"
  on products for update
  using ( auth.uid() = user_id );

-- Create Policy: Users can delete their own products
create policy "Users can delete their own products"
  on products for delete
  using ( auth.uid() = user_id );

-- Create index for performance
create index products_user_id_idx on products(user_id);

-- Tabela de Serviços
create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  price decimal(10,2) not null default 0,
  duration_minutes integer, -- Duração em minutos (ex: 60 para 1h)
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas de Segurança (RPF) para Serviços
alter table services enable row level security;

create policy "Usuários podem ver seus próprios serviços"
  on services for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir seus próprios serviços"
  on services for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus próprios serviços"
  on services for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar seus próprios serviços"
  on services for delete
  using (auth.uid() = user_id);

create index services_user_id_idx on services(user_id);

-- Atualização: Novos campos para Produtos (Executar em caso de atualização)
alter table products 
add column if not exists supplier text,
add column if not exists category text,
add column if not exists cost_price decimal(10,2) default 0,
add column if not exists sizes text[]; -- Array de strings para tamanhos

-- Tabela de Variantes de Produto (Estoque por Tamanho)
create table if not exists product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  size text not null, -- Ex: "P", "42", "Único"
  stock_quantity integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index product_variants_product_id_idx on product_variants(product_id);

alter table product_variants enable row level security;

-- Políticas para Variantes (Herda permissões via produto seria ideal, mas simplificando:)
create policy "Users can view own product variants"
  on product_variants for select
  using ( exists (select 1 from products where products.id = product_variants.product_id and products.user_id = auth.uid()) );

create policy "Users can insert own product variants"
  on product_variants for insert
  with check ( exists (select 1 from products where products.id = product_variants.product_id and products.user_id = auth.uid()) );

create policy "Users can update own product variants"
  on product_variants for update
  using ( exists (select 1 from products where products.id = product_variants.product_id and products.user_id = auth.uid()) );

create policy "Users can delete own product variants"
  on product_variants for delete
  using ( exists (select 1 from products where products.id = product_variants.product_id and products.user_id = auth.uid()) );

create index product_variants_user_id_idx on product_variants(product_id);

-- Tabela de Clientes
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  email text,
  phone text,
  document text, -- CPF ou CNPJ
  address text,
  notes text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table clients enable row level security;

create policy "Usuários podem ver seus próprios clientes"
  on clients for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir seus próprios clientes"
  on clients for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus próprios clientes"
  on clients for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar seus próprios clientes"
  on clients for delete
  using (auth.uid() = user_id);

create index clients_user_id_idx on clients(user_id);

-- Tabela de Movimentações de Estoque (Auditoria)
create table if not exists inventory_movements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  product_id uuid references products(id) not null,
  variant_id uuid references product_variants(id), -- Nullable (legado ou global)
  type text not null check (type in ('IN', 'OUT', 'ADJUST')),
  quantity integer not null,
  reason text, -- 'Compra', 'Venda', 'Perda', 'Inventário Inicial', 'Ajuste Manual'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table inventory_movements enable row level security;

create policy "Usuários podem ver seus próprios movimentos de estoque"
  on inventory_movements for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir seus próprios movimentos de estoque"
  on inventory_movements for insert
  with check (auth.uid() = user_id);

create index inventory_movements_product_id_idx on inventory_movements(product_id);
create index inventory_movements_product_id_idx on inventory_movements(product_id);
create index inventory_movements_created_at_idx on inventory_movements(created_at);

-- Tabela de Vendas
create table if not exists sales (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  client_id uuid references clients(id), -- Opcional (Venda Anônima)
  total_amount decimal(10,2) not null,
  status text default 'completed', -- completed, cancelled, pending
  payment_method text, -- 'PIX', 'CREDIT', 'DEBIT', 'CASH'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table sales enable row level security;

create policy "Usuários podem ver suas próprias vendas"
  on sales for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias vendas"
  on sales for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias vendas"
  on sales for update
  using (auth.uid() = user_id);

create index sales_user_id_idx on sales(user_id);
create index sales_created_at_idx on sales(created_at);

-- Tabela de Itens da Venda
create table if not exists sale_items (
  id uuid default gen_random_uuid() primary key,
  sale_id uuid references sales(id) on delete cascade not null,
  product_id uuid references products(id), -- Nullable (can be a service)
  service_id uuid references services(id), -- Nullable (can be a product)
  variant_id uuid references product_variants(id),
  quantity integer not null,
  unit_price decimal(10,2) not null,
  subtotal decimal(10,2) not null
);

alter table sale_items enable row level security;

-- Policies simplificadas via associação com sales logada no user não são automáticas em insert sem join,
-- mas como o insert é feito pelo usuário autenticado que criou a sale, podemos validar via user_id da sale?
-- Mais simples: Permitir insert se o usuário autenticado for dono da SALE (via subquery) OU simplificar
-- assumindo que o backend/app garante constraints.
-- Para RLS estrito:
create policy "Users can see items of their sales"
  on sale_items for select
  using ( exists (select 1 from sales where sales.id = sale_items.sale_id and sales.user_id = auth.uid()) );

create policy "Users can insert items to their sales"
  on sale_items for insert
  with check ( exists (select 1 from sales where sales.id = sale_items.sale_id and sales.user_id = auth.uid()) );

create index sale_items_sale_id_idx on sale_items(sale_id);

-- Tabela de Transações Financeiras (Despesas/Receitas Manuais)
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  description text not null,
  amount decimal(10,2) not null,
  type text not null check (type in ('INCOME', 'EXPENSE')),
  category text, -- 'Aluguel', 'Marketing', 'Retirada', 'Outros', 'Operacional'
  date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table transactions enable row level security;

create policy "Usuários podem ver suas próprias transações"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias transações"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias transações"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias transações"
  on transactions for delete
  using (auth.uid() = user_id);

create index transactions_user_id_idx on transactions(user_id);
create index transactions_date_idx on transactions(date);
