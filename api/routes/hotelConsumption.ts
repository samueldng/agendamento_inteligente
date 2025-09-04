import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getConsumptionItems,
  getConsumptionByReservation,
  createConsumption,
  updateConsumption,
  deleteConsumption,
  getConsumptionReport
} from '../controllers/hotelConsumption';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para itens de consumo
router.get('/items', getConsumptionItems);

// Rotas para consumo
router.get('/reservation/:reservation_id', getConsumptionByReservation);
router.post('/', createConsumption);
router.put('/:id', updateConsumption);
router.delete('/:id', deleteConsumption);

// Relatórios
router.get('/report', getConsumptionReport);

export default router;