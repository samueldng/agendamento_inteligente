import { supabase } from '../supabase';
import type { Database } from '../supabase';

type HotelRoom = Database['public']['Tables']['hotel_rooms']['Row'];
type HotelRoomInsert = Database['public']['Tables']['hotel_rooms']['Insert'];
type HotelRoomUpdate = Database['public']['Tables']['hotel_rooms']['Update'];

type HotelReservation = Database['public']['Tables']['hotel_reservations']['Row'];
type HotelReservationInsert = Database['public']['Tables']['hotel_reservations']['Insert'];
type HotelReservationUpdate = Database['public']['Tables']['hotel_reservations']['Update'];

type HotelCheckin = Database['public']['Tables']['hotel_checkins']['Row'];
type HotelCheckinInsert = Database['public']['Tables']['hotel_checkins']['Insert'];
type HotelCheckinUpdate = Database['public']['Tables']['hotel_checkins']['Update'];

type HotelConsumption = Database['public']['Tables']['hotel_consumption']['Row'];
type HotelConsumptionInsert = Database['public']['Tables']['hotel_consumption']['Insert'];

type HotelConsumptionItem = Database['public']['Tables']['hotel_consumption_items']['Row'];
type HotelConsumptionItemInsert = Database['public']['Tables']['hotel_consumption_items']['Insert'];

