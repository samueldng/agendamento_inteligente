import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nxvzrqewfgbcwsovaaiv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnpycWV3ZmdiY3dzb3ZhYWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDkzNzksImV4cCI6MjA3MTM4NTM3OX0.A5nhavahrp5W_4tUGkcdpcCFGKWPv7Y6f8ZaOsQsr8Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on actual Supabase schema
export type Database = {
  public: {
    Tables: {
      hotel_rooms: {
        Row: {
          id: string
          professional_id: string
          room_number: string
          room_type: string
          capacity: number
          base_price: number
          description: string | null
          amenities: string[]
          images: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          room_number: string
          room_type: string
          capacity: number
          base_price: number
          description?: string | null
          amenities?: string[]
          images?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          room_number?: string
          room_type?: string
          capacity?: number
          base_price?: number
          description?: string | null
          amenities?: string[]
          images?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      hotel_reservations: {
        Row: {
          id: string
          appointment_id: string | null
          room_id: string
          guest_name: string
          guest_document: string | null
          guest_phone: string | null
          guest_email: string | null
          num_guests: number
          check_in_date: string
          check_out_date: string
          check_in_time: string | null
          check_out_time: string | null
          meal_plan: string
          special_requests: string | null
          total_amount: number | null
          status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id?: string | null
          room_id: string
          guest_name: string
          guest_document?: string | null
          guest_phone?: string | null
          guest_email?: string | null
          num_guests: number
          check_in_date: string
          check_out_date: string
          check_in_time?: string | null
          check_out_time?: string | null
          meal_plan: string
          special_requests?: string | null
          total_amount?: number | null
          status?: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string | null
          room_id?: string
          guest_name?: string
          guest_document?: string | null
          guest_phone?: string | null
          guest_email?: string | null
          num_guests?: number
          check_in_date?: string
          check_out_date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          meal_plan?: string
          special_requests?: string | null
          total_amount?: number | null
          status?: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
          created_at?: string
          updated_at?: string
        }
      }
      hotel_checkins: {
        Row: {
          id: string
          reservation_id: string
          checkin_datetime: string | null
          checkout_datetime: string | null
          actual_guests: number | null
          checkin_notes: string | null
          checkout_notes: string | null
          room_condition_checkin: string | null
          room_condition_checkout: string | null
          damages_reported: string | null
          additional_charges: number | null
          payment_method: string | null
          staff_checkin: string | null
          staff_checkout: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reservation_id: string
          checkin_datetime?: string | null
          checkout_datetime?: string | null
          actual_guests?: number | null
          checkin_notes?: string | null
          checkout_notes?: string | null
          room_condition_checkin?: string | null
          room_condition_checkout?: string | null
          damages_reported?: string | null
          additional_charges?: number | null
          payment_method?: string | null
          staff_checkin?: string | null
          staff_checkout?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reservation_id?: string
          checkin_datetime?: string | null
          checkout_datetime?: string | null
          actual_guests?: number | null
          checkin_notes?: string | null
          checkout_notes?: string | null
          room_condition_checkin?: string | null
          room_condition_checkout?: string | null
          damages_reported?: string | null
          additional_charges?: number | null
          payment_method?: string | null
          staff_checkin?: string | null
          staff_checkout?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hotel_consumption: {
        Row: {
          id: string
          reservation_id: string
          item_id: string
          quantity: number
          unit_price: number
          total_price: number
          consumed_at: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reservation_id: string
          item_id: string
          quantity: number
          unit_price: number
          total_price: number
          consumed_at: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reservation_id?: string
          item_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          consumed_at?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hotel_consumption_items: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Legacy types for compatibility
export type HotelRoom = Database['public']['Tables']['hotel_rooms']['Row']
export type HotelReservation = Database['public']['Tables']['hotel_reservations']['Row']
export type HotelCheckin = Database['public']['Tables']['hotel_checkins']['Row']
export type HotelConsumption = Database['public']['Tables']['hotel_consumption']['Row']
export type HotelConsumptionItem = Database['public']['Tables']['hotel_consumption_items']['Row']

export interface HotelDashboardData {
  available_rooms: number
  active_guests: number
  occupancy_rate: number
  period_revenue: number
  recent_reservations: HotelReservation[]
  recent_checkins: HotelCheckin[]
  recent_consumption: HotelConsumption[]
}