import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getCheckins,
  getCheckinById,
  performCheckin,
  performCheckout,
  getPendingCheckins,
  getPendingCheckouts
} from '../controllers/hotelCheckins';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/hotel-checkins - Listar check-ins
router.get('/', getCheckins);

// GET /api/hotel-checkins/pending-checkins - Buscar check-ins pendentes
router.get('/pending-checkins', getPendingCheckins);

// GET /api/hotel-checkins/pending-checkouts - Buscar check-outs pendentes
router.get('/pending-checkouts', getPendingCheckouts);

// GET /api/hotel-checkins/:id - Buscar check-in por ID
router.get('/:id', getCheckinById);

// POST /api/hotel-checkins - Realizar check-in
router.post('/', performCheckin);

// PUT /api/hotel-checkins/:id/checkout - Realizar check-out
router.put('/:id/checkout', performCheckout);

export default router;