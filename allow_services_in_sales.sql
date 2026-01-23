-- Atualizar tabela sale_items para permitir serviços
alter table sale_items 
  alter column product_id drop not null;

alter table sale_items
  add column if not exists service_id uuid references services(id);

alter table sale_items
  add constraint sale_items_item_check 
  check (product_id is not null or service_id is not null);

-- Recarregar cache de schema
notify pgrst, 'reload schema';
