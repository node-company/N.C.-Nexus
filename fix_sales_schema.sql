-- Execute este script no Editor SQL do Supabase para corrigir a tabela sale_items

-- 1. Permitir que product_id seja nulo (pois pode ser uma venda de serviço)
ALTER TABLE sale_items
ALTER COLUMN product_id DROP NOT NULL;

-- 2. Adicionar a coluna service_id para referenciar serviços
ALTER TABLE sale_items
ADD COLUMN IF NOT EXISTS service_id uuid references services(id);

-- 3. Criar índice para performance em service_id
CREATE INDEX IF NOT EXISTS sale_items_service_id_idx ON sale_items(service_id);

-- 4. Verificar se a query funciona
-- (Opcional) Tentar selecionar itens para garantir que o relacionamento 'services' será encontrado
-- O PostgREST intui o relacionamento baseado na FK.
