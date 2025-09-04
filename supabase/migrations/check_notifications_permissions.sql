-- Verificar permissões atuais da tabela hotel_notifications
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'hotel_notifications'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Conceder permissões necessárias para a tabela hotel_notifications
GRANT SELECT, INSERT, UPDATE ON hotel_notifications TO authenticated;
GRANT SELECT ON hotel_notifications TO anon;

-- Verificar permissões após concessão
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'hotel_notifications'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;