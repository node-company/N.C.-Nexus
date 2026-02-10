-- ========================================================
-- SCRIPT DE GERAÇÃO DE DADOS EXEMPLO (40+ VENDAS)
-- ========================================================
-- DATA INICIAL: 01/01/2026
-- DATA FINAL: 10/02/2026 (Hoje)

DO $$ 
DECLARE 
    target_user_id UUID := '0ee32821-f5b7-4aa2-9b68-c93d9d5bcb6e'; -- << SEU ID JÁ ESTÁ AQUI
    prod1_id UUID := gen_random_uuid();
    prod2_id UUID := gen_random_uuid();
    prod3_id UUID := gen_random_uuid();
    client1_id UUID := gen_random_uuid();
    client2_id UUID := gen_random_uuid();
    
    -- Variáveis para o loop
    i INTEGER;
    current_sale_id UUID;
    random_days INTEGER;
    random_seconds INTEGER;
    sale_date TIMESTAMP;
    selected_prod_id UUID;
    selected_price DECIMAL(10,2);
    selected_qty INTEGER;
    total_sale DECIMAL(10,2);
BEGIN
    -- 1. LIMPEZA OPCIONAL (Remover se quiser acumular)
    -- DELETE FROM sales WHERE user_id = target_user_id;
    -- DELETE FROM products WHERE user_id = target_user_id;

    -- 2. ATIVAR ASSINATURA (BYPASS CHECKOUT)
    INSERT INTO company_settings (user_id, name, subscription_status, subscription_plan)
    VALUES (target_user_id, 'Nexus Empresa Exemplo', 'active', 'monthly')
    ON CONFLICT (user_id) DO UPDATE 
    SET subscription_status = 'active', name = 'Nexus Empresa Exemplo';

    -- 3. CRIAR PRODUTOS
    INSERT INTO products (id, user_id, name, description, price, cost_price, stock_quantity, category, supplier, active)
    VALUES 
    (prod1_id, target_user_id, 'Camiseta Premium Nexus', 'Camiseta de algodão alta qualidade', 89.90, 35.00, 500, 'Vestuário', 'Fornecedor A', true),
    (prod2_id, target_user_id, 'Calça Jeans Slim', 'Jeans com elastano', 159.90, 70.00, 300, 'Vestuário', 'Fornecedor B', true),
    (prod3_id, target_user_id, 'Tênis Sport X', 'Tênis para corrida leve', 299.00, 120.00, 150, 'Calçados', 'Fornecedor C', true);

    -- 4. CRIAR CLIENTES
    INSERT INTO clients (id, user_id, name, email, phone)
    VALUES 
    (client1_id, target_user_id, 'João Silva', 'joao@email.com', '11999999999'),
    (client2_id, target_user_id, 'Maria Oliveira', 'maria@email.com', '11888888888');

    -- 5. CRIAR DESPESAS E RECEITAS MANUAIS
    INSERT INTO transactions (user_id, description, amount, type, category, date)
    VALUES 
    (target_user_id, 'Aluguel Escritório Jan', 1500.00, 'EXPENSE', 'Aluguel', '2026-01-05'),
    (target_user_id, 'Energia Elétrica Jan', 250.00, 'EXPENSE', 'Utilidades', '2026-01-10'),
    (target_user_id, 'Consultoria Inicial', 500.00, 'INCOME', 'Outros', '2026-01-15'),
    (target_user_id, 'Aluguel Escritório Fev', 1500.00, 'EXPENSE', 'Aluguel', '2026-02-05');

    -- 6. GERAR 45 VENDAS ALEATÓRIAS NO PERÍODO
    FOR i IN 1..45 LOOP
        -- Gerar data aleatória entre 01/01/2026 e 10/02/2026
        random_days := floor(random() * 41); -- 0 a 40 dias após 01/01
        random_seconds := floor(random() * 86400); -- segundos aleatórios no dia
        sale_date := '2026-01-01 08:00:00'::timestamp + (random_days * interval '1 day') + (random_seconds * interval '1 second');
        
        -- Evitar datas no futuro (se o random bater exatamente hoje num horário posterior)
        IF sale_date > CURRENT_TIMESTAMP THEN
            sale_date := CURRENT_TIMESTAMP - (random() * interval '1 hour');
        END IF;

        current_sale_id := gen_random_uuid();
        
        -- Escolher um produto e quantidade aleatória
        CASE floor(random() * 3)
            WHEN 0 THEN selected_prod_id := prod1_id; selected_price := 89.90;
            WHEN 1 THEN selected_prod_id := prod2_id; selected_price := 159.90;
            ELSE selected_prod_id := prod3_id; selected_price := 299.00;
        END CASE;
        
        selected_qty := floor(random() * 3) + 1; -- 1 a 3 itens
        total_sale := selected_price * selected_qty;

        -- Inserir Venda
        INSERT INTO sales (id, user_id, client_id, total_amount, status, payment_method, created_at)
        VALUES (
            current_sale_id, 
            target_user_id, 
            CASE WHEN random() > 0.3 THEN client1_id ELSE client2_id END, 
            total_sale, 
            'completed', 
            (ARRAY['PIX', 'CREDIT', 'DEBIT', 'CASH'])[floor(random() * 4) + 1], 
            sale_date
        );

        -- Inserir Item da Venda
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
        VALUES (current_sale_id, selected_prod_id, selected_qty, selected_price, total_sale);
        
    END LOOP;

END $$;
