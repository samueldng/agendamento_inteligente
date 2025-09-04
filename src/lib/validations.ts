import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Hotel Room schemas
export const hotelRoomSchema = z.object({
  room_number: z.string().min(1, 'Número do quarto é obrigatório'),
  room_type: z.enum(['single', 'double', 'suite', 'family'], {
    errorMap: () => ({ message: 'Tipo de quarto inválido' }),
  }),
  capacity: z.number().min(1, 'Capacidade deve ser maior que 0'),
  base_price: z.number().min(0, 'Preço base deve ser maior ou igual a 0'),
  description: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional()
});

// Hotel Reservation schemas
export const hotelReservationSchema = z.object({
  guest_name: z.string().min(2, 'Nome do hóspede é obrigatório'),
  guest_email: z.string().email('Email inválido'),
  guest_phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  guest_document: z.string().min(5, 'Documento é obrigatório'),
  room_id: z.string().uuid('ID do quarto inválido'),
  check_in_date: z.string().refine((date) => {
    const checkIn = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkIn >= today;
  }, 'Data de check-in deve ser hoje ou no futuro'),
  check_out_date: z.string(),
  guests_count: z.number().min(1, 'Deve ter pelo menos 1 hóspede').max(10, 'Máximo 10 hóspedes'),
  total_amount: z.number().min(0, 'Valor total não pode ser negativo'),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'checked_in'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
  special_requests: z.string().optional(),
}).refine((data) => {
  const checkIn = new Date(data.check_in_date);
  const checkOut = new Date(data.check_out_date);
  return checkOut > checkIn;
}, {
  message: 'Data de check-out deve ser após check-in',
  path: ['check_out_date'],
});

// Hotel Check-in schemas
export const hotelCheckinSchema = z.object({
  reservation_id: z.string().uuid('ID da reserva inválido'),
  checkin_datetime: z.string().optional(),
  checkout_datetime: z.string().optional(),
  actual_guests: z.number().min(1, 'Número de hóspedes deve ser pelo menos 1').optional(),
  checkin_notes: z.string().optional(),
  checkout_notes: z.string().optional(),
  room_condition_checkin: z.string().optional(),
  room_condition_checkout: z.string().optional(),
  damages_reported: z.string().optional(),
  additional_charges: z.number().min(0, 'Taxas adicionais não podem ser negativas').optional(),
  payment_method: z.string().optional(),
  staff_checkin: z.string().optional(),
  staff_checkout: z.string().optional(),
});

// Hotel Consumption schemas
export const hotelConsumptionSchema = z.object({
  reservation_id: z.string().uuid('ID da reserva inválido'),
  item_id: z.string().uuid('ID do item inválido'),
  quantity: z.number().min(1, 'Quantidade deve ser pelo menos 1'),
  unit_price: z.number().min(0, 'Preço unitário não pode ser negativo'),
  total_price: z.number().min(0, 'Preço total não pode ser negativo'),
  consumed_at: z.string().optional(),
  notes: z.string().optional(),
});

// Hotel Consumption Item schemas
export const hotelConsumptionItemSchema = z.object({
  name: z.string().min(1, 'Nome do item é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

// Hotel Checkout schema
export const hotelCheckoutSchema = z.object({
  checkout_notes: z.string().optional(),
  room_condition_checkout: z.string().optional(),
  additional_charges: z.number().min(0, 'Taxas adicionais não podem ser negativas').optional(),
  payment_status: z.enum(['pending', 'partial', 'paid'], {
    errorMap: () => ({ message: 'Status de pagamento inválido' }),
  }).optional(),
});

// Hotel Pricing schemas
export const hotelPricingSchema = z.object({
  room_type: z.enum(['standard', 'deluxe', 'suite', 'presidential'], {
    errorMap: () => ({ message: 'Tipo de quarto inválido' }),
  }),
  base_price: z.number().min(0, 'Preço base não pode ser negativo'),
  weekend_price: z.number().min(0, 'Preço de fim de semana não pode ser negativo'),
  holiday_price: z.number().min(0, 'Preço de feriado não pode ser negativo'),
  season: z.enum(['low', 'high', 'peak'], {
    errorMap: () => ({ message: 'Temporada inválida' }),
  }),
  valid_from: z.string(),
  valid_until: z.string(),
}).refine((data) => {
  const from = new Date(data.valid_from);
  const until = new Date(data.valid_until);
  return until > from;
}, {
  message: 'Data final deve ser após data inicial',
  path: ['valid_until'],
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type HotelRoomFormData = z.infer<typeof hotelRoomSchema>;
export type HotelReservationFormData = z.infer<typeof hotelReservationSchema>;
export type HotelCheckinFormData = z.infer<typeof hotelCheckinSchema>;
export type HotelConsumptionFormData = z.infer<typeof hotelConsumptionSchema>;
export type HotelConsumptionItemFormData = z.infer<typeof hotelConsumptionItemSchema>;
export type HotelCheckoutFormData = z.infer<typeof hotelCheckoutSchema>;
export type HotelPricingFormData = z.infer<typeof hotelPricingSchema>;