-- Adicionar coluna status na tabela hotel_rooms
ALTER TABLE hotel_rooms 
ADD COLUMN status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning'));

-- Atualizar quartos existentes com status padrão
UPDATE hotel_rooms SET status = 'available' WHERE status IS NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_hotel_rooms_status ON hotel_rooms(status);

-- Comentário da coluna
COMMENT ON COLUMN hotel_rooms.status IS 'Status atual do quarto: available, occupied, maintenance, cleaning';