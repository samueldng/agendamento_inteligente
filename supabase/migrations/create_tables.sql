-- Criação das tabelas para o sistema de agendamento inteligente

-- Tabela de usuários (auth integrada com Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'professional', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de profissionais
CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  working_hours JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- em minutos
  price DECIMAL(10,2) NOT NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  whatsapp_number VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_number VARCHAR(20) NOT NULL,
  to_number VARCHAR(20) NOT NULL,
  body TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  message_sid VARCHAR(255) UNIQUE NOT NULL,
  conversation_id UUID,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conversações
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_phone VARCHAR(20) NOT NULL,
  client_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'completed', 'abandoned')),
  context JSONB DEFAULT '{}',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_clients_whatsapp ON clients(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(client_phone);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_processed ON whatsapp_messages(processed);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (podem ser refinadas conforme necessário)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Professionals can view own data" ON professionals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage professionals" ON professionals FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Services are viewable by authenticated users" ON services FOR SELECT TO authenticated;
CREATE POLICY "Admins can manage services" ON services FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients are viewable by authenticated users" ON clients FOR SELECT TO authenticated;
CREATE POLICY "Admins can manage clients" ON clients FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Appointments are viewable by authenticated users" ON appointments FOR SELECT TO authenticated;
CREATE POLICY "Admins can manage appointments" ON appointments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "WhatsApp messages are viewable by authenticated users" ON whatsapp_messages FOR SELECT TO authenticated;
CREATE POLICY "Admins can manage WhatsApp messages" ON whatsapp_messages FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Conversations are viewable by authenticated users" ON conversations FOR SELECT TO authenticated;
CREATE POLICY "Admins can manage conversations" ON conversations FOR ALL USING (auth.jwt() ->> 'role' = 'admin');