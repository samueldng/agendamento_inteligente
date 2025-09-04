import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  checkedInGuests: number;
  totalReservations: number;
  monthlyRevenue: number;
  occupancyRate: number;
  recentReservations: any[];
  recentCheckins: any[];
  recentConsumption: any[];
}

// Obter dados completos do dashboard
export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const { professional_id, period = '30' } = req.query;
    const userId = req.user?.id;

    if (!userId || !professional_id) {
      return res.status(400).json({
        success: false,
        error: 'Usuário e Professional ID são obrigatórios'
      } as ApiResponse);
    }

    const periodDays = parseInt(period as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const endDate = new Date();
    const today = new Date().toISOString().split('T')[0];

    // 1. Buscar total de quartos
    const { data: allRooms, error: roomsError } = await supabaseAdmin
      .from('hotel_rooms')
      .select('id, status')
      .eq('professional_id', professional_id)
      .eq('is_active', true);

    if (roomsError) {
      console.error('Erro ao buscar quartos:', roomsError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar quartos'
      } as ApiResponse);
    }

    // 2. Calcular status dos quartos
    const totalRooms = allRooms?.length || 0;
    const occupiedRooms = allRooms?.filter(room => room.status === 'occupied').length || 0;
    const maintenanceRooms = allRooms?.filter(room => room.status === 'maintenance').length || 0;
    const availableRooms = totalRooms - occupiedRooms - maintenanceRooms;

    // 3. Buscar reservas do período
    const { data: reservations, error: reservationsError } = await supabaseAdmin
      .from('hotel_reservations')
      .select(`
        id,
        guest_name,
        check_in_date,
        check_out_date,
        total_amount,
        status,
        num_guests,
        hotel_rooms!inner(
          id,
          room_number,
          professional_id
        )
      `)
      .eq('hotel_rooms.professional_id', professional_id)
      .gte('check_in_date', startDate.toISOString().split('T')[0])
      .lte('check_in_date', endDate.toISOString().split('T')[0])
      .order('created_at', { ascending: false });

    if (reservationsError) {
      console.error('Erro ao buscar reservas:', reservationsError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar reservas'
      } as ApiResponse);
    }

    // 4. Buscar check-ins recentes
    const { data: checkins, error: checkinsError } = await supabaseAdmin
      .from('hotel_checkins')
      .select(`
        id,
        check_in_datetime,
        check_out_datetime,
        actual_guests,
        hotel_reservations!inner(
          id,
          guest_name,
          hotel_rooms!inner(
            room_number,
            professional_id
          )
        )
      `)
      .eq('hotel_reservations.hotel_rooms.professional_id', professional_id)
      .gte('check_in_datetime', startDate.toISOString())
      .order('check_in_datetime', { ascending: false })
      .limit(10);

    if (checkinsError) {
      console.error('Erro ao buscar check-ins:', checkinsError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar check-ins'
      } as ApiResponse);
    }

    // 5. Buscar consumo recente
    const { data: consumption, error: consumptionError } = await supabaseAdmin
      .from('hotel_consumption')
      .select(`
        id,
        quantity,
        total_price,
        consumed_at,
        hotel_consumption_items(
          name,
          category
        ),
        hotel_reservations!inner(
          guest_name,
          hotel_rooms!inner(
            room_number,
            professional_id
          )
        )
      `)
      .eq('hotel_reservations.hotel_rooms.professional_id', professional_id)
      .gte('consumed_at', startDate.toISOString())
      .order('consumed_at', { ascending: false })
      .limit(10);

    if (consumptionError) {
      console.error('Erro ao buscar consumo:', consumptionError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar consumo'
      } as ApiResponse);
    }

    // 6. Calcular estatísticas
    const totalReservations = reservations?.length || 0;
    const checkedInGuests = checkins?.filter(c => c.check_in_datetime && !c.check_out_datetime)
      .reduce((total, c) => total + (c.actual_guests || 0), 0) || 0;
    
    const monthlyRevenue = reservations?.reduce((total, r) => {
      return total + (r.total_amount || 0);
    }, 0) || 0;

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 7. Formatar dados de resposta
    const recentReservations = reservations?.slice(0, 5).map(r => ({
      id: r.id,
      guestName: r.guest_name,
      roomNumber: r.hotel_rooms?.room_number,
      checkIn: r.check_in_date,
      checkOut: r.check_out_date,
      status: r.status,
      totalAmount: r.total_amount,
      numGuests: r.num_guests
    })) || [];

    const recentCheckins = checkins?.slice(0, 5).map(c => ({
      id: c.id,
      guestName: c.hotel_reservations?.guest_name,
      roomNumber: c.hotel_reservations?.hotel_rooms?.room_number,
      checkinDate: c.check_in_datetime,
      checkoutDate: c.check_out_datetime,
      guestsPresent: c.actual_guests
    })) || [];

    const recentConsumption = consumption?.slice(0, 5).map(c => ({
      id: c.id,
      itemName: c.hotel_consumption_items?.name,
      category: c.hotel_consumption_items?.category,
      guestName: c.hotel_reservations?.guest_name,
      roomNumber: c.hotel_reservations?.hotel_rooms?.room_number,
      quantity: c.quantity,
      totalPrice: c.total_price,
      consumedAt: c.consumed_at
    })) || [];

    const dashboardData: DashboardStats = {
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      checkedInGuests,
      totalReservations,
      monthlyRevenue,
      occupancyRate,
      recentReservations,
      recentCheckins,
      recentConsumption
    };

    res.json({
      success: true,
      data: dashboardData
    } as ApiResponse<DashboardStats>);

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Obter estatísticas rápidas para teste (sem autenticação)
export const getQuickStatsTest = async (req: Request, res: Response) => {
  try {
    const { professional_id } = req.query;

    if (!professional_id) {
      return res.status(400).json({
        success: false,
        error: 'Professional ID é obrigatório'
      } as ApiResponse);
    }

    const today = new Date().toISOString().split('T')[0];

    // Buscar estatísticas básicas
    const [roomsResult, reservationsResult, checkinsResult] = await Promise.all([
      // Total de quartos
      supabaseAdmin
        .from('hotel_rooms')
        .select('id, status')
        .eq('professional_id', professional_id)
        .eq('is_active', true),
      
      // Reservas de hoje
      supabaseAdmin
        .from('hotel_reservations')
        .select('id, total_amount, hotel_rooms!inner(professional_id)')
        .eq('hotel_rooms.professional_id', professional_id)
        .eq('check_in_date', today),
      
      // Check-ins de hoje
      supabaseAdmin
        .from('hotel_checkins')
        .select('id, actual_guests, hotel_reservations!inner(hotel_rooms!inner(professional_id))')
        .eq('hotel_reservations.hotel_rooms.professional_id', professional_id)
        .gte('check_in_datetime', today)
        .lt('check_in_datetime', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    ]);

    const rooms = roomsResult.data || [];
    const todayReservations = reservationsResult.data || [];
    const todayCheckins = checkinsResult.data || [];

    const quickStats = {
      totalRooms: rooms.length,
      availableRooms: rooms.filter(r => r.status === 'available').length,
      occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
      todayReservations: todayReservations.length,
      todayCheckins: todayCheckins.length,
      todayRevenue: todayReservations.reduce((total, r) => total + (r.total_amount || 0), 0)
    };

    res.json({
      success: true,
      data: quickStats
    } as ApiResponse<typeof quickStats>);

  } catch (error) {
    console.error('Erro ao buscar estatísticas rápidas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Obter estatísticas rápidas
export const getQuickStats = async (req: AuthRequest, res: Response) => {
  try {
    const { professional_id } = req.query;
    const userId = req.user?.id;

    if (!userId || !professional_id) {
      return res.status(400).json({
        success: false,
        error: 'Usuário e Professional ID são obrigatórios'
      } as ApiResponse);
    }

    const today = new Date().toISOString().split('T')[0];

    // Buscar estatísticas básicas
    const [roomsResult, reservationsResult, checkinsResult] = await Promise.all([
      // Total de quartos
      supabaseAdmin
        .from('hotel_rooms')
        .select('id, status')
        .eq('professional_id', professional_id)
        .eq('is_active', true),
      
      // Reservas de hoje
      supabaseAdmin
        .from('hotel_reservations')
        .select('id, total_amount, hotel_rooms!inner(professional_id)')
        .eq('hotel_rooms.professional_id', professional_id)
        .eq('check_in_date', today),
      
      // Check-ins de hoje
      supabaseAdmin
        .from('hotel_checkins')
        .select('id, actual_guests, hotel_reservations!inner(hotel_rooms!inner(professional_id))')
        .eq('hotel_reservations.hotel_rooms.professional_id', professional_id)
        .gte('check_in_datetime', today)
        .lt('check_in_datetime', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    ]);

    const rooms = roomsResult.data || [];
    const todayReservations = reservationsResult.data || [];
    const todayCheckins = checkinsResult.data || [];

    const quickStats = {
      totalRooms: rooms.length,
      availableRooms: rooms.filter(r => r.status === 'available').length,
      occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
      todayReservations: todayReservations.length,
      todayCheckins: todayCheckins.length,
      todayRevenue: todayReservations.reduce((total, r) => total + (r.total_amount || 0), 0)
    };

    res.json({
      success: true,
      data: quickStats
    } as ApiResponse<typeof quickStats>);

  } catch (error) {
    console.error('Erro ao buscar estatísticas rápidas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};