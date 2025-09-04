import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

export interface HotelConsumptionItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HotelConsumption {
  id: string;
  reservation_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  consumed_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Listar itens de consumo disponíveis
export const getConsumptionItems = async (req: AuthRequest, res: Response) => {
  try {
    const { category, is_active } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    let query = supabaseAdmin
      .from('hotel_consumption_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Erro ao buscar itens de consumo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: items
    } as ApiResponse<HotelConsumptionItem[]>);
  } catch (error) {
    console.error('Erro ao buscar itens de consumo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Listar consumo por reserva
export const getConsumptionByReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { reservation_id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    const { data: consumption, error } = await supabaseAdmin
      .from('hotel_consumption')
      .select(`
        *,
        hotel_consumption_items(
          id,
          name,
          category,
          description
        )
      `)
      .eq('reservation_id', reservation_id)
      .order('consumed_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar consumo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: consumption
    } as ApiResponse<HotelConsumption[]>);
  } catch (error) {
    console.error('Erro ao buscar consumo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Registrar novo consumo
export const createConsumption = async (req: AuthRequest, res: Response) => {
  try {
    const {
      reservation_id,
      item_id,
      quantity,
      consumed_at,
      notes
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    // Validar dados obrigatórios
    if (!reservation_id || !item_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'ID da reserva, ID do item e quantidade são obrigatórios'
      } as ApiResponse);
    }

    // Verificar se a reserva existe e está ativa
    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from('hotel_reservations')
      .select('id, status')
      .eq('id', reservation_id)
      .in('status', ['confirmed', 'checked_in'])
      .single();

    if (reservationError || !reservation) {
      return res.status(400).json({
        success: false,
        error: 'Reserva não encontrada ou não está ativa'
      } as ApiResponse);
    }

    // Verificar se o item existe e está ativo
    const { data: item, error: itemError } = await supabaseAdmin
      .from('hotel_consumption_items')
      .select('id, price')
      .eq('id', item_id)
      .eq('is_active', true)
      .single();

    if (itemError || !item) {
      return res.status(400).json({
        success: false,
        error: 'Item não encontrado ou inativo'
      } as ApiResponse);
    }

    // Calcular preços
    const unit_price = item.price;
    const total_price = unit_price * quantity;

    const { data: consumption, error } = await supabaseAdmin
      .from('hotel_consumption')
      .insert({
        reservation_id,
        item_id,
        quantity: parseInt(quantity),
        unit_price,
        total_price,
        consumed_at: consumed_at || new Date().toISOString(),
        notes
      })
      .select(`
        *,
        hotel_consumption_items(
          id,
          name,
          category,
          description
        )
      `)
      .single();

    if (error) {
      console.error('Erro ao registrar consumo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao registrar consumo'
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      data: consumption,
      message: 'Consumo registrado com sucesso'
    } as ApiResponse<HotelConsumption>);
  } catch (error) {
    console.error('Erro ao registrar consumo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Atualizar consumo
export const updateConsumption = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, consumed_at, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    // Buscar o consumo atual para recalcular o preço se necessário
    const { data: currentConsumption, error: currentError } = await supabaseAdmin
      .from('hotel_consumption')
      .select(`
        *,
        hotel_consumption_items(price)
      `)
      .eq('id', id)
      .single();

    if (currentError || !currentConsumption) {
      return res.status(404).json({
        success: false,
        error: 'Consumo não encontrado'
      } as ApiResponse);
    }

    const updateData: any = {};
    
    if (quantity !== undefined) {
      updateData.quantity = parseInt(quantity);
      updateData.total_price = currentConsumption.unit_price * parseInt(quantity);
    }
    
    if (consumed_at !== undefined) updateData.consumed_at = consumed_at;
    if (notes !== undefined) updateData.notes = notes;

    const { data: consumption, error } = await supabaseAdmin
      .from('hotel_consumption')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        hotel_consumption_items(
          id,
          name,
          category,
          description
        )
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar consumo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar consumo'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: consumption,
      message: 'Consumo atualizado com sucesso'
    } as ApiResponse<HotelConsumption>);
  } catch (error) {
    console.error('Erro ao atualizar consumo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Remover consumo
export const deleteConsumption = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    const { error } = await supabaseAdmin
      .from('hotel_consumption')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover consumo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao remover consumo'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Consumo removido com sucesso'
    } as ApiResponse);
  } catch (error) {
    console.error('Erro ao remover consumo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Obter relatório de consumo por período
export const getConsumptionReport = async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date, category } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      } as ApiResponse);
    }

    let query = supabaseAdmin
      .from('hotel_consumption')
      .select(`
        *,
        hotel_consumption_items(
          id,
          name,
          category,
          description
        ),
        hotel_reservations(
          id,
          guest_name,
          room_id,
          hotel_rooms(
            room_number
          )
        )
      `)
      .order('consumed_at', { ascending: false });

    if (start_date) {
      query = query.gte('consumed_at', start_date);
    }

    if (end_date) {
      query = query.lte('consumed_at', end_date);
    }

    const { data: consumption, error } = await query;

    if (error) {
      console.error('Erro ao gerar relatório:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    // Filtrar por categoria se especificado
    let filteredConsumption = consumption;
    if (category) {
      filteredConsumption = consumption?.filter(
        (item: any) => item.hotel_consumption_items?.category === category
      ) || [];
    }

    // Calcular totais
    const totalRevenue = filteredConsumption?.reduce(
      (sum: number, item: any) => sum + (item.total_price || 0),
      0
    ) || 0;

    const itemsSummary = filteredConsumption?.reduce((acc: any, item: any) => {
      const itemName = item.hotel_consumption_items?.name || 'Item desconhecido';
      if (!acc[itemName]) {
        acc[itemName] = {
          quantity: 0,
          revenue: 0,
          category: item.hotel_consumption_items?.category || 'Sem categoria'
        };
      }
      acc[itemName].quantity += item.quantity || 0;
      acc[itemName].revenue += item.total_price || 0;
      return acc;
    }, {}) || {};

    res.json({
      success: true,
      data: {
        consumption: filteredConsumption,
        summary: {
          totalRevenue,
          totalItems: filteredConsumption?.length || 0,
          itemsSummary
        }
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};