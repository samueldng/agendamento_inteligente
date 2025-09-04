-- Inserir categoria de negócio para hotel
INSERT INTO business_categories (id, name, description, is_active, fields_config)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Hotel',
  'Categoria para profissionais de hotel',
  true,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Inserir usuário de teste
INSERT INTO users (id, email, name, phone, role)
VALUES (
  'a47ac10b-58cc-4372-a567-0e02b2c3d480',
  'admin@hotel.com',
  'Administrador Hotel',
  '(11) 99999-9999',
  'professional'
) ON CONFLICT (email) DO NOTHING;

-- Inserir profissional associado ao usuário
INSERT INTO professionals (id, user_id, name, email, phone, category_id, is_active, working_hours, dynamic_fields)
VALUES (
  'b47ac10b-58cc-4372-a567-0e02b2c3d481',
  'a47ac10b-58cc-4372-a567-0e02b2c3d480',
  'Administrador Hotel',
  'admin@hotel.com',
  '(11) 99999-9999',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  true,
  '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}, "wednesday": {"start": "08:00", "end": "18:00"}, "thursday": {"start": "08:00", "end": "18:00"}, "friday": {"start": "08:00", "end": "18:00"}}'::jsonb,
  '{}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Verificar permissões para as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON business_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON professionals TO anon, authenticated;