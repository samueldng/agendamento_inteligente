-- Criar tabela para itens consumidos
CREATE TABLE IF NOT EXISTS hotel_consumption_items_consumed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consumption_id UUID REFERENCES hotel_consumption(id) ON DELETE CASCADE,
  item_id UUID REFERENCES hotel_consumption_items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE hotel_consumption_items_consumed ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own consumption items" ON hotel_consumption_items_consumed
  FOR SELECT USING (
    consumption_id IN (
      SELECT hc.id FROM hotel_consumption hc
      JOIN hotel_reservations hr ON hc.reservation_id = hr.id
      JOIN appointments a ON hr.appointment_id = a.id
      WHERE a.professional_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own consumption items" ON hotel_consumption_items_consumed
  FOR INSERT WITH CHECK (
    consumption_id IN (
      SELECT hc.id FROM hotel_consumption hc
      JOIN hotel_reservations hr ON hc.reservation_id = hr.id
      JOIN appointments a ON hr.appointment_id = a.id
      WHERE a.professional_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own consumption items" ON hotel_consumption_items_consumed
  FOR UPDATE USING (
    consumption_id IN (
      SELECT hc.id FROM hotel_consumption hc
      JOIN hotel_reservations hr ON hc.reservation_id = hr.id
      JOIN appointments a ON hr.appointment_id = a.id
      WHERE a.professional_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own consumption items" ON hotel_consumption_items_consumed
  FOR DELETE USING (
    consumption_id IN (
      SELECT hc.id FROM hotel_consumption hc
      JOIN hotel_reservations hr ON hc.reservation_id = hr.id
      JOIN appointments a ON hr.appointment_id = a.id
      WHERE a.professional_id = auth.uid()
    )
  );

-- Conceder permissões
GRANT ALL PRIVILEGES ON hotel_consumption_items_consumed TO authenticated;
GRANT SELECT ON hotel_consumption_items_consumed TO anon;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_hotel_consumption_items_consumed_consumption_id ON hotel_consumption_items_consumed(consumption_id);
CREATE INDEX IF NOT EXISTS idx_hotel_consumption_items_consumed_item_id ON hotel_consumption_items_consumed(item_id);

-- Comentários
COMMENT ON TABLE hotel_consumption_items_consumed IS 'Itens específicos consumidos em cada registro de consumo';
COMMENT ON COLUMN hotel_consumption_items_consumed.consumption_id IS 'ID do registro de consumo';
COMMENT ON COLUMN hotel_consumption_items_consumed.item_id IS 'ID do item consumido';
COMMENT ON COLUMN hotel_consumption_items_consumed.quantity IS 'Quantidade consumida';
COMMENT ON COLUMN hotel_consumption_items_consumed.unit_price IS 'Preço unitário no momento do consumo';
COMMENT ON COLUMN hotel_consumption_items_consumed.total_price IS 'Preço total (quantity * unit_price)';