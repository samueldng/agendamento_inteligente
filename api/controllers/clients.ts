import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, Client } from '../types';

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, email, notes } = req.body;

    // Verificar se já existe cliente com este telefone
    const { data: existingClient } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingClient) {
      return res.status(400).json({ error: 'Cliente com este telefone já existe' });
    }

    // Criar cliente
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .insert({
        name,
        phone,
        email,
        notes
      })
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response: ApiResponse<Client> = {
      success: true,
      data: client
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;

    let query = supabaseAdmin
      .from('clients')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: clients, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response = {
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select(`
        *,
        appointments:appointments(
          id,
          appointment_date,
          appointment_time,
          status,
          notes,
          service:services(id, name, duration, price),
          professional:professionals(id, name)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const response: ApiResponse<Client> = {
      success: true,
      data: client
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getClientByPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;

    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select(`
        *,
        appointments:appointments(
          id,
          appointment_date,
          appointment_time,
          status,
          notes,
          service:services(id, name, duration, price),
          professional:professionals(id, name)
        )
      `)
      .eq('phone', phone)
      .eq('is_active', true)
      .single();

    if (error || !client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const response: ApiResponse<Client> = {
      success: true,
      data: client
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar cliente por telefone:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes, is_active } = req.body;

    const updateData: any = {
      name,
      phone,
      email,
      notes
    };

    // Apenas admins podem alterar o status ativo
    if (req.user?.role === 'admin' && is_active !== undefined) {
      updateData.is_active = is_active;
    }

    // Verificar se o telefone já está em uso por outro cliente
    if (phone) {
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('phone', phone)
        .neq('id', id)
        .single();

      if (existingClient) {
        return res.status(400).json({ error: 'Telefone já está em uso por outro cliente' });
      }
    }

    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const response: ApiResponse<Client> = {
      success: true,
      data: client
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se há agendamentos futuros para este cliente
    const { data: futureAppointments } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('client_id', id)
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .in('status', ['scheduled', 'confirmed']);

    if (futureAppointments && futureAppointments.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar cliente com agendamentos futuros' 
      });
    }

    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.json({ success: true, message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getClientStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar estatísticas do cliente
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        status,
        appointment_date,
        service:services(price)
      `)
      .eq('client_id', id);

    if (error) {
      console.error('Erro ao buscar estatísticas do cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const stats = {
      total_appointments: appointments?.length || 0,
      completed_appointments: appointments?.filter(a => a.status === 'completed').length || 0,
      cancelled_appointments: appointments?.filter(a => a.status === 'cancelled').length || 0,
      no_show_appointments: appointments?.filter(a => a.status === 'no_show').length || 0,
      total_spent: appointments
        ?.filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + ((a.service as any)?.price || 0), 0) || 0,
      last_appointment: appointments
        ?.filter(a => a.status === 'completed')
        .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0]?.appointment_date || null
    };

    const response = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getRecentClients = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar clientes recentes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response = {
      success: true,
      data: clients
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar clientes recentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};