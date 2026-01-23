-- Create company_settings table
create table if not exists company_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text,
  cnpj text,
  email text,
  phone text,
  address text,
  logo_url text, -- Store URL or Base64 (text is plenty for moderate base64)
  footer_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id) -- Only one settings record per user
);

-- Enable RLS
alter table company_settings enable row level security;

-- Policies
create policy "Users can view their own settings"
  on company_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on company_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on company_settings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own settings"
  on company_settings for delete
  using (auth.uid() = user_id);

-- Create index
create index company_settings_user_id_idx on company_settings(user_id);
