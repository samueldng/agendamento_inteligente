import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, ApiResponse } from '../types/auth';

// Obter relatórios detalhados do hotel
export const getHotelReports = async (req: AuthRequest, res: Response) => {
  try {
    const { professional_id, start_date, end_date } = req.query;
    const userId = req.user?.id;

    if (!userId || !professional_id) {
      return res.status(400).json({
        success: false,
        error: 'Usuário e Professional ID são obrigatórios'
      } as ApiResponse);
    }

    const startDate = start_date ? new Date(start_date as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end_date ? new Date(end_date as string) : new Date();

    // 1. Buscar todas as reservas do período
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
        created_at,
        hotel_rooms!inner(
          id,
          room_number,
          room_type,
          professional_id
        )
      `)
      .eq('hotel_rooms.professional_id', professional_id)
      .gte('check_in_date', startDate.toISOString().split('T')[0])
      .lte('check_in_date', endDate.toISOString().split('T')[0])
      .order('check_in_date', { ascending: true });

    if (reservationsError) {
      console.error('Erro ao buscar reservas:', reservationsError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar reservas'
      } as ApiResponse);
    }

    // 2. Buscar todos os quartos
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('hotel_rooms')
      .select('id, room_number, room_type, status')
      .eq('professional_id', professional_id)
      .eq('is_active', true);

    if (roomsError) {
      console.error('Erro ao buscar quartos:', roomsError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar quartos'
      } as ApiResponse);
    }

    // 3. Buscar consumo do período
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
      .lte('consumed_at', endDate.toISOString())
      .order('consumed_at', { ascending: true });

    // 4. Calcular métricas principais
    const totalReservations = reservations?.length || 0;
    const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;
    const totalGuests = reservations?.reduce((sum, r) => sum + (r.num_guests || 0), 0) || 0;
    const averageDailyRate = totalReservations > 0 ? totalRevenue / totalReservations : 0;
    
    const consumptionRevenue = consumption?.reduce((sum, c) => sum + (c.total_price || 0), 0) || 0;
    
    // Calcular taxa de ocupação
    const totalRooms = rooms?.length || 0;
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const occupiedDays = reservations?.reduce((sum, r) => {
      const checkIn = new Date(r.check_in_date);
      const checkOut = new Date(r.check_out_date);
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) || 0;
    
    const occupancyRate = totalRooms > 0 && periodDays > 0 ? (occupiedDays / (totalRooms * periodDays)) * 100 : 0;

    // 5. Gerar dados de ocupação por dia
    const occupancyByDay = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayReservations = reservations?.filter(r => {
        const checkIn = new Date(r.check_in_date);
        const checkOut = new Date(r.check_out_date);
        return d >= checkIn && d < checkOut;
      }) || [];
      
      const dayOccupancy = totalRooms > 0 ? (dayReservations.length / totalRooms) * 100 : 0;
      const dayRevenue = dayReservations.reduce((sum, r) => {
        const checkIn = new Date(r.check_in_date);
        const checkOut = new Date(r.check_out_date);
        const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return sum + (r.total_amount || 0) / totalDays;
      }, 0);

      occupancyByDay.push({
        date: dateStr,
        occupancy: Math.round(dayOccupancy),
        revenue: Math.round(dayRevenue)
      });
    }

    // 6. Gerar dados de consumo por categoria
    const consumptionByCategory: { [key: string]: number } = {};
    consumption?.forEach(c => {
      const category = c.hotel_consumption_items?.category || 'Outros';
      consumptionByCategory[category] = (consumptionByCategory[category] || 0) + (c.total_price || 0);
    });

    const consumptionData = Object.entries(consumptionByCategory).map(([category, amount]) => ({
      category,
      amount
    }));

    // 7. Gerar relatório mensal (últimos 6 meses)
    const monthlyReports = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      
      const monthReservations = reservations?.filter(r => {
        const checkIn = new Date(r.check_in_date);
        return checkIn >= monthStart && checkIn <= monthEnd;
      }) || [];
      
      const monthRevenue = monthReservations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      const monthGuests = monthReservations.reduce((sum, r) => sum + (r.num_guests || 0), 0);
      
      monthlyReports.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        reservations: monthReservations.length,
        revenue: monthRevenue,
        guests: monthGuests,
        averageRate: monthReservations.length > 0 ? monthRevenue / monthReservations.length : 0
      });
    }

    const reportData = {
      summary: {
        totalReservations,
        totalRevenue,
        totalGuests,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        averageDailyRate: Math.round(averageDailyRate * 100) / 100,
        consumptionRevenue
      },
      occupancyByDay,
      consumptionData,
      monthlyReports,
      reservations: reservations || [],
      consumption: consumption || []
    };

    res.json({
      success: true,
      data: reportData
    } as ApiResponse<typeof reportData>);

  } catch (error) {
    console.error('Erro ao gerar relatórios:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};