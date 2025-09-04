import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateProfessionalId } from '../middleware/validation';
import { getHotelReports } from '../controllers/hotelReports';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/hotel-reports - Obter relatórios detalhados
router.get('/', validateProfessionalId, getHotelReports);

export default router;