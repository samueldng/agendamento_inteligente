import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  cancelReservation,
  getOccupancyStats
} from '../controllers/hotelReservations';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/hotel-reservations - Listar reservas
router.get('/', getReservations);

// GET /api/hotel-reservations/stats - Obter estatísticas de ocupação
router.get('/stats', getOccupancyStats);

// GET /api/hotel-reservations/:id - Buscar reserva por ID
router.get('/:id', getReservationById);

// POST /api/hotel-reservations - Criar nova reserva
router.post('/', createReservation);

// PUT /api/hotel-reservations/:id - Atualizar reserva
router.put('/:id', updateReservation);

// PUT /api/hotel-reservations/:id/cancel - Cancelar reserva
router.put('/:id/cancel', cancelReservation);

export default router;