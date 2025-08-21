import { Router } from 'express';
import {
  createClient,
  getClients,
  getClientById,
  getClientByPhone,
  updateClient,
  deleteClient,
  getClientStats,
  getRecentClients
} from '../controllers/clients';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Schemas de validação
const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(15, 'Telefone deve ter no máximo 15 dígitos'),
  email: z.string().email('Email inválido').optional(),
  notes: z.string().optional()
});

const updateClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(15, 'Telefone deve ter no máximo 15 dígitos').optional(),
  email: z.string().email('Email inválido').optional(),
  notes: z.string().optional(),
  is_active: z.boolean().optional()
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  active: z.enum(['true', 'false']).optional()
});

const recentClientsSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

// Rotas protegidas
router.use(authenticateToken);

// Rotas que requerem autenticação
router.post('/', validateBody(createClientSchema), createClient);
router.get('/', validateQuery(paginationSchema), getClients);
router.get('/recent', validateQuery(recentClientsSchema), getRecentClients);
router.get('/:id', getClientById);
router.get('/:id/stats', getClientStats);
router.get('/phone/:phone', getClientByPhone);
router.put('/:id', validateBody(updateClientSchema), updateClient);

// Rotas que requerem privilégios de admin
router.delete('/:id', requireAdmin, deleteClient);

export default router;