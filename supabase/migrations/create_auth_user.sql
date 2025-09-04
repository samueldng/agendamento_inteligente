-- Criar usuário no Supabase Auth
-- Nota: Este script deve ser executado no painel do Supabase ou via API
-- O ID do usuário deve corresponder ao ID na tabela users

-- Inserir na tabela auth.users (apenas para referência - deve ser feito via Supabase Auth API)
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   is_super_admin,
--   confirmation_token,
--   email_change,
--   email_change_token_new,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   'a47ac10b-58cc-4372-a567-0e02b2c3d480',
--   'authenticated',
--   'authenticated',
--   'admin@hotel.com',
--   crypt('123456', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"provider": "email", "providers": ["email"]}',
--   '{"full_name": "Administrador Hotel"}',
--   false,
--   '',
--   '',
--   '',
--   ''
-- );

-- Atualizar o user_id na tabela professionals para corresponder ao ID do Supabase Auth
-- Isso será feito automaticamente quando o usuário fizer login

-- Verificar se os dados estão corretos
SELECT 
  u.id as user_id,
  u.email as user_email,
  u.name as user_name,
  p.id as professional_id,
  p.name as professional_name,
  p.email as professional_email
FROM users u
LEFT JOIN professionals p ON p.user_id = u.id
WHERE u.email = 'admin@hotel.com';