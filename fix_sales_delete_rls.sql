-- Add missing DELETE policy for sales table
-- Without this, delete operations return success (0 rows affected) but do nothing.

create policy "Usuários podem deletar suas próprias vendas"
  on sales for delete
  using (auth.uid() = user_id);
