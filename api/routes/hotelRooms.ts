import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  checkRoomAvailability
} from '../controllers/hotelRooms';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/hotel-rooms - Listar quartos
router.get('/', getRooms);

// GET /api/hotel-rooms/availability - Verificar disponibilidade
router.get('/availability', checkRoomAvailability);

// GET /api/hotel-rooms/:id - Buscar quarto por ID
router.get('/:id', getRoomById);

// POST /api/hotel-rooms - Criar novo quarto
router.post('/', createRoom);

// PUT /api/hotel-rooms/:id - Atualizar quarto
router.put('/:id', updateRoom);

// DELETE /api/hotel-rooms/:id - Deletar quarto
router.delete('/:id', deleteRoom);

export default router;