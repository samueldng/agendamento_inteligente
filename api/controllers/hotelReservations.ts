import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import { createReservationNotifications } from '../hotel/notifications';

export interface HotelReservation {
  id: string;
  appointment_id?: string;
  room_id: string;
  guest_name: string;
  guest_document?: string;
  guest_phone?: string;
  guest_email?: string;
  num_guests: number;
  check_in_date: string;
  check_out_date: string;
  check_in_time?: string;
  check_out_time?: string;
  meal_plan: string;
  special_requests?: string;
  total_amount?: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  created_at: string;
  updated_at: string;
}

// Listar todas as reservas
export const getReservations = async (req: AuthRequest, res: Response) => {
  try {
    const { professional_id, status, start_date, end_date } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    let query = supabaseAdmin
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
      .order('check_in_date', { ascending: false });

    if (professional_id) {
      query = query.eq('hotel_rooms.professional_id', professional_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (start_date) {
      query = query.gte('check_in_date', start_date);
    }

    if (end_date) {
      query = query.lte('check_out_date', end_date);
    }

    const { data: reservations, error } = await query;

    if (error) {
      console.error('Erro ao buscar reservas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: reservations
    } as ApiResponse<HotelReservation[]>);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Buscar reserva por ID
export const getReservationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    const { data: reservation, error } = await supabaseAdmin
      .from('hotel_reservations')
      .select(`
        *,
        hotel_rooms(
          id,
          room_number,
          room_type,
          capacity,
          base_price,
          amenities
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar reserva:', error);
      return res.status(404).json({
        success: false,
        error: 'Reserva não encontrada'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: reservation
    } as ApiResponse<HotelReservation>);
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Criar nova reserva
export const createReservation = async (req: AuthRequest, res: Response) => {
  try {
    const {
      room_id,
      guest_name,
      guest_document,
      guest_phone,
      guest_email,
      num_guests,
      check_in_date,
      check_out_date,
      check_in_time,
      check_out_time,
      meal_plan,
      special_requests
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    // Validar dados obrigatórios
    if (!room_id || !guest_name || !num_guests || !check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        error: 'Room ID, nome do hóspede, número de hóspedes, data de check-in e check-out são obrigatórios'
      } as ApiResponse);
    }

    // Verificar se o quarto existe e está ativo
    const { data: room, error: roomError } = await supabaseAdmin
      .from('hotel_rooms')
      .select('id, capacity, base_price')
      .eq('id', room_id)
      .eq('is_active', true)
      .single();

    if (roomError || !room) {
      return res.status(400).json({
        success: false,
        error: 'Quarto não encontrado ou inativo'
      } as ApiResponse);
    }

    // Verificar capacidade do quarto
    if (num_guests > room.capacity) {
      return res.status(400).json({
        success: false,
        error: `Número de hóspedes (${num_guests}) excede a capacidade do quarto (${room.capacity})`
      } as ApiResponse);
    }

    // Verificar disponibilidade do quarto
    const { data: conflictingReservations, error: conflictError } = await supabaseAdmin
      .from('hotel_reservations')
      .select('id')
      .eq('room_id', room_id)
      .in('status', ['confirmed', 'checked_in'])
      .or(`and(check_in_date.lte.${check_out_date},check_out_date.gte.${check_in_date})`);

    if (conflictError) {
      console.error('Erro ao verificar disponibilidade:', conflictError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar disponibilidade'
      } as ApiResponse);
    }

    if (conflictingReservations && conflictingReservations.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Quarto não disponível para o período selecionado'
      } as ApiResponse);
    }

    // Calcular valor total (básico - pode ser expandido com tarifas dinâmicas)
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const total_amount = nights * room.base_price;

    const { data: reservation, error } = await supabaseAdmin
      .from('hotel_reservations')
      .insert({
        room_id,
        guest_name,
        guest_document,
        guest_phone,
        guest_email,
        num_guests: parseInt(num_guests),
        check_in_date,
        check_out_date,
        check_in_time,
        check_out_time,
        meal_plan: meal_plan || 'Sem Refeição',
        special_requests,
        total_amount,
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar reserva:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar reserva'
      } as ApiResponse);
    }

    // Criar notificações automáticas para a nova reserva
    try {
      await createReservationNotifications(reservation, userId);
    } catch (notificationError) {
      console.error('Erro ao criar notificações:', notificationError);
      // Não falhar a criação da reserva por erro de notificação
    }

    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reserva criada com sucesso'
    } as ApiResponse<HotelReservation>);
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Atualizar reserva
export const updateReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      guest_name,
      guest_document,
      guest_phone,
      guest_email,
      num_guests,
      check_in_date,
      check_out_date,
      check_in_time,
      check_out_time,
      meal_plan,
      special_requests,
      status
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    const updateData: Partial<HotelReservation> = {};
    
    if (guest_name !== undefined) updateData.guest_name = guest_name;
    if (guest_document !== undefined) updateData.guest_document = guest_document;
    if (guest_phone !== undefined) updateData.guest_phone = guest_phone;
    if (guest_email !== undefined) updateData.guest_email = guest_email;
    if (num_guests !== undefined) updateData.num_guests = parseInt(num_guests);
    if (check_in_date !== undefined) updateData.check_in_date = check_in_date;
    if (check_out_date !== undefined) updateData.check_out_date = check_out_date;
    if (check_in_time !== undefined) updateData.check_in_time = check_in_time;
    if (check_out_time !== undefined) updateData.check_out_time = check_out_time;
    if (meal_plan !== undefined) updateData.meal_plan = meal_plan;
    if (special_requests !== undefined) updateData.special_requests = special_requests;
    if (status !== undefined) updateData.status = status;

    const { data: reservation, error } = await supabaseAdmin
      .from('hotel_reservations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar reserva:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar reserva'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: reservation,
      message: 'Reserva atualizada com sucesso'
    } as ApiResponse<HotelReservation>);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Cancelar reserva
export const cancelReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    const { data: reservation, error } = await supabaseAdmin
      .from('hotel_reservations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao cancelar reserva:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao cancelar reserva'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: reservation,
      message: 'Reserva cancelada com sucesso'
    } as ApiResponse<HotelReservation>);
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Obter estatísticas de ocupação
export const getOccupancyStats = async (req: AuthRequest, res: Response) => {
  try {
    const { professional_id, start_date, end_date } = req.query;
    const userId = req.user?.id;

    if (!userId || !professional_id) {
      return res.status(400).json({
        success: false,
        error: 'Usuário e Professional ID são obrigatórios'
      } as ApiResponse);
    }

    // Buscar total de quartos do hotel
    const { data: totalRooms, error: roomsError } = await supabaseAdmin
      .from('hotel_rooms')
      .select('id')
      .eq('professional_id', professional_id)
      .eq('is_active', true);

    if (roomsError) {
      console.error('Erro ao buscar quartos:', roomsError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar quartos'
      } as ApiResponse);
    }

    // Buscar reservas no período
    let reservationQuery = supabaseAdmin
      .from('hotel_reservations')
      .select(`
        id,
        check_in_date,
        check_out_date,
        total_amount,
        status,
        hotel_rooms!inner(professional_id)
      `)
      .eq('hotel_rooms.professional_id', professional_id)
      .in('status', ['confirmed', 'checked_in', 'checked_out']);

    if (start_date) {
      reservationQuery = reservationQuery.gte('check_in_date', start_date);
    }

    if (end_date) {
      reservationQuery = reservationQuery.lte('check_out_date', end_date);
    }

    const { data: reservations, error: reservationsError } = await reservationQuery;

    if (reservationsError) {
      console.error('Erro ao buscar reservas:', reservationsError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar reservas'
      } as ApiResponse);
    }

    // Calcular estatísticas
    const totalRoomsCount = totalRooms?.length || 0;
    const totalReservations = reservations?.length || 0;
    const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;
    
    // Calcular taxa de ocupação (simplificado)
    const occupancyRate = totalRoomsCount > 0 ? (totalReservations / totalRoomsCount) * 100 : 0;
    
    // Calcular RevPAR (Revenue Per Available Room)
    const revPAR = totalRoomsCount > 0 ? totalRevenue / totalRoomsCount : 0;

    const stats = {
      total_rooms: totalRoomsCount,
      total_reservations: totalReservations,
      total_revenue: totalRevenue,
      occupancy_rate: Math.round(occupancyRate * 100) / 100,
      revpar: Math.round(revPAR * 100) / 100
    };

    res.json({
      success: true,
      data: stats
    } as ApiResponse<typeof stats>);
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};