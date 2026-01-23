-- Ensure thorough RLS for all inventory related tables
-- This fixes issues where stock updates might be silently ignored during edits/deletes

-- 1. PRODUCTS Policies
alter table products enable row level security;

create policy "Users can update their own products"
  on products for update
  using (auth.uid() = user_id);

create policy "Users can select their own products"
  on products for select
  using (auth.uid() = user_id);

-- 2. PRODUCT VARIANTS Policies
-- Add user_id to variants for robust, join-free security (Denormalization)
alter table product_variants add column if not exists user_id uuid references auth.users(id);

-- Backfill user_id for variants
update product_variants
set user_id = products.user_id
from products
where product_variants.product_id = products.id
and product_variants.user_id is null;

-- Drop old complex policies
drop policy if exists "Users can update own product variants" on product_variants;
drop policy if exists "Users can view own product variants" on product_variants;
drop policy if exists "Users can insert own product variants" on product_variants;
drop policy if exists "Users can delete own product variants" on product_variants;

-- Create new simple policies (Drop first to avoid conflicts)
drop policy if exists "Users can see own variants" on product_variants;
drop policy if exists "Users can update own variants" on product_variants;
drop policy if exists "Users can insert own variants" on product_variants;
drop policy if exists "Users can delete own variants" on product_variants;

create policy "Users can see own variants"
  on product_variants for select
  using (auth.uid() = user_id);

create policy "Users can update own variants"
  on product_variants for update
  using (auth.uid() = user_id);

create policy "Users can insert own variants"
  on product_variants for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own variants"
  on product_variants for delete
  using (auth.uid() = user_id);

-- 3. INVENTORY MOVEMENTS Policies
alter table inventory_movements enable row level security;

create policy "Users can insert inventory movements"
  on inventory_movements for insert
  with check (auth.uid() = user_id);

create policy "Users can view inventory movements"
  on inventory_movements for select
  using (auth.uid() = user_id);
