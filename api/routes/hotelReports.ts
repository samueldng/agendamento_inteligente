import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateProfessionalId } from '../middleware/validation.js';
import { getHotelReports } from '../controllers/hotelReports.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /api/hotel-reports - Obter relatórios detalhados
router.get('/', validateProfessionalId, getHotelReports);

export default router;