-- Adiciona coluna 'active' na tabela de produtos para permitir Soft Delete
alter table products 
add column if not exists active boolean default true;
