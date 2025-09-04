-- Popular itens de consumo para demonstração
-- Inserir itens de minibar
INSERT INTO hotel_consumption_items (name, description, category, price, unit, is_active) VALUES
-- Minibar
('Água Mineral 500ml', 'Água mineral natural', 'minibar', 8.00, 'unidade', true),
('Refrigerante Coca-Cola 350ml', 'Refrigerante Coca-Cola lata', 'minibar', 12.00, 'unidade', true),
('Cerveja Heineken 330ml', 'Cerveja Heineken long neck', 'minibar', 18.00, 'unidade', true),
('Suco de Laranja 300ml', 'Suco natural de laranja', 'minibar', 15.00, 'unidade', true),
('Chocolate Nestlé', 'Chocolate ao leite Nestlé', 'minibar', 10.00, 'unidade', true),
('Amendoim Salgado', 'Amendoim salgado 50g', 'minibar', 8.00, 'unidade', true),
('Vinho Tinto 375ml', 'Vinho tinto nacional meia garrafa', 'minibar', 45.00, 'unidade', true),
('Whisky Miniatura 50ml', 'Whisky importado miniatura', 'minibar', 35.00, 'unidade', true),

-- Room Service
('Sanduíche Club', 'Sanduíche club com batata frita', 'room_service', 28.00, 'unidade', true),
('Hambúrguer Artesanal', 'Hambúrguer artesanal com batata', 'room_service', 35.00, 'unidade', true),
('Salada Caesar', 'Salada Caesar com frango grelhado', 'room_service', 25.00, 'unidade', true),
('Salmão Grelhado', 'Salmão grelhado com legumes', 'room_service', 55.00, 'unidade', true),
('Risotto de Camarão', 'Risotto cremoso com camarões', 'room_service', 48.00, 'unidade', true),
('Pizza Margherita', 'Pizza margherita individual', 'room_service', 32.00, 'unidade', true),
('Café da Manhã Completo', 'Café da manhã no quarto', 'room_service', 42.00, 'unidade', true),
('Sobremesa Petit Gateau', 'Petit gateau com sorvete', 'room_service', 18.00, 'unidade', true),

-- Lavanderia
('Lavagem Camisa', 'Lavagem e passagem de camisa', 'laundry', 15.00, 'unidade', true),
('Lavagem Calça', 'Lavagem e passagem de calça', 'laundry', 18.00, 'unidade', true),
('Lavagem Vestido', 'Lavagem e passagem de vestido', 'laundry', 25.00, 'unidade', true),
('Lavagem Terno', 'Lavagem a seco de terno completo', 'laundry', 45.00, 'unidade', true),
('Lavagem Express', 'Serviço de lavagem expressa (2h)', 'laundry', 35.00, 'kg', true),

-- Spa
('Massagem Relaxante', 'Massagem relaxante 60 minutos', 'spa', 120.00, 'hora', true),
('Massagem Terapêutica', 'Massagem terapêutica 90 minutos', 'spa', 180.00, 'hora', true),
('Facial Hidratante', 'Tratamento facial hidratante', 'spa', 95.00, 'unidade', true),
('Manicure e Pedicure', 'Serviço completo de manicure e pedicure', 'spa', 65.00, 'unidade', true),

-- Extras
('Transfer Aeroporto', 'Transfer do hotel para o aeroporto', 'extras', 85.00, 'unidade', true),
('Aluguel Bicicleta', 'Aluguel de bicicleta por dia', 'extras', 25.00, 'dia', true),
('Tour Cidade', 'Tour guiado pela cidade (4h)', 'extras', 150.00, 'unidade', true),
('Internet Premium', 'Internet de alta velocidade por dia', 'extras', 20.00, 'dia', true),
('Estacionamento Valet', 'Serviço de estacionamento valet por dia', 'extras', 30.00, 'dia', true)

;

-- Atualizar timestamps
UPDATE hotel_consumption_items SET updated_at = NOW() WHERE updated_at IS NULL;