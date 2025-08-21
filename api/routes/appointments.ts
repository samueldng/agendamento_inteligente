import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots,
  getTodayAppointments,
  getAppointmentStats
} from '../controllers/appointments';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Schemas de validação
const createAppointmentSchema = z.object({
  client_id: z.string().uuid('ID do cliente inválido'),
  professional_id: z.string().uuid('ID do profissional inválido'),
  service_id: z.string().uuid('ID do serviço inválido'),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM'),
  notes: z.string().optional()
});

const updateAppointmentSchema = z.object({
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM').optional(),
  service_id: z.string().uuid('ID do serviço inválido').optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional()
});

const cancelAppointmentSchema = z.object({
  reason: z.string().optional()
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  professional_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const availableSlotsSchema = z.object({
  professional_id: z.string().uuid('ID do profissional inválido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  service_id: z.string().uuid('ID do serviço inválido')
});

const todayAppointmentsSchema = z.object({
  professional_id: z.string().uuid().optional()
});

const statsSchema = z.object({
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  professional_id: z.string().uuid().optional()
});

// Rotas públicas para disponibilidade
router.get('/available-slots', validateQuery(availableSlotsSchema), getAvailableSlots);

// Rotas protegidas
router.use(authenticateToken);

// Rotas que requerem autenticação
router.post('/', validateBody(createAppointmentSchema), createAppointment);
router.get('/', validateQuery(paginationSchema), getAppointments);
router.get('/today', validateQuery(todayAppointmentsSchema), getTodayAppointments);
router.get('/stats', validateQuery(statsSchema), getAppointmentStats);
router.get('/:id', getAppointmentById);
router.put('/:id', validateBody(updateAppointmentSchema), updateAppointment);
router.patch('/:id/cancel', validateBody(cancelAppointmentSchema), cancelAppointment);

export default router;