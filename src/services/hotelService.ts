import { supabase } from '../lib/supabase'
import type { Database, HotelRoom, HotelReservation, HotelCheckin, HotelConsumption, HotelConsumptionItem } from '../lib/supabase'

// Hotel Rooms Service
export const hotelRoomsService = {
  async getAll(professionalId: string) {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('is_active', true)
      .order('room_number')
    
    if (error) throw error
    return data as HotelRoom[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as HotelRoom
  },

  async create(room: Database['public']['Tables']['hotel_rooms']['Insert']) {
    console.log('🏨 hotelService - create chamado com dados:', room);
    
    const { data, error } = await supabase
      .from('hotel_rooms')
      .insert(room)
      .select()
      .single()
    
    console.log('🏨 hotelService - Resposta do Supabase:', { data, error });
    
    if (error) {
      console.error('❌ hotelService - Erro do Supabase:', error);
      throw error;
    }
    
    console.log('🏨 hotelService - Quarto criado com sucesso:', data);
    return data as HotelRoom
  },

  async update(id: string, room: Database['public']['Tables']['hotel_rooms']['Update']) {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .update({ ...room, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as HotelRoom
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('hotel_rooms')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  },

  async getAvailable(professionalId: string, checkInDate: string, checkOutDate: string, roomType?: string) {
    let query = supabase
      .from('hotel_rooms')
      .select(`
        *,
        hotel_reservations!left(
          id,
          check_in_date,
          check_out_date,
          status
        )
      `)
      .eq('professional_id', professionalId)
      .eq('is_active', true)
    
    if (roomType) {
      query = query.eq('room_type', roomType)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Filtrar quartos disponíveis
    const availableRooms = data?.filter(room => {
      const reservations = room.hotel_reservations || []
      return !reservations.some((reservation: any) => {
        if (reservation.status === 'cancelled' || reservation.status === 'checked_out') {
          return false
        }
        return (
          (checkInDate >= reservation.check_in_date && checkInDate < reservation.check_out_date) ||
          (checkOutDate > reservation.check_in_date && checkOutDate <= reservation.check_out_date) ||
          (checkInDate <= reservation.check_in_date && checkOutDate >= reservation.check_out_date)
        )
      })
    })
    
    return availableRooms?.map(room => {
      const { hotel_reservations, ...roomData } = room
      return roomData
    }) as HotelRoom[]
  }
};

// Hotel Reservations Service
export const hotelReservationsService = {
  async getAll(professionalId: string) {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        hotel_rooms!inner(
          id,
          room_number,
          room_type,
          professional_id
        )
      `)
      .eq('hotel_rooms.professional_id', professionalId)
      .order('check_in_date', { ascending: false })

    if (error) throw error
    return data as (HotelReservation & { hotel_rooms: HotelRoom })[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        hotel_rooms(
          id,
          room_number,
          room_type,
          capacity,
          base_price
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as HotelReservation & { hotel_rooms: HotelRoom }
  },

  async create(reservation: Database['public']['Tables']['hotel_reservations']['Insert']) {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .insert(reservation)
      .select(`
        *,
        hotel_rooms(
          id,
          room_number,
          room_type,
          capacity,
          base_price
        )
      `)
      .single()

    if (error) throw error
    return data as HotelReservation & { hotel_rooms: HotelRoom }
  },

  async update(id: string, reservation: Database['public']['Tables']['hotel_reservations']['Update']) {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .update({ ...reservation, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        hotel_rooms(
          id,
          room_number,
          room_type,
          capacity,
          base_price
        )
      `)
      .single()

    if (error) throw error
    return data as HotelReservation & { hotel_rooms: HotelRoom }
  },

  async cancel(id: string) {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        hotel_rooms(
          id,
          room_number,
          room_type,
          capacity,
          base_price
        )
      `)
      .single()

    if (error) throw error
    return data as HotelReservation & { hotel_rooms: HotelRoom }
  },

  async getByDateRange(professionalId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        hotel_rooms!inner(
          id,
          room_number,
          room_type,
          professional_id
        )
      `)
      .eq('hotel_rooms.professional_id', professionalId)
      .gte('check_in_date', startDate)
      .lte('check_out_date', endDate)
      .order('check_in_date')

    if (error) throw error
    return data as (HotelReservation & { hotel_rooms: HotelRoom })[]
  },

  async getByStatus(professionalId: string, status: HotelReservation['status']) {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        hotel_rooms!inner(
          id,
          room_number,
          room_type,
          professional_id
        )
      `)
      .eq('hotel_rooms.professional_id', professionalId)
      .eq('status', status)
      .order('check_in_date', { ascending: false })

    if (error) throw error
    return data as (HotelReservation & { hotel_rooms: HotelRoom })[]
  }
};

// Hotel Check-ins Service
export const hotelCheckinsService = {
  async getAll(professionalId: string) {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .select(`
        *,
        hotel_reservations!inner(
          *,
          hotel_rooms!inner(
            id,
            room_number,
            room_type,
            professional_id
          )
        )
      `)
      .eq('hotel_reservations.hotel_rooms.professional_id', professionalId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as (HotelCheckin & { 
      hotel_reservations: HotelReservation & { 
        hotel_rooms: HotelRoom 
      } 
    })[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .select(`
        *,
        hotel_reservations(
          *,
          hotel_rooms(
            id,
            room_number,
            room_type,
            capacity,
            base_price
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as HotelCheckin & { 
      hotel_reservations: HotelReservation & { 
        hotel_rooms: HotelRoom 
      } 
    }
  },

  async getByReservation(reservationId: string) {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .select(`
        *,
        hotel_reservations(
          *,
          hotel_rooms(
            id,
            room_number,
            room_type,
            capacity,
            base_price
          )
        )
      `)
      .eq('reservation_id', reservationId)
      .single()

    if (error) throw error
    return data as HotelCheckin & { 
      hotel_reservations: HotelReservation & { 
        hotel_rooms: HotelRoom 
      } 
    }
  },

  async create(checkin: Database['public']['Tables']['hotel_checkins']['Insert']) {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .insert(checkin)
      .select(`
        *,
        hotel_reservations(
          *,
          hotel_rooms(
            id,
            room_number,
            room_type,
            capacity,
            base_price
          )
        )
      `)
      .single()

    if (error) throw error
    return data as HotelCheckin & { 
      hotel_reservations: HotelReservation & { 
        hotel_rooms: HotelRoom 
      } 
    }
  },

  async update(id: string, checkin: Database['public']['Tables']['hotel_checkins']['Update']) {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .update({ ...checkin, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        hotel_reservations(
          *,
          hotel_rooms(
            id,
            room_number,
            room_type,
            capacity,
            base_price
          )
        )
      `)
      .single()

    if (error) throw error
    return data as HotelCheckin & { 
      hotel_reservations: HotelReservation & { 
        hotel_rooms: HotelRoom 
      } 
    }
  },

  async performCheckout(id: string, checkoutData: {
    checkout_notes?: string
    room_condition_checkout?: string
    damages_reported?: string
    additional_charges?: number
    payment_method?: string
    staff_checkout?: string
  }) {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .update({
        checkout_datetime: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...checkoutData
      })
      .eq('id', id)
      .select(`
        *,
        hotel_reservations(
          *,
          hotel_rooms(
            id,
            room_number,
            room_type,
            capacity,
            base_price
          )
        )
      `)
      .single()

    if (error) throw error
    
    // Atualizar status da reserva para checked_out
    await supabase
      .from('hotel_reservations')
      .update({ 
        status: 'checked_out',
        updated_at: new Date().toISOString()
      })
      .eq('id', data.reservation_id)

    return data as HotelCheckin & { 
      hotel_reservations: HotelReservation & { 
        hotel_rooms: HotelRoom 
      } 
    }
  }
};

// Hotel Consumption Service
export const hotelConsumptionService = {
  async getAll(professionalId: string) {
    const { data, error } = await supabase
      .from('hotel_consumption')
      .select(`
        *,
        hotel_consumption_items(
          id,
          name,
          category,
          price,
          description
        ),
        hotel_reservations!inner(
          *,
          hotel_rooms!inner(
            id,
            room_number,
            room_type,
            professional_id
          )
        )
      `)
      .eq('hotel_reservations.hotel_rooms.professional_id', professionalId)
      .order('consumed_at', { ascending: false })

    if (error) throw error
    return data as (HotelConsumption & {
      hotel_consumption_items: HotelConsumptionItem
      hotel_reservations: HotelReservation & {
        hotel_rooms: HotelRoom
      }
    })[]
  },

  async getByReservation(reservationId: string) {
    const { data, error } = await supabase
      .from('hotel_consumption')
      .select(`
        *,
        hotel_consumption_items(
          id,
          name,
          category,
          price,
          description
        )
      `)
      .eq('reservation_id', reservationId)
      .order('consumed_at', { ascending: false })

    if (error) throw error
    return data as (HotelConsumption & {
      hotel_consumption_items: HotelConsumptionItem
    })[]
  },

  async create(consumption: Database['public']['Tables']['hotel_consumption']['Insert']) {
    const { data, error } = await supabase
      .from('hotel_consumption')
      .insert(consumption)
      .select(`
        *,
        hotel_consumption_items(
          id,
          name,
          category,
          price,
          description
        )
      `)
      .single()

    if (error) throw error
    return data as HotelConsumption & {
      hotel_consumption_items: HotelConsumptionItem
    }
  },

  async update(id: string, consumption: Database['public']['Tables']['hotel_consumption']['Update']) {
    const { data, error } = await supabase
      .from('hotel_consumption')
      .update({ ...consumption, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        hotel_consumption_items(
          id,
          name,
          category,
          price,
          description
        )
      `)
      .single()

    if (error) throw error
    return data as HotelConsumption & {
      hotel_consumption_items: HotelConsumptionItem
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('hotel_consumption')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Hotel Consumption Items Service
export const hotelConsumptionItemsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('hotel_consumption_items')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error
    return data as HotelConsumptionItem[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('hotel_consumption_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as HotelConsumptionItem
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('hotel_consumption_items')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data as HotelConsumptionItem[]
  },

  async create(item: Database['public']['Tables']['hotel_consumption_items']['Insert']) {
    const { data, error } = await supabase
      .from('hotel_consumption_items')
      .insert(item)
      .select()
      .single()

    if (error) throw error
    return data as HotelConsumptionItem
  },

  async update(id: string, item: Database['public']['Tables']['hotel_consumption_items']['Update']) {
    const { data, error } = await supabase
      .from('hotel_consumption_items')
      .update({ ...item, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as HotelConsumptionItem
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('hotel_consumption_items')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }
}

// Dashboard Service
export const hotelDashboardService = {
  async getDashboardData(professionalId: string, startDate?: string, endDate?: string) {
    const today = new Date().toISOString().split('T')[0]
    const start = startDate || today
    const end = endDate || today

    // Buscar quartos disponíveis
    const availableRooms = await hotelRoomsService.getAvailable(professionalId, start, end)
    
    // Buscar reservas ativas
    const activeReservations = await hotelReservationsService.getByStatus(professionalId, 'checked_in')
    
    // Buscar todas as reservas do período
    const periodReservations = await hotelReservationsService.getByDateRange(professionalId, start, end)
    
    // Buscar todos os quartos
    const allRooms = await hotelRoomsService.getAll(professionalId)
    
    // Calcular taxa de ocupação
    const occupancyRate = allRooms.length > 0 
      ? ((allRooms.length - availableRooms.length) / allRooms.length) * 100 
      : 0
    
    // Calcular receita do período
    const periodRevenue = periodReservations.reduce((total, reservation) => {
      return total + (reservation.total_amount || 0)
    }, 0)
    
    // Buscar check-ins recentes
    const recentCheckins = await hotelCheckinsService.getAll(professionalId)
    
    // Buscar consumo recente
    const recentConsumption = await hotelConsumptionService.getAll(professionalId)
    
    return {
      available_rooms: availableRooms.length,
      active_guests: activeReservations.reduce((total, res) => total + res.num_guests, 0),
      occupancy_rate: Math.round(occupancyRate),
      period_revenue: periodRevenue,
      recent_reservations: periodReservations.slice(0, 5),
      recent_checkins: recentCheckins.slice(0, 5),
      recent_consumption: recentConsumption.slice(0, 5)
    }
  }
}