-- Verificar permissões da tabela hotel_notifications
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'hotel_notifications' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Conceder permissões se necessário
GRANT SELECT ON hotel_notifications TO authenticated;
GRANT INSERT ON hotel_notifications TO authenticated;
GRANT UPDATE ON hotel_notifications TO authenticated;
GRANT DELETE ON hotel_notifications TO authenticated;

-- Verificar novamente as permissões
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'hotel_notifications' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;