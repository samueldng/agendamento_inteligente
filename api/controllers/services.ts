import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, Service } from '../types';

export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, duration, price, professional_id } = req.body;

    // Verificar se o profissional existe
    const { data: professional, error: profError } = await supabaseAdmin
      .from('professionals')
      .select('id')
      .eq('id', professional_id)
      .single();

    if (profError || !professional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    // Criar serviço
    const { data: service, error } = await supabaseAdmin
      .from('services')
      .insert({
        name,
        description,
        duration,
        price,
        professional_id
      })
      .select(`
        *,
        professional:professionals(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar serviço:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response: ApiResponse<Service> = {
      success: true,
      data: service
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = (page - 1) * limit;
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const professional_id = req.query.professional_id as string;

    let query = supabaseAdmin
      .from('services')
      .select(`
        *,
        professional:professionals(id, name, email)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    if (professional_id) {
      query = query.eq('professional_id', professional_id);
    }

    const { data: services, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar serviços:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response = {
      success: true,
      data: services,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: service, error } = await supabaseAdmin
      .from('services')
      .select(`
        *,
        professional:professionals(id, name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error || !service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const response: ApiResponse<Service> = {
      success: true,
      data: service
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, duration, price, is_active } = req.body;

    const updateData: any = {
      name,
      description,
      duration,
      price
    };

    // Apenas admins podem alterar o status ativo
    if (req.user?.role === 'admin' && is_active !== undefined) {
      updateData.is_active = is_active;
    }

    const { data: service, error } = await supabaseAdmin
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        professional:professionals(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar serviço:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const response: ApiResponse<Service> = {
      success: true,
      data: service
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se há agendamentos futuros para este serviço
    const { data: futureAppointments } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('service_id', id)
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .in('status', ['scheduled', 'confirmed']);

    if (futureAppointments && futureAppointments.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar serviço com agendamentos futuros' 
      });
    }

    const { error } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar serviço:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.json({ success: true, message: 'Serviço deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getServicesByProfessional = async (req: Request, res: Response) => {
  try {
    const { professionalId } = req.params;
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;

    let query = supabaseAdmin
      .from('services')
      .select('*')
      .eq('professional_id', professionalId)
      .order('name', { ascending: true });

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    const { data: services, error } = await query;

    if (error) {
      console.error('Erro ao buscar serviços do profissional:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response = {
      success: true,
      data: services
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar serviços do profissional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getPopularServices = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);

    // Buscar serviços mais agendados nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: popularServices, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        service_id,
        services!inner(id, name, description, duration, price, is_active),
        count
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .eq('services.is_active', true)
      .order('count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar serviços populares:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response = {
      success: true,
      data: popularServices
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar serviços populares:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};