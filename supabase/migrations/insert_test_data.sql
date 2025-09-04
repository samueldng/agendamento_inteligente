-- Limpar dados existentes e inserir dados de teste para o sistema de hotel

-- Limpar dados existentes (em ordem devido às foreign keys)
DELETE FROM hotel_consumption WHERE reservation_id IN (
  SELECT id FROM hotel_reservations WHERE room_id IN (
    SELECT id FROM hotel_rooms WHERE professional_id = 'b47ac10b-58cc-4372-a567-0e02b2c3d481'
  )
);

DELETE FROM hotel_checkins WHERE reservation_id IN (
  SELECT id FROM hotel_reservations WHERE room_id IN (
    SELECT id FROM hotel_rooms WHERE professional_id = 'b47ac10b-58cc-4372-a567-0e02b2c3d481'
  )
);

DELETE FROM hotel_reservations WHERE room_id IN (
  SELECT id FROM hotel_rooms WHERE professional_id = 'b47ac10b-58cc-4372-a567-0e02b2c3d481'
);

DELETE FROM hotel_rooms WHERE professional_id = 'b47ac10b-58cc-4372-a567-0e02b2c3d481';

DELETE FROM hotel_consumption_items WHERE professional_id = 'b47ac10b-58cc-4372-a567-0e02b2c3d481';

-- Inserir quartos de teste
INSERT INTO hotel_rooms (id, professional_id, room_number, room_type, capacity, base_price, description, amenities, status) VALUES
('11111111-1111-1111-1111-111111111111', 'b47ac10b-58cc-4372-a567-0e02b2c3d481', '101', 'Standard', 2, 150.00, 'Quarto padrão com vista para o jardim', '["Wi-Fi", "TV", "Ar Condicionado"]', 'available'),
('22222222-2222-2222-2222-222222222222', 'b47ac10b-58cc-4372-a567-0e02b2c3d481', '102', 'Deluxe', 3, 250.00, 'Quarto deluxe com varanda', '["Wi-Fi", "TV", "Ar Condicionado", "Varanda", "Minibar"]', 'occupied'),
('33333333-3333-3333-3333-333333333333', 'b47ac10b-58cc-4372-a567-0e02b2c3d481', '201', 'Suite', 4, 400.00, 'Suíte executiva com sala de estar', '["Wi-Fi", "TV", "Ar Condicionado", "Sala de Estar", "Minibar", "Jacuzzi"]', 'available'),
('44444444-4444-4444-4444-444444444444', 'b47ac10b-58cc-4372-a567-0e02b2c3d481', '202', 'Standard', 2, 150.00, 'Quarto padrão com vista para a piscina', '["Wi-Fi", "TV", "Ar Condicionado"]', 'maintenance');

-- Inserir reservas de teste
INSERT INTO hotel_reservations (id, room_id, guest_name, guest_document, guest_phone, guest_email, num_guests, check_in_date, check_out_date, check_in_time, check_out_time, meal_plan, total_amount, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'João Silva', '123.456.789-00', '(11) 99999-9999', 'joao@email.com', 2, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', '14:00', '12:00', 'Café da Manhã', 750.00, 'checked_in'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Maria Santos', '987.654.321-00', '(11) 88888-8888', 'maria@email.com', 1, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days', '15:00', '11:00', 'Sem Refeição', 450.00, 'confirmed'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Pedro Costa', '456.789.123-00', '(11) 77777-7777', 'pedro@email.com', 3, CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', '16:00', '10:00', 'Pensão Completa', 1200.00, 'confirmed');

-- Inserir check-ins de teste
INSERT INTO hotel_checkins (id, reservation_id, check_in_datetime, actual_guests, room_condition_checkin, staff_notes) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_TIMESTAMP, 2, 'Quarto em perfeitas condições', 'Check-in realizado sem problemas');

-- Inserir itens de consumo disponíveis
INSERT INTO hotel_consumption_items (id, professional_id, name, category, price, description, is_active) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'b47ac10b-58cc-4372-a567-0e02b2c3d481', 'Água Mineral', 'Bebidas', 5.00, 'Água mineral 500ml', true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'b47ac10b-58cc-4372-a567-0e02b2c3d481', 'Refrigerante', 'Bebidas', 8.00, 'Refrigerante lata 350ml', true),
('12345678-1234-1234-1234-123456789012', 'b47ac10b-58cc-4372-a567-0e02b2c3d481', 'Sanduíche', 'Comidas', 25.00, 'Sanduíche misto quente', true),
('87654321-4321-4321-4321-210987654321', 'b47ac10b-58cc-4372-a567-0e02b2c3d481', 'Cerveja', 'Bebidas', 12.00, 'Cerveja long neck 330ml', true);

-- Inserir consumo de teste
INSERT INTO hotel_consumption (id, reservation_id, item_id, quantity, unit_price, total_price, consumed_at, notes, staff_member) VALUES
('11111111-2222-3333-4444-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, 5.00, 10.00, CURRENT_TIMESTAMP - INTERVAL '2 hours', 'Consumo do minibar', 'Funcionário 1'),
('66666666-7777-8888-9999-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 1, 8.00, 8.00, CURRENT_TIMESTAMP - INTERVAL '1 hour', 'Room service', 'Funcionário 2');

-- Garantir permissões para as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_checkins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_consumption TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_consumption_items TO authenticated;

GRANT SELECT ON hotel_rooms TO anon;
GRANT SELECT ON hotel_reservations TO anon;
GRANT SELECT ON hotel_checkins TO anon;
GRANT SELECT ON hotel_consumption TO anon;
GRANT SELECT ON hotel_consumption_items TO anon;