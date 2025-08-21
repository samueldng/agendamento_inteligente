export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'professional' | 'client';
  created_at: string;
  updated_at: string;
}

export interface Professional {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  working_hours: WorkingHours;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // em minutos
  price: number;
  professional_id?: string; // opcional, pode ser oferecido por vários profissionais
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp_number: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  is_working: boolean;
  start_time?: string; // formato HH:mm
  end_time?: string; // formato HH:mm
  break_start?: string;
  break_end?: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: string;
  message_sid: string;
  conversation_id?: string;
  processed: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  client_phone: string;
  client_name?: string;
  status: 'active' | 'waiting' | 'completed' | 'abandoned';
  context: ConversationContext;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationContext {
  step: 'greeting' | 'service_selection' | 'professional_selection' | 'date_selection' | 'time_selection' | 'confirmation' | 'completed';
  selected_service?: string;
  selected_professional?: string;
  selected_date?: string;
  selected_time?: string;
  client_name?: string;
  client_email?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAppointmentRequest {
  client_id: string;
  professional_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  appointment_date?: string;
  start_time?: string;
  status?: Appointment['status'];
  notes?: string;
}

export interface AvailabilityRequest {
  professional_id: string;
  date: string;
  service_id: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}