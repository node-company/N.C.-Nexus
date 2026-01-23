-- Add user_id to sale_items for simpler, more robust RLS
alter table sale_items add column if not exists user_id uuid references auth.users(id);

-- Backfill user_id from sales (for existing data, although it might be empty/broken)
update sale_items
set user_id = sales.user_id
from sales
where sale_items.sale_id = sales.id
and sale_items.user_id is null;

-- Make user_id not null after backfill (optional, but good practice)
-- alter table sale_items alter column user_id set not null;

-- Drop complex join-based policies
drop policy if exists "Users can see items of their sales" on sale_items;
drop policy if exists "Users can insert items to their sales" on sale_items;

-- Create new simple policies based on user_id
create policy "Users can see their own sale items"
  on sale_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sale items"
  on sale_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sale items"
  on sale_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own sale items"
  on sale_items for delete
  using (auth.uid() = user_id);

create index if not exists sale_items_user_id_idx on sale_items(user_id);
