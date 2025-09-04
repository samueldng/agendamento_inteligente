import { Router } from 'express';
import {
  createProfessional,
  getProfessionals,
  getProfessionalById,
  getProfessionalByUserId,
  updateProfessional,
  deleteProfessional,
  getProfessionalAvailability
} from '../controllers/professionals';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Schemas de validação
const createProfessionalSchema = z.object({
  user_id: z.string().uuid('ID do usuário inválido'),
  specialties: z.array(z.string()).optional(),
  bio: z.string().optional(),
  working_hours: z.object({
    monday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    tuesday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    wednesday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    thursday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    friday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    saturday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    sunday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional()
  }).optional()
});

const updateProfessionalSchema = z.object({
  specialties: z.array(z.string()).optional(),
  bio: z.string().optional(),
  working_hours: z.object({
    monday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    tuesday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    wednesday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    thursday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    friday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    saturday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    sunday: z.object({
      is_working: z.boolean(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional()
  }).optional(),
  is_active: z.boolean().optional()
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  active: z.enum(['true', 'false']).optional(),
  specialty: z.string().optional()
});

const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
});

// Rotas protegidas
router.use(authenticateToken);

// Rotas que requerem autenticação
router.post('/', requireAdmin, validateBody(createProfessionalSchema), createProfessional);
router.get('/', validateQuery(paginationSchema), getProfessionals);
router.get('/by-user', getProfessionalByUserId);
router.get('/:id', getProfessionalById);
router.put('/:id', validateBody(updateProfessionalSchema), updateProfessional);
router.get('/:id/availability', validateQuery(availabilitySchema), getProfessionalAvailability);

// Rotas que requerem privilégios de admin
router.delete('/:id', requireAdmin, deleteProfessional);

export default router;