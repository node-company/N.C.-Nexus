-- Trigger to automatically update product total stock when variants change
create or replace function update_product_stock_from_variants()
returns trigger as $$
begin
  -- Update the parent product's stock_quantity based on sum of all variants
  update products
  set stock_quantity = (
    select coalesce(sum(stock_quantity), 0)
    from product_variants
    where product_id = new.product_id
  )
  where id = new.product_id;
  
  return new;
end;
$$ language plpgsql;

-- Drop trigger if exists to avoid duplication errors
drop trigger if exists on_variant_stock_change on product_variants;

-- Create trigger
create trigger on_variant_stock_change
after insert or update or delete on product_variants
for each row
execute function update_product_stock_from_variants();

-- Force a sync for existing data
update products
set stock_quantity = (
  select coalesce(sum(stock_quantity), 0)
  from product_variants
  where product_variants.product_id = products.id
)
where exists (select 1 from product_variants where product_variants.product_id = products.id);
