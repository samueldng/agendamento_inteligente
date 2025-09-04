import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

export interface HotelRoom {
  id: string;
  professional_id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  base_price: number;
  description?: string;
  amenities: string[];
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Listar todos os quartos de um hotel
export const getRooms = async (req: AuthRequest, res: Response) => {
  try {
    const { professional_id } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    let query = supabaseAdmin
      .from('hotel_rooms')
      .select('*')
      .eq('is_active', true)
      .order('room_number');

    if (professional_id) {
      query = query.eq('professional_id', professional_id);
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error('Erro ao buscar quartos:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: rooms
    } as ApiResponse<HotelRoom[]>);
  } catch (error) {
    console.error('Erro ao buscar quartos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Buscar quarto por ID
export const getRoomById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    const { data: room, error } = await supabaseAdmin
      .from('hotel_rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar quarto:', error);
      return res.status(404).json({
        success: false,
        error: 'Quarto não encontrado'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: room
    } as ApiResponse<HotelRoom>);
  } catch (error) {
    console.error('Erro ao buscar quarto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Criar novo quarto
export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const {
      professional_id,
      room_number,
      room_type,
      capacity,
      base_price,
      description,
      amenities,
      images
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    // Validar dados obrigatórios
    if (!professional_id || !room_number || !room_type || !capacity || !base_price) {
      return res.status(400).json({
        success: false,
        error: 'Professional ID, número do quarto, tipo, capacidade e preço base são obrigatórios'
      } as ApiResponse);
    }

    // Verificar se o número do quarto já existe para este hotel
    const { data: existingRoom } = await supabaseAdmin
      .from('hotel_rooms')
      .select('id')
      .eq('professional_id', professional_id)
      .eq('room_number', room_number)
      .single();

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um quarto com este número neste hotel'
      } as ApiResponse);
    }

    const { data: room, error } = await supabaseAdmin
      .from('hotel_rooms')
      .insert({
        professional_id,
        room_number,
        room_type,
        capacity: parseInt(capacity),
        base_price: parseFloat(base_price),
        description,
        amenities: amenities || [],
        images: images || [],
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar quarto:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar quarto'
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      data: room,
      message: 'Quarto criado com sucesso'
    } as ApiResponse<HotelRoom>);
  } catch (error) {
    console.error('Erro ao criar quarto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Atualizar quarto
export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      room_number,
      room_type,
      capacity,
      base_price,
      description,
      amenities,
      images,
      is_active
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    const updateData: Partial<HotelRoom> = {};
    
    if (room_number !== undefined) updateData.room_number = room_number;
    if (room_type !== undefined) updateData.room_type = room_type;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (base_price !== undefined) updateData.base_price = parseFloat(base_price);
    if (description !== undefined) updateData.description = description;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (images !== undefined) updateData.images = images;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: room, error } = await supabaseAdmin
      .from('hotel_rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar quarto:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar quarto'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: room,
      message: 'Quarto atualizado com sucesso'
    } as ApiResponse<HotelRoom>);
  } catch (error) {
    console.error('Erro ao atualizar quarto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Deletar quarto
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    // Verificar se existem reservas ativas para este quarto
    const { data: activeReservations, error: reservationError } = await supabaseAdmin
      .from('hotel_reservations')
      .select('id')
      .eq('room_id', id)
      .in('status', ['confirmed', 'checked_in'])
      .limit(1);

    if (reservationError) {
      console.error('Erro ao verificar reservas:', reservationError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar reservas'
      } as ApiResponse);
    }

    if (activeReservations && activeReservations.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar quarto com reservas ativas'
      } as ApiResponse);
    }

    const { error } = await supabaseAdmin
      .from('hotel_rooms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar quarto:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao deletar quarto'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Quarto deletado com sucesso'
    } as ApiResponse);
  } catch (error) {
    console.error('Erro ao deletar quarto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Verificar disponibilidade de quartos
export const checkRoomAvailability = async (req: Request, res: Response) => {
  try {
    const { professional_id, check_in_date, check_out_date, room_type } = req.query;

    if (!professional_id || !check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        error: 'Professional ID, data de check-in e check-out são obrigatórios'
      } as ApiResponse);
    }

    // Buscar quartos do hotel
    let roomQuery = supabaseAdmin
      .from('hotel_rooms')
      .select('*')
      .eq('professional_id', professional_id)
      .eq('is_active', true);

    if (room_type) {
      roomQuery = roomQuery.eq('room_type', room_type);
    }

    const { data: rooms, error: roomError } = await roomQuery;

    if (roomError) {
      console.error('Erro ao buscar quartos:', roomError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar quartos'
      } as ApiResponse);
    }

    // Buscar reservas que conflitam com o período
    const { data: conflictingReservations, error: reservationError } = await supabaseAdmin
      .from('hotel_reservations')
      .select('room_id')
      .eq('status', 'confirmed')
      .or(`and(check_in_date.lte.${check_out_date},check_out_date.gte.${check_in_date})`);

    if (reservationError) {
      console.error('Erro ao buscar reservas:', reservationError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar disponibilidade'
      } as ApiResponse);
    }

    // Filtrar quartos disponíveis
    const occupiedRoomIds = conflictingReservations?.map(r => r.room_id) || [];
    const availableRooms = rooms?.filter(room => !occupiedRoomIds.includes(room.id)) || [];

    res.json({
      success: true,
      data: availableRooms
    } as ApiResponse<HotelRoom[]>);
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};