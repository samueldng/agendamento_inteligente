import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ error: 'Erro de validação' });
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Parâmetros de consulta inválidos',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ error: 'Erro de validação' });
    }
  };
};

// Schemas de validação
export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'professional', 'client']).default('client')
});

export const createProfessionalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  specialties: z.array(z.string()).default([]),
  working_hours: z.object({
    monday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
    friday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional()
  }).default({})
});

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  duration: z.number().min(15, 'Duração mínima de 15 minutos'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  professional_id: z.string().uuid('ID do profissional inválido')
});

export const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido').optional(),
  whatsapp_number: z.string().min(10, 'WhatsApp deve ter pelo menos 10 dígitos'),
  notes: z.string().optional()
});

export const createAppointmentSchema = z.object({
  client_id: z.string().uuid('ID do cliente inválido'),
  professional_id: z.string().uuid('ID do profissional inválido'),
  service_id: z.string().uuid('ID do serviço inválido'),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM'),
  notes: z.string().optional()
});

export const updateAppointmentSchema = z.object({
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM').optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional()
});

export const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100))
});

// Middleware para validar professional_id
export const validateProfessionalId = (req: Request, res: Response, next: NextFunction) => {
  const professionalId = req.query.professional_id || req.body.professional_id;
  
  if (!professionalId) {
    return res.status(400).json({ error: 'professional_id é obrigatório' });
  }
  
  // Validar se é um UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(professionalId as string)) {
    return res.status(400).json({ error: 'professional_id deve ser um UUID válido' });
  }
  
  next();
};