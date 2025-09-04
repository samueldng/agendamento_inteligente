import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import { createCheckinNotifications, createCheckoutNotifications } from '../hotel/notifications';

export interface HotelCheckin {
  id: string;
  reservation_id: string;
  checkin_datetime?: string;
  checkout_datetime?: string;
  actual_guests?: number;
  checkin_notes?: string;
  checkout_notes?: string;
  room_condition_checkin?: string;
  room_condition_checkout?: string;
  damages_reported?: string;
  additional_charges?: number;
  payment_method?: string;
  staff_checkin?: string;
  staff_checkout?: string;
  created_at: string;
  updated_at: string;
}

// Listar todos os check-ins
export const getCheckins = async (req: AuthRequest, res: Response) => {
  try {
    const { professional_id, status, date } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    let query = supabaseAdmin
      .from('hotel_checkins')
      .select(`
        *,
        hotel_reservations!inner(
          id,
          guest_name,
          check_in_date,
          check_out_date,
          status,
          hotel_rooms!inner(
            room_number,
            room_type,
            professional_id
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (professional_id) {
      query = query.eq('hotel_reservations.hotel_rooms.professional_id', professional_id);
    }

    if (date) {
      query = query.gte('checkin_datetime', `${date}T00:00:00`)
                   .lte('checkin_datetime', `${date}T23:59:59`);
    }

    const { data: checkins, error } = await query;

    if (error) {
      console.error('Erro ao buscar check-ins:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: checkins
    } as ApiResponse<HotelCheckin[]>);
  } catch (error) {
    console.error('Erro ao buscar check-ins:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Buscar check-in por ID
export const getCheckinById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    const { data: checkin, error } = await supabaseAdmin
      .from('hotel_checkins')
      .select(`
        *,
        hotel_reservations(
          id,
          guest_name,
          guest_document,
          guest_phone,
          guest_email,
          num_guests,
          check_in_date,
          check_out_date,
          meal_plan,
          special_requests,
          total_amount,
          status,
          hotel_rooms(
            room_number,
            room_type,
            capacity,
            amenities
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar check-in:', error);
      return res.status(404).json({
        success: false,
        error: 'Check-in não encontrado'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: checkin
    } as ApiResponse<HotelCheckin>);
  } catch (error) {
    console.error('Erro ao buscar check-in:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Realizar check-in
export const performCheckin = async (req: AuthRequest, res: Response) => {
  try {
    const {
      reservation_id,
      actual_guests,
      checkin_notes,
      room_condition_checkin,
      staff_checkin
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    if (!reservation_id) {
      return res.status(400).json({
        success: false,
        error: 'ID da reserva é obrigatório'
      } as ApiResponse);
    }

    // Verificar se a reserva existe e está confirmada
    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from('hotel_reservations')
      .select('id, status, check_in_date, num_guests')
      .eq('id', reservation_id)
      .eq('status', 'confirmed')
      .single();

    if (reservationError || !reservation) {
      return res.status(400).json({
        success: false,
        error: 'Reserva não encontrada ou não está confirmada'
      } as ApiResponse);
    }

    // Verificar se já existe um check-in para esta reserva
    const { data: existingCheckin, error: existingError } = await supabaseAdmin
      .from('hotel_checkins')
      .select('id')
      .eq('reservation_id', reservation_id)
      .single();

    if (existingCheckin) {
      return res.status(400).json({
        success: false,
        error: 'Check-in já foi realizado para esta reserva'
      } as ApiResponse);
    }

    // Criar registro de check-in
    const checkinData = {
      reservation_id,
      checkin_datetime: new Date().toISOString(),
      actual_guests: actual_guests || reservation.num_guests,
      checkin_notes,
      room_condition_checkin: room_condition_checkin || 'Bom',
      staff_checkin: staff_checkin || userId
    };

    const { data: checkin, error: checkinError } = await supabaseAdmin
      .from('hotel_checkins')
      .insert(checkinData)
      .select()
      .single();

    if (checkinError) {
      console.error('Erro ao criar check-in:', checkinError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao realizar check-in'
      } as ApiResponse);
    }

    // Atualizar status da reserva para 'checked_in'
    const { error: updateError } = await supabaseAdmin
      .from('hotel_reservations')
      .update({ status: 'checked_in' })
      .eq('id', reservation_id);

    if (updateError) {
      console.error('Erro ao atualizar status da reserva:', updateError);
      // Não retornar erro aqui, pois o check-in já foi criado
    }

    // Criar notificações automáticas para o check-in
    try {
      await createCheckinNotifications(checkin, userId);
    } catch (notificationError) {
      console.error('Erro ao criar notificações de check-in:', notificationError);
      // Não falhar o check-in por erro de notificação
    }

    res.status(201).json({
      success: true,
      data: checkin,
      message: 'Check-in realizado com sucesso'
    } as ApiResponse<HotelCheckin>);
  } catch (error) {
    console.error('Erro ao realizar check-in:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Realizar check-out
export const performCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      checkout_notes,
      room_condition_checkout,
      damages_reported,
      additional_charges,
      payment_method,
      staff_checkout
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    // Verificar se o check-in existe e ainda não foi feito check-out
    const { data: existingCheckin, error: existingError } = await supabaseAdmin
      .from('hotel_checkins')
      .select('id, reservation_id, checkout_datetime')
      .eq('id', id)
      .single();

    if (existingError || !existingCheckin) {
      return res.status(404).json({
        success: false,
        error: 'Check-in não encontrado'
      } as ApiResponse);
    }

    if (existingCheckin.checkout_datetime) {
      return res.status(400).json({
        success: false,
        error: 'Check-out já foi realizado'
      } as ApiResponse);
    }

    // Atualizar registro de check-in com dados do check-out
    const checkoutData = {
      checkout_datetime: new Date().toISOString(),
      checkout_notes,
      room_condition_checkout: room_condition_checkout || 'Bom',
      damages_reported,
      additional_charges: additional_charges || 0,
      payment_method,
      staff_checkout: staff_checkout || userId
    };

    const { data: checkin, error: checkoutError } = await supabaseAdmin
      .from('hotel_checkins')
      .update(checkoutData)
      .eq('id', id)
      .select()
      .single();

    if (checkoutError) {
      console.error('Erro ao realizar check-out:', checkoutError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao realizar check-out'
      } as ApiResponse);
    }

    // Atualizar status da reserva para 'checked_out'
    const { error: updateError } = await supabaseAdmin
      .from('hotel_reservations')
      .update({ status: 'checked_out' })
      .eq('id', existingCheckin.reservation_id);

    if (updateError) {
      console.error('Erro ao atualizar status da reserva:', updateError);
      // Não retornar erro aqui, pois o check-out já foi realizado
    }

    // Criar notificações automáticas para o check-out
    try {
      await createCheckoutNotifications(checkin, userId);
    } catch (notificationError) {
      console.error('Erro ao criar notificações de check-out:', notificationError);
      // Não falhar o check-out por erro de notificação
    }

    res.json({
      success: true,
      data: checkin,
      message: 'Check-out realizado com sucesso'
    } as ApiResponse<HotelCheckin>);
  } catch (error) {
    console.error('Erro ao realizar check-out:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Buscar check-ins pendentes (reservas confirmadas sem check-in)
export const getPendingCheckins = async (req: AuthRequest, res: Response) => {
  try {
    const { professional_id, date } = req.query;
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
        id,
        guest_name,
        guest_phone,
        num_guests,
        check_in_date,
        check_in_time,
        meal_plan,
        special_requests,
        hotel_rooms!inner(
          room_number,
          room_type,
          professional_id
        )
      `)
      .eq('status', 'confirmed')
      .not('id', 'in', `(SELECT reservation_id FROM hotel_checkins WHERE reservation_id IS NOT NULL)`)
      .order('check_in_date', { ascending: true });

    if (professional_id) {
      query = query.eq('hotel_rooms.professional_id', professional_id);
    }

    if (date) {
      query = query.eq('check_in_date', date);
    } else {
      // Por padrão, mostrar apenas check-ins de hoje e futuros
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('check_in_date', today);
    }

    const { data: pendingCheckins, error } = await query;

    if (error) {
      console.error('Erro ao buscar check-ins pendentes:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: pendingCheckins
    } as ApiResponse);
  } catch (error) {
    console.error('Erro ao buscar check-ins pendentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Buscar check-outs pendentes (hóspedes que fizeram check-in mas ainda não check-out)
export const getPendingCheckouts = async (req: AuthRequest, res: Response) => {
  try {
    const { professional_id, date } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    let query = supabaseAdmin
      .from('hotel_checkins')
      .select(`
        id,
        checkin_datetime,
        actual_guests,
        checkin_notes,
        hotel_reservations!inner(
          id,
          guest_name,
          guest_phone,
          check_out_date,
          check_out_time,
          total_amount,
          hotel_rooms!inner(
            room_number,
            room_type,
            professional_id
          )
        )
      `)
      .is('checkout_datetime', null)
      .order('hotel_reservations.check_out_date', { ascending: true });

    if (professional_id) {
      query = query.eq('hotel_reservations.hotel_rooms.professional_id', professional_id);
    }

    if (date) {
      query = query.eq('hotel_reservations.check_out_date', date);
    } else {
      // Por padrão, mostrar apenas check-outs de hoje e passados
      const today = new Date().toISOString().split('T')[0];
      query = query.lte('hotel_reservations.check_out_date', today);
    }

    const { data: pendingCheckouts, error } = await query;

    if (error) {
      console.error('Erro ao buscar check-outs pendentes:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: pendingCheckouts
    } as ApiResponse);
  } catch (error) {
    console.error('Erro ao buscar check-outs pendentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};