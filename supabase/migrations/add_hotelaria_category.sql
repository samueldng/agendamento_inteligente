-- Adicionar categoria Hotelaria ao sistema
INSERT INTO business_categories (name, description, icon, color, fields_config, service_templates) VALUES
(
  'Hotelaria',
  'Hotéis, pousadas e estabelecimentos de hospedagem',
  'Building',
  '#F59E0B',
  '{
    "required_fields": ["hotel_name", "hotel_type", "star_rating"],
    "optional_fields": ["cnpj", "address", "amenities", "check_in_time", "check_out_time"],
    "hotel_type_options": [
      "Hotel",
      "Pousada",
      "Resort",
      "Hotel Fazenda",
      "Hostel",
      "Apart Hotel",
      "Flat",
      "Motel"
    ],
    "star_rating_options": ["1", "2", "3", "4", "5"],
    "amenities_options": [
      "Wi-Fi Gratuito",
      "Estacionamento",
      "Piscina",
      "Academia",
      "Spa",
      "Restaurante",
      "Bar",
      "Room Service",
      "Lavanderia",
      "Pet Friendly",
      "Ar Condicionado",
      "TV a Cabo",
      "Frigobar",
      "Cofre",
      "Varanda",
      "Vista para o Mar",
      "Centro de Negócios",
      "Sala de Reuniões"
    ]
  }',
  '[
    {"name": "Quarto Standard", "duration": 1440, "price": 150, "description": "Quarto padrão com cama de casal"},
    {"name": "Quarto Luxo", "duration": 1440, "price": 250, "description": "Quarto luxo com vista panorâmica"},
    {"name": "Suíte Master", "duration": 1440, "price": 400, "description": "Suíte master com jacuzzi"},
    {"name": "Quarto Família", "duration": 1440, "price": 300, "description": "Quarto para até 4 pessoas"}
  ]'
);

-- Criar tabela para quartos/acomodações
CREATE TABLE hotel_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  room_number VARCHAR(20) NOT NULL,
  room_type VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  base_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(professional_id, room_number)
);

-- Criar tabela para tarifas dinâmicas
CREATE TABLE hotel_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES hotel_rooms(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_multiplier DECIMAL(3,2) DEFAULT 1.00,
  fixed_price DECIMAL(10,2),
  season_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela para reservas de hotel
CREATE TABLE hotel_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  room_id UUID REFERENCES hotel_rooms(id),
  guest_name VARCHAR(255) NOT NULL,
  guest_document VARCHAR(50),
  guest_phone VARCHAR(20),
  guest_email VARCHAR(255),
  num_guests INTEGER NOT NULL DEFAULT 1,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  meal_plan VARCHAR(50) DEFAULT 'Sem Refeição',
  special_requests TEXT,
  total_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela para check-in/check-out
CREATE TABLE hotel_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES hotel_reservations(id) ON DELETE CASCADE,
  check_in_datetime TIMESTAMPTZ,
  check_out_datetime TIMESTAMPTZ,
  actual_guests INTEGER,
  room_condition_checkin TEXT,
  room_condition_checkout TEXT,
  damages_reported TEXT,
  additional_charges DECIMAL(10,2) DEFAULT 0,
  guest_signature TEXT,
  staff_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_checkins ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para hotel_rooms
CREATE POLICY "Profissionais podem gerenciar seus quartos" ON hotel_rooms
  FOR ALL USING (
    professional_id IN (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Todos podem visualizar quartos ativos" ON hotel_rooms
  FOR SELECT USING (is_active = true);

-- Políticas RLS para hotel_pricing
CREATE POLICY "Profissionais podem gerenciar preços de seus quartos" ON hotel_pricing
  FOR ALL USING (
    room_id IN (
      SELECT id FROM hotel_rooms 
      WHERE professional_id IN (
        SELECT id FROM professionals WHERE user_id = auth.uid()
      )
    )
  );

-- Políticas RLS para hotel_reservations
CREATE POLICY "Profissionais podem ver reservas de seus quartos" ON hotel_reservations
  FOR ALL USING (
    room_id IN (
      SELECT id FROM hotel_rooms 
      WHERE professional_id IN (
        SELECT id FROM professionals WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Clientes podem ver suas próprias reservas" ON hotel_reservations
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE client_id = auth.uid()
    )
  );

-- Políticas RLS para hotel_checkins
CREATE POLICY "Profissionais podem gerenciar check-ins" ON hotel_checkins
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
GRANT SELECT ON hotel_rooms TO anon, authenticated;
GRANT ALL PRIVILEGES ON hotel_rooms TO authenticated;

GRANT SELECT ON hotel_pricing TO anon, authenticated;
GRANT ALL PRIVILEGES ON hotel_pricing TO authenticated;

GRANT SELECT ON hotel_reservations TO anon, authenticated;
GRANT ALL PRIVILEGES ON hotel_reservations TO authenticated;

GRANT SELECT ON hotel_checkins TO anon, authenticated;
GRANT ALL PRIVILEGES ON hotel_checkins TO authenticated;

-- Criar índices para performance
CREATE INDEX idx_hotel_rooms_professional_id ON hotel_rooms(professional_id);
CREATE INDEX idx_hotel_rooms_active ON hotel_rooms(is_active);
CREATE INDEX idx_hotel_pricing_room_id ON hotel_pricing(room_id);
CREATE INDEX idx_hotel_pricing_dates ON hotel_pricing(start_date, end_date);
CREATE INDEX idx_hotel_reservations_room_id ON hotel_reservations(room_id);
CREATE INDEX idx_hotel_reservations_dates ON hotel_reservations(check_in_date, check_out_date);
CREATE INDEX idx_hotel_reservations_status ON hotel_reservations(status);
CREATE INDEX idx_hotel_checkins_reservation_id ON hotel_checkins(reservation_id);

-- Triggers para updated_at
CREATE TRIGGER update_hotel_rooms_updated_at 
    BEFORE UPDATE ON hotel_rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_pricing_updated_at 
    BEFORE UPDATE ON hotel_pricing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_reservations_updated_at 
    BEFORE UPDATE ON hotel_reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_checkins_updated_at 
    BEFORE UPDATE ON hotel_checkins 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE hotel_rooms IS 'Quartos e acomodações dos hotéis';
COMMENT ON TABLE hotel_pricing IS 'Tarifas dinâmicas por período/sazonalidade';
COMMENT ON TABLE hotel_reservations IS 'Reservas de quartos de hotel';
COMMENT ON TABLE hotel_checkins IS 'Controle de check-in e check-out';

COMMENT ON COLUMN hotel_reservations.meal_plan IS 'Plano de refeições: Sem Refeição, Café da Manhã, Meia Pensão, Pensão Completa, All Inclusive';
COMMENT ON COLUMN hotel_reservations.status IS 'Status da reserva: confirmed, checked_in, checked_out, cancelled, no_show';
COMMENT ON COLUMN hotel_pricing.price_multiplier IS 'Multiplicador do preço base (ex: 1.5 = 50% mais caro)';