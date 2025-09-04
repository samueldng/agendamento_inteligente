import { Router } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import {
  getDashboardData,
  getQuickStats,
  getQuickStatsTest
} from '../controllers/hotelDashboard';

const router = Router();

// Schema de validação para parâmetros do dashboard
const dashboardQuerySchema = z.object({
  professional_id: z.string().uuid('Professional ID deve ser um UUID válido'),
  period: z.string().optional().default('30')
});

const quickStatsQuerySchema = z.object({
  professional_id: z.string().uuid('Professional ID deve ser um UUID válido')
});

// GET /api/hotel-dashboard/test - Rota de teste sem autenticação
router.get('/test', validateQuery(quickStatsQuerySchema), getQuickStatsTest);

// Aplicar autenticação a todas as outras rotas
router.use(authenticateToken);

// GET /api/hotel-dashboard - Obter dados completos do dashboard
router.get('/', validateQuery(dashboardQuerySchema), getDashboardData);

// GET /api/hotel-dashboard/quick - Obter estatísticas rápidas
router.get('/quick', validateQuery(quickStatsQuerySchema), getQuickStats);

export default router;