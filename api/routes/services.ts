import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByProfessional,
  getPopularServices
} from '../controllers/services';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Schemas de validação
const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  duration: z.number().min(15, 'Duração mínima é 15 minutos').max(480, 'Duração máxima é 8 horas'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  professional_id: z.string().uuid('ID do profissional inválido')
});

const updateServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional(),
  duration: z.number().min(15, 'Duração mínima é 15 minutos').max(480, 'Duração máxima é 8 horas').optional(),
  price: z.number().min(0, 'Preço deve ser positivo').optional(),
  is_active: z.boolean().optional()
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  active: z.enum(['true', 'false']).optional(),
  professional_id: z.string().uuid().optional()
});

const professionalServicesSchema = z.object({
  active: z.enum(['true', 'false']).optional()
});

const popularServicesSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

// Rotas públicas
router.get('/popular', validateQuery(popularServicesSchema), getPopularServices);
router.get('/professional/:professionalId', validateQuery(professionalServicesSchema), getServicesByProfessional);

// Rotas protegidas
router.use(authenticateToken);

// Rotas que requerem autenticação
router.post('/', validateBody(createServiceSchema), createService);
router.get('/', validateQuery(paginationSchema), getServices);
router.get('/:id', getServiceById);
router.put('/:id', validateBody(updateServiceSchema), updateService);

// Rotas que requerem privilégios de admin
router.delete('/:id', requireAdmin, deleteService);

export default router;