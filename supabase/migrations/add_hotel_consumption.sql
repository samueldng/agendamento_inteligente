-- Adicionar funcionalidade de consumo para hotéis
-- Tabela para itens de consumo (minibar, serviços extras, etc.)
CREATE TABLE hotel_consumption_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'minibar', 'room_service', 'laundry', 'spa', 'extras'
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'unidade', -- unidade, kg, litro, hora, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para registrar consumo dos hóspedes
CREATE TABLE hotel_consumption (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES hotel_reservations(id) ON DELETE CASCADE,
  item_id UUID REFERENCES hotel_consumption_items(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  consumed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  staff_member VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE hotel_consumption_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_consumption ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para hotel_consumption_items
CREATE POLICY "Profissionais podem gerenciar itens de consumo" ON hotel_consumption_items
  FOR ALL USING (
    professional_id IN (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Todos podem visualizar itens ativos" ON hotel_consumption_items
  FOR SELECT USING (is_active = true);

-- Políticas RLS para hotel_consumption
CREATE POLICY "Profissionais podem gerenciar consumo" ON hotel_consumption
  FOR ALL USING (
    reservation_id IN (
      SELECT hr.id FROM hotel_reservations hr
      JOIN hotel_rooms r ON hr.room_id = r.id
      WHERE r.professional_id IN (
        SELECT id FROM professionals WHERE user_id = auth.uid()
      )
    )
  );

-- Conceder permissões
GRANT SELECT ON hotel_consumption_items TO anon, authenticated;
GRANT ALL PRIVILEGES ON hotel_consumption_items TO authenticated;

GRANT SELECT ON hotel_consumption TO anon, authenticated;
GRANT ALL PRIVILEGES ON hotel_consumption TO authenticated;

-- Criar índices
CREATE INDEX idx_hotel_consumption_items_professional_id ON hotel_consumption_items(professional_id);
CREATE INDEX idx_hotel_consumption_items_category ON hotel_consumption_items(category);
CREATE INDEX idx_hotel_consumption_items_active ON hotel_consumption_items(is_active);
CREATE INDEX idx_hotel_consumption_reservation_id ON hotel_consumption(reservation_id);
CREATE INDEX idx_hotel_consumption_item_id ON hotel_consumption(item_id);
CREATE INDEX idx_hotel_consumption_consumed_at ON hotel_consumption(consumed_at);

-- Triggers para updated_at
CREATE TRIGGER update_hotel_consumption_items_updated_at 
    BEFORE UPDATE ON hotel_consumption_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_consumption_updated_at 
    BEFORE UPDATE ON hotel_consumption 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir itens de consumo padrão
INSERT INTO hotel_consumption_items (professional_id, name, description, category, price, unit) VALUES
-- Minibar
(NULL, 'Água Mineral 500ml', 'Água mineral natural', 'minibar', 5.00, 'unidade'),
(NULL, 'Refrigerante Lata', 'Refrigerante diversos sabores', 'minibar', 8.00, 'unidade'),
(NULL, 'Cerveja Nacional', 'Cerveja nacional long neck', 'minibar', 12.00, 'unidade'),
(NULL, 'Cerveja Importada', 'Cerveja importada premium', 'minibar', 18.00, 'unidade'),
(NULL, 'Vinho Tinto', 'Vinho tinto nacional', 'minibar', 45.00, 'unidade'),
(NULL, 'Whisky Dose', 'Whisky nacional dose 50ml', 'minibar', 25.00, 'unidade'),
(NULL, 'Chocolate', 'Chocolate ao leite premium', 'minibar', 15.00, 'unidade'),
(NULL, 'Amendoim', 'Amendoim salgado', 'minibar', 8.00, 'unidade'),

-- Room Service
(NULL, 'Sanduíche Natural', 'Sanduíche natural com frango', 'room_service', 25.00, 'unidade'),
(NULL, 'Pizza Individual', 'Pizza margherita individual', 'room_service', 35.00, 'unidade'),
(NULL, 'Salada Caesar', 'Salada caesar com frango grelhado', 'room_service', 28.00, 'unidade'),
(NULL, 'Hambúrguer Artesanal', 'Hambúrguer artesanal com batata', 'room_service', 42.00, 'unidade'),
(NULL, 'Café da Manhã Completo', 'Café da manhã servido no quarto', 'room_service', 35.00, 'unidade'),

-- Lavanderia
(NULL, 'Lavagem Roupa Casual', 'Lavagem de roupas casuais', 'laundry', 15.00, 'peça'),
(NULL, 'Lavagem Roupa Social', 'Lavagem de roupas sociais', 'laundry', 25.00, 'peça'),
(NULL, 'Lavagem a Seco', 'Lavagem a seco especializada', 'laundry', 35.00, 'peça'),
(NULL, 'Passadoria', 'Serviço de passadoria', 'laundry', 8.00, 'peça'),

-- Spa e Bem-estar
(NULL, 'Massagem Relaxante', 'Massagem relaxante 60 minutos', 'spa', 120.00, 'sessão'),
(NULL, 'Massagem Terapêutica', 'Massagem terapêutica 60 minutos', 'spa', 150.00, 'sessão'),
(NULL, 'Facial Hidratante', 'Tratamento facial hidratante', 'spa', 80.00, 'sessão'),
(NULL, 'Manicure e Pedicure', 'Serviço completo de manicure e pedicure', 'spa', 60.00, 'sessão'),

-- Serviços Extras
(NULL, 'Transfer Aeroporto', 'Transfer do/para aeroporto', 'extras', 80.00, 'viagem'),
(NULL, 'Estacionamento Valet', 'Serviço de estacionamento valet', 'extras', 25.00, 'diária'),
(NULL, 'Internet Premium', 'Internet de alta velocidade', 'extras', 15.00, 'diária'),
(NULL, 'Cofre Digital', 'Uso do cofre digital', 'extras', 10.00, 'diária'),
(NULL, 'Pet Care', 'Cuidados com animais de estimação', 'extras', 50.00, 'diária'),
(NULL, 'Berço Baby', 'Berço para bebês', 'extras', 20.00, 'diária'),
(NULL, 'Cama Extra', 'Cama extra no quarto', 'extras', 40.00, 'diária');

-- Comentários para documentação
COMMENT ON TABLE hotel_consumption_items IS 'Itens disponíveis para consumo (minibar, room service, etc.)';
COMMENT ON TABLE hotel_consumption IS 'Registro de consumo dos hóspedes';
COMMENT ON COLUMN hotel_consumption_items.category IS 'Categoria: minibar, room_service, laundry, spa, extras';
COMMENT ON COLUMN hotel_consumption.total_price IS 'Preço total calculado (quantity * unit_price)';