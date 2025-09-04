-- Criar tabela de categorias de negócio
CREATE TABLE business_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR,
  color VARCHAR DEFAULT '#3B82F6',
  fields_config JSONB DEFAULT '{}',
  service_templates JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO business_categories (name, description, icon, color, fields_config, service_templates) VALUES
(
  'Saúde',
  'Profissionais da área da saúde',
  'Heart',
  '#EF4444',
  '{
    "required_fields": ["crm", "specialty"],
    "optional_fields": ["clinic_name", "insurance_accepted"],
    "specialty_options": [
      "Clínico Geral",
      "Cardiologia",
      "Dermatologia",
      "Pediatria",
      "Ginecologia",
      "Ortopedia",
      "Psiquiatria",
      "Neurologia"
    ]
  }',
  '[
    {"name": "Consulta", "duration": 30, "price": 150},
    {"name": "Retorno", "duration": 20, "price": 100},
    {"name": "Exame", "duration": 15, "price": 80}
  ]'
),
(
  'Beleza e Estética',
  'Salões de beleza, barbearias e estética',
  'Scissors',
  '#EC4899',
  '{
    "required_fields": ["services_offered"],
    "optional_fields": ["salon_name", "certifications"],
    "services_options": [
      "Corte de Cabelo",
      "Coloração",
      "Manicure",
      "Pedicure",
      "Sobrancelha",
      "Depilação",
      "Massagem",
      "Limpeza de Pele"
    ]
  }',
  '[
    {"name": "Corte Feminino", "duration": 60, "price": 80},
    {"name": "Corte Masculino", "duration": 30, "price": 40},
    {"name": "Manicure", "duration": 45, "price": 35},
    {"name": "Pedicure", "duration": 60, "price": 45}
  ]'
),
(
  'Consultoria',
  'Consultores e profissionais liberais',
  'Briefcase',
  '#8B5CF6',
  '{
    "required_fields": ["expertise_area"],
    "optional_fields": ["company_name", "certifications"],
    "expertise_options": [
      "Consultoria Empresarial",
      "Consultoria Financeira",
      "Consultoria de TI",
      "Consultoria Jurídica",
      "Consultoria de RH",
      "Consultoria de Marketing"
    ]
  }',
  '[
    {"name": "Consultoria (1h)", "duration": 60, "price": 200},
    {"name": "Análise de Projeto", "duration": 120, "price": 400},
    {"name": "Reunião de Alinhamento", "duration": 30, "price": 100}
  ]'
),
(
  'Educação',
  'Professores particulares e cursos',
  'GraduationCap',
  '#10B981',
  '{
    "required_fields": ["subject_area"],
    "optional_fields": ["education_level", "certifications"],
    "subject_options": [
      "Matemática",
      "Português",
      "Inglês",
      "Física",
      "Química",
      "História",
      "Geografia",
      "Informática"
    ]
  }',
  '[
    {"name": "Aula Particular (1h)", "duration": 60, "price": 60},
    {"name": "Aula em Grupo (1h)", "duration": 60, "price": 40},
    {"name": "Revisão para Prova", "duration": 90, "price": 90}
  ]'
),
(
  'Serviços Gerais',
  'Outros tipos de serviços e profissionais',
  'Wrench',
  '#6B7280',
  '{
    "required_fields": ["service_type"],
    "optional_fields": ["company_name", "license_number"],
    "service_options": [
      "Manutenção",
      "Limpeza",
      "Jardinagem",
      "Pintura",
      "Elétrica",
      "Encanamento",
      "Informática",
      "Outros"
    ]
  }',
  '[
    {"name": "Serviço Básico", "duration": 60, "price": 80},
    {"name": "Serviço Completo", "duration": 120, "price": 150},
    {"name": "Orçamento", "duration": 30, "price": 0}
  ]'
);

-- Adicionar coluna category_id na tabela professionals
ALTER TABLE professionals ADD COLUMN category_id UUID REFERENCES business_categories(id);

-- Adicionar coluna para campos dinâmicos
ALTER TABLE professionals ADD COLUMN dynamic_fields JSONB DEFAULT '{}';

-- Migrar dados existentes (assumindo que são da área da saúde)
UPDATE professionals 
SET category_id = (SELECT id FROM business_categories WHERE name = 'Saúde' LIMIT 1),
    dynamic_fields = jsonb_build_object('specialty', specialties[1])
WHERE specialties IS NOT NULL AND array_length(specialties, 1) > 0;

-- Remover a coluna specialties (após migração)
-- ALTER TABLE professionals DROP COLUMN specialties;

-- Habilitar RLS para a nova tabela
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para business_categories
CREATE POLICY "Todos podem visualizar categorias" ON business_categories
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem modificar categorias" ON business_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Conceder permissões
GRANT SELECT ON business_categories TO anon, authenticated;
GRANT ALL PRIVILEGES ON business_categories TO authenticated;

-- Criar índices para performance
CREATE INDEX idx_professionals_category_id ON professionals(category_id);
CREATE INDEX idx_business_categories_active ON business_categories(is_active);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para business_categories
CREATE TRIGGER update_business_categories_updated_at 
    BEFORE UPDATE ON business_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE business_categories IS 'Categorias de negócio para classificar diferentes tipos de profissionais';
COMMENT ON COLUMN business_categories.fields_config IS 'Configuração dos campos específicos para cada categoria';
COMMENT ON COLUMN business_categories.service_templates IS 'Templates de serviços padrão para a categoria';
COMMENT ON COLUMN professionals.dynamic_fields IS 'Campos específicos baseados na categoria do profissional';