-- Criar tabela de notificações do hotel
CREATE TABLE hotel_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('reservation', 'checkin', 'checkout', 'reminder')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    read BOOLEAN NOT NULL DEFAULT false,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_hotel_notifications_user_id ON hotel_notifications(user_id);
CREATE INDEX idx_hotel_notifications_type ON hotel_notifications(type);
CREATE INDEX idx_hotel_notifications_read ON hotel_notifications(read);
CREATE INDEX idx_hotel_notifications_created_at ON hotel_notifications(created_at DESC);
CREATE INDEX idx_hotel_notifications_priority ON hotel_notifications(priority);

-- Habilitar RLS (Row Level Security)
ALTER TABLE hotel_notifications ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados poderem ver apenas suas próprias notificações
CREATE POLICY "Users can view their own notifications" ON hotel_notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários autenticados poderem inserir suas próprias notificações
CREATE POLICY "Users can insert their own notifications" ON hotel_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários autenticados poderem atualizar suas próprias notificações
CREATE POLICY "Users can update their own notifications" ON hotel_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários autenticados poderem deletar suas próprias notificações
CREATE POLICY "Users can delete their own notifications" ON hotel_notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_hotel_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER trigger_update_hotel_notifications_updated_at
    BEFORE UPDATE ON hotel_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_hotel_notifications_updated_at();

-- Conceder permissões para os roles anon e authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_notifications TO authenticated;

-- Função para limpar notificações antigas (mais de 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM hotel_notifications 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE hotel_notifications IS 'Tabela para armazenar notificações do sistema hoteleiro';
COMMENT ON COLUMN hotel_notifications.type IS 'Tipo da notificação: reservation, checkin, checkout, reminder';
COMMENT ON COLUMN hotel_notifications.priority IS 'Prioridade da notificação: low, medium, high';
COMMENT ON COLUMN hotel_notifications.data IS 'Dados adicionais da notificação em formato JSON';
COMMENT ON FUNCTION cleanup_old_notifications() IS 'Função para limpar notificações com mais de 30 dias';