// Rooms API
export const roomsApi = {
  // Get all rooms
  async getAll(): Promise<HotelRoom[]> {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .select('*')
      .eq('is_active', true)
      .order('room_number');
    
    if (error) throw error;
    return data || [];
  },

  // Get room by ID
  async getById(id: string): Promise<HotelRoom | null> {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new room
  async create(room: HotelRoomInsert): Promise<HotelRoom> {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .insert(room)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update room
  async update(id: string, updates: HotelRoomUpdate): Promise<HotelRoom> {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete room (soft delete)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('hotel_rooms')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Update room status
  async updateStatus(id: string, status: string): Promise<HotelRoom> {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get available rooms for date range
  async getAvailable(checkIn: string, checkOut: string): Promise<HotelRoom[]> {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .select(`
        *,
        hotel_reservations!inner(
          id,
          check_in_date,
          check_out_date,
          status
        )
      `)
      .eq('is_active', true)
      .not('hotel_reservations.status', 'eq', 'cancelled')
      .not('hotel_reservations.status', 'eq', 'checked_out')
      .or(`check_out_date.lte.${checkIn},check_in_date.gte.${checkOut}`, { foreignTable: 'hotel_reservations' });
    
    if (error) throw error;
    return data || [];
  }
};

// Reservations API
export const reservationsApi = {
  // Get all reservations
  async getAll(): Promise<(HotelReservation & { room: HotelRoom })[]> {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        room:hotel_rooms(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get reservation by ID
  async getById(id: string): Promise<(HotelReservation & { room: HotelRoom }) | null> {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        room:hotel_rooms(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new reservation
  async create(reservation: HotelReservationInsert): Promise<HotelReservation> {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .insert(reservation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update reservation
  async update(id: string, updates: HotelReservationUpdate): Promise<HotelReservation> {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Cancel reservation
  async cancel(id: string): Promise<HotelReservation> {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .update({ 
        status: 'cancelled', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get reservations by status
  async getByStatus(status: HotelReservation['status']): Promise<(HotelReservation & { room: HotelRoom })[]> {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        room:hotel_rooms(*)
      `)
      .eq('status', status)
      .order('check_in_date');
    
    if (error) throw error;
    return data || [];
  },

  // Get reservations by professional
  async getByProfessional(professionalId: string): Promise<(HotelReservation & { room: HotelRoom })[]> {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        room:hotel_rooms(*)
      `)
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Check-ins API
export const checkinsApi = {
  // Get all check-ins
  async getAll(): Promise<(HotelCheckin & { reservation: HotelReservation & { room: HotelRoom } })[]> {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .select(`
        *,
        reservation:hotel_reservations(
          *,
          room:hotel_rooms(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get check-in by reservation ID
  async getByReservationId(reservationId: string): Promise<HotelCheckin | null> {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .select('*')
      .eq('reservation_id', reservationId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create check-in
  async create(checkin: HotelCheckinInsert): Promise<HotelCheckin> {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .insert(checkin)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update reservation status to checked_in
    await supabase
      .from('hotel_reservations')
      .update({ 
        status: 'checked_in',
        updated_at: new Date().toISOString()
      })
      .eq('id', checkin.reservation_id);
    
    return data;
  },

  // Update check-in
  async update(id: string, updates: HotelCheckinUpdate): Promise<HotelCheckin> {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Check-out
  async checkout(id: string, checkoutData: Partial<HotelCheckinUpdate>): Promise<HotelCheckin> {
    const { data: checkin, error: checkinError } = await supabase
      .from('hotel_checkins')
      .update({ 
        ...checkoutData,
        checkout_datetime: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, reservation_id')
      .single();
    
    if (checkinError) throw checkinError;
    
    // Update reservation status to checked_out
    await supabase
      .from('hotel_reservations')
      .update({ 
        status: 'checked_out',
        updated_at: new Date().toISOString()
      })
      .eq('id', checkin.reservation_id);
    
    return checkin;
  },

  // Get check-ins by professional
  async getByProfessional(professionalId: string): Promise<(HotelCheckin & { reservation: HotelReservation & { room: HotelRoom } })[]> {
    const { data, error } = await supabase
      .from('hotel_checkins')
      .select(`
        *,
        reservation:hotel_reservations(
          *,
          room:hotel_rooms(*)
        )
      `)
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get pending reservations (reservations without check-in)
  async getPendingReservations(professionalId: string): Promise<(HotelReservation & { room: HotelRoom })[]> {
    const { data, error } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        room:hotel_rooms(*)
      `)
      .eq('professional_id', professionalId)
      .eq('status', 'confirmed')
      .is('checkin_id', null)
      .order('check_in_date');
    
    if (error) throw error;
    return data || [];
  }
};

// Consumption API
export const consumptionApi = {
  // Get consumption items
  async getItems(): Promise<HotelConsumptionItem[]> {
    const { data, error } = await supabase
      .from('hotel_consumption_items')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get consumption by reservation
  async getByReservation(reservationId: string): Promise<(HotelConsumption & { item: HotelConsumptionItem })[]> {
    const { data, error } = await supabase
      .from('hotel_consumption')
      .select(`
        *,
        item:hotel_consumption_items(*)
      `)
      .eq('reservation_id', reservationId)
      .order('consumed_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Create consumption record
  async create(consumption: HotelConsumptionInsert): Promise<HotelConsumption> {
    const { data, error } = await supabase
      .from('hotel_consumption')
      .insert(consumption)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Add consumption items to a consumption record
  async addItems(consumptionId: string, items: Array<{
    item_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>): Promise<void> {
    const consumptionItems = items.map(item => ({
      consumption_id: consumptionId,
      item_id: item.item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    const { error } = await supabase
      .from('hotel_consumption_items_consumed')
      .insert(consumptionItems);
    
    if (error) throw error;
  },

  // Add consumption
  async add(consumption: HotelConsumptionInsert): Promise<HotelConsumption> {
    const { data, error } = await supabase
      .from('hotel_consumption')
      .insert(consumption)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Add multiple consumption items
  async addMultiple(consumptions: HotelConsumptionInsert[]): Promise<HotelConsumption[]> {
    const { data, error } = await supabase
      .from('hotel_consumption')
      .insert(consumptions)
      .select();
    
    if (error) throw error;
    return data || [];
  },

  // Create consumption item
  async createItem(item: HotelConsumptionItemInsert): Promise<HotelConsumptionItem> {
    const { data, error } = await supabase
      .from('hotel_consumption_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Dashboard API
export const dashboardApi = {
  // Get dashboard statistics
  async getStats(): Promise<{
    totalRooms: number;
    availableRooms: number;
    activeGuests: number;
    occupancyRate: number;
    todayRevenue: number;
    monthRevenue: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    // Get total rooms
    const { count: totalRooms } = await supabase
      .from('hotel_rooms')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get active reservations (checked in)
    const { data: activeReservations } = await supabase
      .from('hotel_reservations')
      .select('num_guests, total_amount')
      .eq('status', 'checked_in');

    // Get today's revenue
    const { data: todayConsumption } = await supabase
      .from('hotel_consumption')
      .select('total_price')
      .gte('consumed_at', today)
      .lt('consumed_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    // Get month's revenue
    const { data: monthReservations } = await supabase
      .from('hotel_reservations')
      .select('total_amount')
      .gte('check_in_date', monthStart)
      .lte('check_in_date', monthEnd)
      .neq('status', 'cancelled');

    const activeGuests = activeReservations?.reduce((sum, res) => sum + res.num_guests, 0) || 0;
    const availableRooms = (totalRooms || 0) - (activeReservations?.length || 0);
    const occupancyRate = totalRooms ? ((activeReservations?.length || 0) / totalRooms) * 100 : 0;
    const todayRevenue = todayConsumption?.reduce((sum, cons) => sum + cons.total_price, 0) || 0;
    const monthRevenue = monthReservations?.reduce((sum, res) => sum + (res.total_amount || 0), 0) || 0;

    return {
      totalRooms: totalRooms || 0,
      availableRooms,
      activeGuests,
      occupancyRate,
      todayRevenue,
      monthRevenue
    };
  },

  // Get recent activities
  async getRecentActivities(): Promise<{
    recentReservations: (HotelReservation & { room: HotelRoom })[];
    recentCheckins: (HotelCheckin & { reservation: HotelReservation & { room: HotelRoom } })[];
    recentConsumption: (HotelConsumption & { item: HotelConsumptionItem; reservation: HotelReservation })[];
  }> {
    const { data: recentReservations } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        room:hotel_rooms(*)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentCheckins } = await supabase
      .from('hotel_checkins')
      .select(`
        *,
        reservation:hotel_reservations(
          *,
          room:hotel_rooms(*)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentConsumption } = await supabase
      .from('hotel_consumption')
      .select(`
        *,
        item:hotel_consumption_items(*),
        reservation:hotel_reservations(*)
      `)
      .order('consumed_at', { ascending: false })
      .limit(5);

    return {
      recentReservations: recentReservations || [],
      recentCheckins: recentCheckins || [],
      recentConsumption: recentConsumption || []
    };
  }
};