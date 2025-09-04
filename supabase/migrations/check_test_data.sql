-- Verificar se o usuário de teste existe
SELECT 'Users' as table_name, id, email, name, role, created_at 
FROM users 
WHERE email = 'admin@hotel.com';

-- Verificar se o profissional associado existe
SELECT 'Professionals' as table_name, p.id, p.name, p.email, p.user_id, u.email as user_email
FROM professionals p
LEFT JOIN users u ON p.user_id = u.id
WHERE p.email = 'admin@hotel.com' OR u.email = 'admin@hotel.com';

-- Verificar categoria de negócio Hotel
SELECT 'Business Categories' as table_name, id, name, description
FROM business_categories
WHERE name = 'Hotel';