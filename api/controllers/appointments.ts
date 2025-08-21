import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, Appointment, TimeSlot } from '../types';
import { addMinutes, format, parseISO, startOfDay, endOfDay } from 'date-fns';

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      client_id, 
      professional_id, 
      service_id, 
      appointment_date, 
      appointment_time, 
      notes 
    } = req.body;

    // Verificar se o cliente existe
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Verificar se o profissional existe e está ativo
    const { data: professional, error: profError } = await supabaseAdmin
      .from('professionals')
      .select('id, name, is_active')
      .eq('id', professional_id)
      .single();

    if (profError || !professional || !professional.is_active) {
      return res.status(404).json({ error: 'Profissional não encontrado ou inativo' });
    }

    // Verificar se o serviço existe e está ativo
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('id, name, duration, price, is_active')
      .eq('id', service_id)
      .single();

    if (serviceError || !service || !service.is_active) {
      return res.status(404).json({ error: 'Serviço não encontrado ou inativo' });
    }

    // Verificar se o horário está disponível
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    const endTime = addMinutes(appointmentDateTime, service.duration);

    const { data: conflictingAppointments } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('professional_id', professional_id)
      .eq('appointment_date', appointment_date)
      .in('status', ['scheduled', 'confirmed'])
      .or(`and(appointment_time.lte.${appointment_time},appointment_end_time.gt.${appointment_time}),and(appointment_time.lt.${format(endTime, 'HH:mm')},appointment_end_time.gte.${format(endTime, 'HH:mm')})`);

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return res.status(400).json({ error: 'Horário não disponível' });
    }

    // Criar agendamento
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        client_id,
        professional_id,
        service_id,
        appointment_date,
        appointment_time,
        appointment_end_time: format(endTime, 'HH:mm'),
        status: 'scheduled',
        notes
      })
      .select(`
        *,
        client:clients(id, name, phone, email),
        professional:professionals(id, name, email),
        service:services(id, name, duration, price)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar agendamento:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response: ApiResponse<Appointment> = {
      success: true,
      data: appointment
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const professional_id = req.query.professional_id as string;
    const client_id = req.query.client_id as string;
    const date_from = req.query.date_from as string;
    const date_to = req.query.date_to as string;

    let query = supabaseAdmin
      .from('appointments')
      .select(`
        *,
        client:clients(id, name, phone, email),
        professional:professionals(id, name, email),
        service:services(id, name, duration, price)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (professional_id) {
      query = query.eq('professional_id', professional_id);
    }

    if (client_id) {
      query = query.eq('client_id', client_id);
    }

    if (date_from) {
      query = query.gte('appointment_date', date_from);
    }

    if (date_to) {
      query = query.lte('appointment_date', date_to);
    }

    const { data: appointments, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response = {
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        client:clients(id, name, phone, email),
        professional:professionals(id, name, email, phone),
        service:services(id, name, duration, price, description)
      `)
      .eq('id', id)
      .single();

    if (error || !appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const response: ApiResponse<Appointment> = {
      success: true,
      data: appointment
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      appointment_date, 
      appointment_time, 
      status, 
      notes,
      service_id 
    } = req.body;

    // Buscar agendamento atual
    const { data: currentAppointment, error: currentError } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        service:services(duration)
      `)
      .eq('id', id)
      .single();

    if (currentError || !currentAppointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const updateData: any = {
      notes
    };

    // Se mudando data/hora ou serviço, verificar disponibilidade
    if (appointment_date || appointment_time || service_id) {
      const newDate = appointment_date || currentAppointment.appointment_date;
      const newTime = appointment_time || currentAppointment.appointment_time;
      const newServiceId = service_id || currentAppointment.service_id;

      // Buscar duração do serviço
      const { data: service } = await supabaseAdmin
        .from('services')
        .select('duration')
        .eq('id', newServiceId)
        .single();

      if (!service) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      const appointmentDateTime = new Date(`${newDate}T${newTime}`);
      const endTime = addMinutes(appointmentDateTime, service.duration);

      // Verificar conflitos (excluindo o agendamento atual)
      const { data: conflictingAppointments } = await supabaseAdmin
        .from('appointments')
        .select('id')
        .eq('professional_id', currentAppointment.professional_id)
        .eq('appointment_date', newDate)
        .neq('id', id)
        .in('status', ['scheduled', 'confirmed'])
        .or(`and(appointment_time.lte.${newTime},appointment_end_time.gt.${newTime}),and(appointment_time.lt.${format(endTime, 'HH:mm')},appointment_end_time.gte.${format(endTime, 'HH:mm')})`);

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        return res.status(400).json({ error: 'Horário não disponível' });
      }

      updateData.appointment_date = newDate;
      updateData.appointment_time = newTime;
      updateData.appointment_end_time = format(endTime, 'HH:mm');
      updateData.service_id = newServiceId;
    }

    if (status) {
      updateData.status = status;
    }

    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        client:clients(id, name, phone, email),
        professional:professionals(id, name, email),
        service:services(id, name, duration, price)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response: ApiResponse<Appointment> = {
      success: true,
      data: appointment
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .update({
        status: 'cancelled',
        notes: reason ? `Cancelado: ${reason}` : 'Cancelado'
      })
      .eq('id', id)
      .select(`
        *,
        client:clients(id, name, phone),
        professional:professionals(id, name),
        service:services(id, name)
      `)
      .single();

    if (error) {
      console.error('Erro ao cancelar agendamento:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const response: ApiResponse<Appointment> = {
      success: true,
      data: appointment
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { professional_id, date, service_id } = req.query;

    if (!professional_id || !date || !service_id) {
      return res.status(400).json({ 
        error: 'professional_id, date e service_id são obrigatórios' 
      });
    }

    // Buscar serviço para obter duração
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('duration')
      .eq('id', service_id as string)
      .single();

    if (serviceError || !service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Buscar horários de trabalho do profissional
    const { data: professional, error: profError } = await supabaseAdmin
      .from('professionals')
      .select('working_hours')
      .eq('id', professional_id as string)
      .single();

    if (profError || !professional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay(); // 0 = domingo, 1 = segunda, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    const workingHours = professional.working_hours?.[dayName];
    if (!workingHours || !workingHours.is_working) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Buscar agendamentos existentes para o dia
    const { data: existingAppointments } = await supabaseAdmin
      .from('appointments')
      .select('appointment_time, appointment_end_time')
      .eq('professional_id', professional_id as string)
      .eq('appointment_date', date as string)
      .in('status', ['scheduled', 'confirmed']);

    // Gerar slots disponíveis
    const slots: TimeSlot[] = [];
    const startTime = parseISO(`${date}T${workingHours.start_time}`);
    const endTime = parseISO(`${date}T${workingHours.end_time}`);
    const serviceDuration = service.duration;

    let currentTime = startTime;
    while (currentTime < endTime) {
      const slotEndTime = addMinutes(currentTime, serviceDuration);
      
      if (slotEndTime <= endTime) {
        const timeString = format(currentTime, 'HH:mm');
        const endTimeString = format(slotEndTime, 'HH:mm');
        
        // Verificar se não há conflito com agendamentos existentes
        const hasConflict = existingAppointments?.some(apt => {
          return (
            (timeString >= apt.appointment_time && timeString < apt.appointment_end_time) ||
            (endTimeString > apt.appointment_time && endTimeString <= apt.appointment_end_time) ||
            (timeString <= apt.appointment_time && endTimeString >= apt.appointment_end_time)
          );
        });

        if (!hasConflict) {
          slots.push({
            start_time: timeString,
            end_time: endTimeString,
            available: true
          });
        }
      }
      
      currentTime = addMinutes(currentTime, 30); // Slots de 30 em 30 minutos
    }

    const response = {
      success: true,
      data: slots
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getTodayAppointments = async (req: Request, res: Response) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const professional_id = req.query.professional_id as string;

    let query = supabaseAdmin
      .from('appointments')
      .select(`
        *,
        client:clients(id, name, phone),
        professional:professionals(id, name),
        service:services(id, name, duration)
      `)
      .eq('appointment_date', today)
      .in('status', ['scheduled', 'confirmed'])
      .order('appointment_time', { ascending: true });

    if (professional_id) {
      query = query.eq('professional_id', professional_id);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error('Erro ao buscar agendamentos de hoje:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response = {
      success: true,
      data: appointments
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar agendamentos de hoje:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAppointmentStats = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, professional_id } = req.query;
    
    const dateFrom = date_from as string || format(startOfDay(new Date()), 'yyyy-MM-dd');
    const dateTo = date_to as string || format(endOfDay(new Date()), 'yyyy-MM-dd');

    let query = supabaseAdmin
      .from('appointments')
      .select(`
        id,
        status,
        appointment_date,
        service:services(price)
      `)
      .gte('appointment_date', dateFrom)
      .lte('appointment_date', dateTo);

    if (professional_id) {
      query = query.eq('professional_id', professional_id as string);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error('Erro ao buscar estatísticas de agendamentos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const stats = {
      total: appointments?.length || 0,
      scheduled: appointments?.filter(a => a.status === 'scheduled').length || 0,
      confirmed: appointments?.filter(a => a.status === 'confirmed').length || 0,
      completed: appointments?.filter(a => a.status === 'completed').length || 0,
      cancelled: appointments?.filter(a => a.status === 'cancelled').length || 0,
      no_show: appointments?.filter(a => a.status === 'no_show').length || 0,
      total_revenue: appointments
        ?.filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + ((a.service as any)?.price || 0), 0) || 0
    };

    const response = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};