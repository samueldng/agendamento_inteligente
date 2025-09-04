import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, Professional, CreateProfessionalRequest, UpdateProfessionalRequest } from '../types';

export const createProfessional = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, category_id, dynamic_fields, working_hours }: CreateProfessionalRequest = req.body;

    // Validar dados obrigatórios
    if (!name || !email || !phone || !category_id) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email, telefone e categoria são obrigatórios'
      } as ApiResponse);
    }

    // Verificar se a categoria existe
    const { data: category, error: categoryError } = await supabaseAdmin
      .from('business_categories')
      .select('id, fields_config')
      .eq('id', category_id)
      .eq('is_active', true)
      .single();

    if (categoryError || !category) {
      return res.status(400).json({
        success: false,
        error: 'Categoria não encontrada ou inativa'
      } as ApiResponse);
    }

    // Verificar se já existe um profissional com este email
    const { data: existingProfessional } = await supabaseAdmin
      .from('professionals')
      .select('id')
      .eq('email', email)
      .single();

    if (existingProfessional) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um profissional com este email'
      } as ApiResponse);
    }

    // Validar campos dinâmicos obrigatórios
    const fieldsConfig = category.fields_config || [];
    const requiredFields = fieldsConfig.filter(field => field.required);
    
    for (const field of requiredFields) {
      if (!dynamic_fields || !dynamic_fields[field.name]) {
        return res.status(400).json({
          success: false,
          error: `Campo obrigatório não preenchido: ${field.label}`
        } as ApiResponse);
      }
    }

    // Criar profissional
    const { data: professional, error } = await supabaseAdmin
      .from('professionals')
      .insert({
        name,
        email,
        phone,
        category_id,
        dynamic_fields: dynamic_fields || {},
        working_hours,
        is_active: true
      })
      .select(`
        *,
        category:business_categories(*)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar profissional:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      data: professional,
      message: 'Profissional criado com sucesso'
    } as ApiResponse<Professional>);
  } catch (error) {
    console.error('Erro ao criar profissional:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

export const getProfessionals = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = (page - 1) * limit;
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const category_id = req.query.category_id as string;

    let query = supabaseAdmin
      .from('professionals')
      .select(`
        *,
        category:business_categories(*)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data: professionals, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar profissionais:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: professionals,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

export const getProfessionalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: professional, error } = await supabaseAdmin
      .from('professionals')
      .select(`
        *,
        category:business_categories(*),
        services:services(*)
      `)
      .eq('id', id)
      .single();

    if (error || !professional) {
      return res.status(404).json({
        success: false,
        error: 'Profissional não encontrado'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: professional
    } as ApiResponse<Professional>);
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

export const updateProfessional = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, category_id, dynamic_fields, working_hours, is_active }: UpdateProfessionalRequest = req.body;

    // Buscar profissional atual
    const { data: currentProfessional, error: currentError } = await supabaseAdmin
      .from('professionals')
      .select('category_id')
      .eq('id', id)
      .single();

    if (currentError || !currentProfessional) {
      return res.status(404).json({
        success: false,
        error: 'Profissional não encontrado'
      } as ApiResponse);
    }

    const updateData: Partial<Professional> = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (working_hours !== undefined) updateData.working_hours = working_hours;
    if (dynamic_fields !== undefined) updateData.dynamic_fields = dynamic_fields;

    // Validar categoria se estiver sendo alterada
    if (category_id !== undefined && category_id !== currentProfessional.category_id) {
      const { data: category, error: categoryError } = await supabaseAdmin
        .from('business_categories')
        .select('id, fields_config')
        .eq('id', category_id)
        .eq('is_active', true)
        .single();

      if (categoryError || !category) {
        return res.status(400).json({
          success: false,
          error: 'Categoria não encontrada ou inativa'
        } as ApiResponse);
      }

      updateData.category_id = category_id;

      // Validar campos dinâmicos obrigatórios da nova categoria
      if (dynamic_fields) {
        const fieldsConfig = category.fields_config || [];
        const requiredFields = fieldsConfig.filter(field => field.required);
        
        for (const field of requiredFields) {
          if (!dynamic_fields[field.name]) {
            return res.status(400).json({
              success: false,
              error: `Campo obrigatório não preenchido: ${field.label}`
            } as ApiResponse);
          }
        }
      }
    }

    // Apenas admins podem alterar o status ativo
    if (req.user?.role === 'admin' && is_active !== undefined) {
      updateData.is_active = is_active;
    }

    const { data: professional, error } = await supabaseAdmin
      .from('professionals')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:business_categories(*)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar profissional:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: professional,
      message: 'Profissional atualizado com sucesso'
    } as ApiResponse<Professional>);
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

export const deleteProfessional = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se há agendamentos futuros para este profissional
    const { data: futureAppointments } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('professional_id', id)
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .in('status', ['scheduled', 'confirmed']);

    if (futureAppointments && futureAppointments.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar profissional com agendamentos futuros' 
      });
    }

    const { error } = await supabaseAdmin
      .from('professionals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar profissional:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.json({ success: true, message: 'Profissional deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar profissional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getProfessionalAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }

    // Buscar profissional e seus horários de trabalho
    const { data: professional, error: profError } = await supabaseAdmin
      .from('professionals')
      .select('working_hours')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (profError || !professional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    // Buscar agendamentos do dia
    const { data: appointments, error: appError } = await supabaseAdmin
      .from('appointments')
      .select('start_time, end_time')
      .eq('professional_id', id)
      .eq('appointment_date', date)
      .in('status', ['scheduled', 'confirmed']);

    if (appError) {
      console.error('Erro ao buscar agendamentos:', appError);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Calcular horários disponíveis
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingHours = professional.working_hours?.[dayOfWeek];

    if (!workingHours || !workingHours.active) {
      return res.json({
        success: true,
        data: {
          available: false,
          slots: []
        }
      });
    }

    // Gerar slots de 30 minutos
    const slots = [];
    const startTime = workingHours.start;
    const endTime = workingHours.end;
    
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    while (start < end) {
      const timeSlot = start.toTimeString().slice(0, 5);
      const endSlot = new Date(start.getTime() + 30 * 60000).toTimeString().slice(0, 5);
      
      // Verificar se o slot está ocupado
      const isOccupied = appointments?.some(apt => {
        const aptStart = apt.start_time;
        const aptEnd = apt.end_time;
        return timeSlot >= aptStart && timeSlot < aptEnd;
      });
      
      if (!isOccupied) {
        slots.push({
          start: timeSlot,
          end: endSlot,
          available: true
        });
      }
      
      start.setMinutes(start.getMinutes() + 30);
    }

    res.json({
      success: true,
      data: {
        available: slots.length > 0,
        slots
      }
    });
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};