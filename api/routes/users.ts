import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser
} from '../controllers/users';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Schemas de validação
const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'professional']).optional().default('professional')
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  role: z.enum(['admin', 'professional']).optional(),
  is_active: z.boolean().optional()
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  role: z.enum(['admin', 'professional']).optional(),
  active: z.enum(['true', 'false']).optional()
});

// Rotas públicas
router.post('/', validateBody(createUserSchema), createUser);

// Rotas protegidas
router.use(authenticateToken);

// Rota para obter usuário atual
router.get('/me', getCurrentUser);

// Rotas que requerem autenticação
router.get('/', validateQuery(paginationSchema), getUsers);
router.get('/:id', getUserById);
router.put('/:id', validateBody(updateUserSchema), updateUser);

// Rotas que requerem privilégios de admin
router.delete('/:id', requireAdmin, deleteUser);

export default router;