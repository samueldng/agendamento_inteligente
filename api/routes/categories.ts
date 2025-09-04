import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStats
} from '../controllers/categories';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Schemas de validação
const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal').optional(),
  fields_config: z.array(z.object({
    name: z.string().min(1, 'Nome do campo é obrigatório'),
    label: z.string().min(1, 'Label do campo é obrigatório'),
    type: z.enum(['text', 'email', 'phone', 'number', 'select', 'multiselect', 'textarea', 'date', 'time']),
    required: z.boolean().default(false),
    placeholder: z.string().optional(),
    options: z.array(z.string()).optional(),
    validation: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional()
    }).optional()
  })).optional(),
  service_templates: z.array(z.object({
    name: z.string().min(1, 'Nome do template é obrigatório'),
    description: z.string().optional(),
    duration: z.number().min(1, 'Duração deve ser maior que 0'),
    price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
    category: z.string().optional()
  })).optional(),
  is_active: z.boolean().default(true)
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal').optional(),
  fields_config: z.array(z.object({
    name: z.string().min(1, 'Nome do campo é obrigatório'),
    label: z.string().min(1, 'Label do campo é obrigatório'),
    type: z.enum(['text', 'email', 'phone', 'number', 'select', 'multiselect', 'textarea', 'date', 'time']),
    required: z.boolean().default(false),
    placeholder: z.string().optional(),
    options: z.array(z.string()).optional(),
    validation: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional()
    }).optional()
  })).optional(),
  service_templates: z.array(z.object({
    name: z.string().min(1, 'Nome do template é obrigatório'),
    description: z.string().optional(),
    duration: z.number().min(1, 'Duração deve ser maior que 0'),
    price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
    category: z.string().optional()
  })).optional(),
  is_active: z.boolean().optional()
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  active: z.enum(['true', 'false']).optional(),
  search: z.string().optional()
});

// Rotas públicas (para listar categorias ativas)
router.get('/', validateQuery(paginationSchema), getCategories);
router.get('/:id', getCategoryById);
router.get('/:id/stats', getCategoryStats);

// Rotas protegidas (requerem autenticação)
router.use(authenticateToken);

// Rotas que requerem privilégios de admin
router.post('/', requireAdmin, validateBody(createCategorySchema), createCategory);
router.put('/:id', requireAdmin, validateBody(updateCategorySchema), updateCategory);
router.delete('/:id', requireAdmin, deleteCategory);

export default router;