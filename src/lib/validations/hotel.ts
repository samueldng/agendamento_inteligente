import { z } from 'zod';

// Hotel Room validation schema
export const hotelRoomSchema = z.object({
  room_number: z.string().min(1, 'Número do quarto é obrigatório'),
  room_type: z.enum(['single', 'double', 'suite', 'family'], {
    errorMap: () => ({ message: 'Tipo de quarto inválido' })
  }),
  capacity: z.number().min(1, 'Capacidade deve ser pelo menos 1').max(10, 'Capacidade máxima é 10'),
  base_price: z.number().min(0, 'Preço deve ser positivo'),
  amenities: z.array(z.string()).optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
});

// Hotel Reservation validation schema
export const hotelReservationSchema = z.object({
  guest_name: z.string().min(1, 'Nome do hóspede é obrigatório'),
  guest_email: z.string().email('Email inválido'),
  guest_phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  guest_document: z.string().min(1, 'Documento é obrigatório'),
  room_id: z.string().uuid('ID do quarto inválido'),
  check_in_date: z.string().refine((date) => {
    const checkIn = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkIn >= today;
  }, 'Data de check-in deve ser hoje ou no futuro'),
  check_out_date: z.string(),
  num_guests: z.number().min(1, 'Número de hóspedes deve ser pelo menos 1'),
  special_requests: z.string().optional(),
  total_amount: z.number().min(0, 'Valor total deve ser positivo')
}).refine((data) => {
  const checkIn = new Date(data.check_in_date);
  const checkOut = new Date(data.check_out_date);
  return checkOut > checkIn;
}, {
  message: 'Data de check-out deve ser após check-in',
  path: ['check_out_date']
});

// Hotel Check-in validation schema
export const hotelCheckinSchema = z.object({
  reservation_id: z.string().uuid('ID da reserva inválido'),
  checkin_datetime: z.string().optional(),
  actual_guests: z.number().min(1, 'Número de hóspedes deve ser pelo menos 1'),
  notes: z.string().optional(),
  room_condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  key_cards_issued: z.number().min(0, 'Número de cartões deve ser positivo').optional()
});

// Hotel Check-out validation schema
export const hotelCheckoutSchema = z.object({
  checkout_datetime: z.string().optional(),
  room_condition: z.enum(['excellent', 'good', 'fair', 'poor'], {
    errorMap: () => ({ message: 'Condição do quarto é obrigatória' })
  }),
  damages_reported: z.string().optional(),
  additional_charges: z.number().min(0, 'Taxas adicionais devem ser positivas').optional(),
  notes: z.string().optional()
});

// Hotel Consumption validation schema
export const hotelConsumptionSchema = z.object({
  reservation_id: z.string().uuid('ID da reserva inválido'),
  consumption_date: z.string().min(1, 'Data de consumo é obrigatória'),
  total_amount: z.number().min(0, 'Valor total deve ser positivo'),
  notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending')
});

// Hotel Consumption Item validation schema for individual items
export const hotelConsumptionItemCreateSchema = z.object({
  consumption_id: z.string().uuid('ID do consumo inválido'),
  item_id: z.string().uuid('ID do item inválido'),
  quantity: z.number().min(1, 'Quantidade deve ser pelo menos 1'),
  unit_price: z.number().min(0, 'Preço unitário deve ser positivo'),
  total_price: z.number().min(0, 'Preço total deve ser positivo')
});

// Hotel Consumption Item validation schema
export const hotelConsumptionItemSchema = z.object({
  name: z.string().min(1, 'Nome do item é obrigatório'),
  category: z.enum(['minibar', 'room_service', 'laundry', 'spa', 'other'], {
    errorMap: () => ({ message: 'Categoria inválida' })
  }),
  price: z.number().min(0, 'Preço deve ser positivo'),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
});

// Search/Filter schemas
export const roomSearchSchema = z.object({
  check_in_date: z.string().min(1, 'Data de check-in é obrigatória'),
  check_out_date: z.string().min(1, 'Data de check-out é obrigatória'),
  num_guests: z.number().min(1, 'Número de hóspedes deve ser pelo menos 1').optional(),
  room_type: z.enum(['single', 'double', 'suite', 'family']).optional()
}).refine((data) => {
  const checkIn = new Date(data.check_in_date);
  const checkOut = new Date(data.check_out_date);
  return checkOut > checkIn;
}, {
  message: 'Data de check-out deve ser após check-in',
  path: ['check_out_date']
});

export const reservationFilterSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  guest_name: z.string().optional(),
  room_number: z.string().optional()
});

// Types
export type HotelRoomFormData = z.infer<typeof hotelRoomSchema>;
export type HotelReservationFormData = z.infer<typeof hotelReservationSchema>;
export type HotelCheckinFormData = z.infer<typeof hotelCheckinSchema>;
export type HotelCheckoutFormData = z.infer<typeof hotelCheckoutSchema>;
export type HotelConsumptionFormData = z.infer<typeof hotelConsumptionSchema>;
export type HotelConsumptionItemFormData = z.infer<typeof hotelConsumptionItemSchema>;
export type HotelConsumptionItemCreateData = z.infer<typeof hotelConsumptionItemCreateSchema>;
export type RoomSearchFormData = z.infer<typeof roomSearchSchema>;
export type ReservationFilterFormData = z.infer<typeof reservationFilterSchema>;

// Alias for backward compatibility
export type HotelConsumption = HotelConsumptionFormData;
export type HotelRoom = HotelRoomFormData;
export type HotelReservation = HotelReservationFormData;
export type HotelCheckin = HotelCheckinFormData;
export type HotelCheckout = HotelCheckoutFormData;