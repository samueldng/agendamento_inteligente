import { sendWhatsAppMessage } from '../config/twilio';
import { supabase } from '../config/supabase';
import cron from 'node-cron';

export class NotificationService {
  private isRunning = false;

  // Iniciar serviço de notificações
  start() {
    if (this.isRunning) {
      console.log('Serviço de notificações já está rodando');
      return;
    }

    this.isRunning = true;
    console.log('Iniciando serviço de notificações...');

    // Verificar lembretes a cada 30 minutos
    cron.schedule('*/30 * * * *', () => {
      this.checkReminders();
    });

    // Verificar agendamentos do dia seguinte às 18h
    cron.schedule('0 18 * * *', () => {
      this.sendTomorrowReminders();
    });

    // Verificar agendamentos de hoje às 8h
    cron.schedule('0 8 * * *', () => {
      this.sendTodayReminders();
    });

    console.log('Serviço de notificações iniciado com sucesso');
  }

  // Parar serviço de notificações
  stop() {
    this.isRunning = false;
    console.log('Serviço de notificações parado');
  }

  // Verificar e enviar lembretes
  private async checkReminders() {
    try {
      console.log('Verificando lembretes...');
      
      // Buscar agendamentos que precisam de lembrete
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          reminder_sent,
          clients(name, phone),
          services(name, duration),
          professionals(name)
        `)
        .eq('status', 'scheduled')
        .eq('reminder_sent', false)
        .gte('appointment_date', now.toISOString().split('T')[0])
        .lte('appointment_date', oneHourFromNow.toISOString().split('T')[0]);

      if (error) {
        console.error('Erro ao buscar agendamentos para lembrete:', error);
        return;
      }

      for (const appointment of appointments || []) {
        await this.sendAppointmentReminder(appointment);
      }
      
    } catch (error) {
      console.error('Erro ao verificar lembretes:', error);
    }
  }

  // Enviar lembretes dos agendamentos de amanhã
  private async sendTomorrowReminders() {
    try {
      console.log('Enviando lembretes dos agendamentos de amanhã...');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          clients(name, phone),
          services(name, duration),
          professionals(name)
        `)
        .eq('status', 'scheduled')
        .eq('appointment_date', tomorrowStr);

      if (error) {
        console.error('Erro ao buscar agendamentos de amanhã:', error);
        return;
      }

      for (const appointment of appointments || []) {
        await this.sendTomorrowReminder(appointment);
      }
      
    } catch (error) {
      console.error('Erro ao enviar lembretes de amanhã:', error);
    }
  }

  // Enviar lembretes dos agendamentos de hoje
  private async sendTodayReminders() {
    try {
      console.log('Enviando lembretes dos agendamentos de hoje...');
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          clients(name, phone),
          services(name, duration),
          professionals(name)
        `)
        .eq('status', 'scheduled')
        .eq('appointment_date', today);

      if (error) {
        console.error('Erro ao buscar agendamentos de hoje:', error);
        return;
      }

      for (const appointment of appointments || []) {
        await this.sendTodayReminder(appointment);
      }
      
    } catch (error) {
      console.error('Erro ao enviar lembretes de hoje:', error);
    }
  }

  // Enviar lembrete de agendamento (1 hora antes)
  private async sendAppointmentReminder(appointment: any) {
    try {
      const client = Array.isArray(appointment.clients) ? appointment.clients[0] : appointment.clients;
      const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services;
      const professional = Array.isArray(appointment.professionals) ? appointment.professionals[0] : appointment.professionals;
      
      if (!client?.phone) {
        console.log(`Cliente sem telefone para agendamento ${appointment.id}`);
        return;
      }

      const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      const now = new Date();
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const hoursUntil = Math.round(timeDiff / (1000 * 60 * 60));

      // Enviar lembrete apenas se estiver entre 30 minutos e 2 horas antes
      if (hoursUntil <= 2 && hoursUntil >= 0.5) {
        const message = `🕐 *Lembrete de Agendamento*\n\n` +
          `Olá ${client.name}! 👋\n\n` +
          `Você tem um agendamento em ${hoursUntil === 1 ? '1 hora' : `${hoursUntil} horas`}:\n\n` +
          `📅 *Data:* ${this.formatDate(appointment.appointment_date)}\n` +
          `⏰ *Horário:* ${appointment.appointment_time}\n` +
          `💆‍♀️ *Serviço:* ${service.name}\n` +
          `👨‍⚕️ *Profissional:* ${professional.name}\n` +
          `⏱️ *Duração:* ${service.duration} minutos\n\n` +
          `Nos vemos em breve! 😊\n\n` +
          `_Para cancelar ou remarcar, responda esta mensagem._`;

        await sendWhatsAppMessage(client.phone, message);
        
        // Marcar lembrete como enviado
        await supabase
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appointment.id);

        console.log(`Lembrete enviado para ${client.phone} - Agendamento ${appointment.id}`);
      }
      
    } catch (error) {
      console.error(`Erro ao enviar lembrete para agendamento ${appointment.id}:`, error);
    }
  }

  // Enviar lembrete do dia seguinte
  private async sendTomorrowReminder(appointment: any) {
    try {
      const client = Array.isArray(appointment.clients) ? appointment.clients[0] : appointment.clients;
      const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services;
      const professional = Array.isArray(appointment.professionals) ? appointment.professionals[0] : appointment.professionals;
      
      if (!client?.phone) {
        console.log(`Cliente sem telefone para agendamento ${appointment.id}`);
        return;
      }

      const message = `📅 *Agendamento Amanhã*\n\n` +
        `Olá ${client.name}! 👋\n\n` +
        `Lembrando que você tem um agendamento amanhã:\n\n` +
        `📅 *Data:* ${this.formatDate(appointment.appointment_date)}\n` +
        `⏰ *Horário:* ${appointment.appointment_time}\n` +
        `💆‍♀️ *Serviço:* ${service.name}\n` +
        `👨‍⚕️ *Profissional:* ${professional.name}\n` +
        `⏱️ *Duração:* ${service.duration} minutos\n\n` +
        `Estamos ansiosos para atendê-lo(a)! 😊\n\n` +
        `_Para cancelar ou remarcar, responda esta mensagem._`;

      await sendWhatsAppMessage(client.phone, message);
      console.log(`Lembrete de amanhã enviado para ${client.phone} - Agendamento ${appointment.id}`);
      
    } catch (error) {
      console.error(`Erro ao enviar lembrete de amanhã para agendamento ${appointment.id}:`, error);
    }
  }

  // Enviar lembrete do dia
  private async sendTodayReminder(appointment: any) {
    try {
      const client = Array.isArray(appointment.clients) ? appointment.clients[0] : appointment.clients;
      const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services;
      const professional = Array.isArray(appointment.professionals) ? appointment.professionals[0] : appointment.professionals;
      
      if (!client?.phone) {
        console.log(`Cliente sem telefone para agendamento ${appointment.id}`);
        return;
      }

      const message = `🌅 *Bom dia!*\n\n` +
        `Olá ${client.name}! 👋\n\n` +
        `Você tem um agendamento hoje:\n\n` +
        `⏰ *Horário:* ${appointment.appointment_time}\n` +
        `💆‍♀️ *Serviço:* ${service.name}\n` +
        `👨‍⚕️ *Profissional:* ${professional.name}\n` +
        `⏱️ *Duração:* ${service.duration} minutos\n\n` +
        `Tenha um ótimo dia e nos vemos em breve! 😊\n\n` +
        `_Para cancelar ou remarcar, responda esta mensagem._`;

      await sendWhatsAppMessage(client.phone, message);
      console.log(`Lembrete de hoje enviado para ${client.phone} - Agendamento ${appointment.id}`);
      
    } catch (error) {
      console.error(`Erro ao enviar lembrete de hoje para agendamento ${appointment.id}:`, error);
    }
  }

  // Enviar notificação de confirmação de agendamento
  async sendAppointmentConfirmation(appointmentId: string) {
    try {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          clients(name, phone),
          services(name, duration, price),
          professionals(name)
        `)
        .eq('id', appointmentId)
        .single();

      if (error || !appointment) {
        console.error('Erro ao buscar agendamento para confirmação:', error);
        return;
      }

      const client = Array.isArray(appointment.clients) ? appointment.clients[0] : appointment.clients;
      const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services;
      const professional = Array.isArray(appointment.professionals) ? appointment.professionals[0] : appointment.professionals;
      
      if (!client?.phone) {
        console.log(`Cliente sem telefone para agendamento ${appointment.id}`);
        return;
      }

      const message = `✅ *Agendamento Confirmado!*\n\n` +
        `Olá ${client.name}! 👋\n\n` +
        `Seu agendamento foi confirmado com sucesso:\n\n` +
        `📅 *Data:* ${this.formatDate(appointment.appointment_date)}\n` +
        `⏰ *Horário:* ${appointment.appointment_time}\n` +
        `💆‍♀️ *Serviço:* ${service.name}\n` +
        `👨‍⚕️ *Profissional:* ${professional.name}\n` +
        `⏱️ *Duração:* ${service.duration} minutos\n` +
        `💰 *Valor:* R$ ${service.price}\n\n` +
        `Obrigado por escolher nossos serviços! 😊\n\n` +
        `_Para cancelar ou remarcar, responda esta mensagem._`;

      await sendWhatsAppMessage(client.phone, message);
      console.log(`Confirmação enviada para ${client.phone} - Agendamento ${appointment.id}`);
      
    } catch (error) {
      console.error(`Erro ao enviar confirmação para agendamento ${appointmentId}:`, error);
    }
  }

  // Enviar notificação de cancelamento
  async sendCancellationNotification(appointmentId: string, reason?: string) {
    try {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          clients(name, phone),
          services(name),
          professionals(name)
        `)
        .eq('id', appointmentId)
        .single();

      if (error || !appointment) {
        console.error('Erro ao buscar agendamento para cancelamento:', error);
        return;
      }

      const client = Array.isArray(appointment.clients) ? appointment.clients[0] : appointment.clients;
      const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services;
      const professional = Array.isArray(appointment.professionals) ? appointment.professionals[0] : appointment.professionals;
      
      if (!client?.phone) {
        console.log(`Cliente sem telefone para agendamento ${appointment.id}`);
        return;
      }

      const message = `❌ *Agendamento Cancelado*\n\n` +
        `Olá ${client.name}! 👋\n\n` +
        `Seu agendamento foi cancelado:\n\n` +
        `📅 *Data:* ${this.formatDate(appointment.appointment_date)}\n` +
        `⏰ *Horário:* ${appointment.appointment_time}\n` +
        `💆‍♀️ *Serviço:* ${service.name}\n` +
        `👨‍⚕️ *Profissional:* ${professional.name}\n\n` +
        (reason ? `*Motivo:* ${reason}\n\n` : '') +
        `Para reagendar, responda esta mensagem! 😊`;

      await sendWhatsAppMessage(client.phone, message);
      console.log(`Cancelamento enviado para ${client.phone} - Agendamento ${appointment.id}`);
      
    } catch (error) {
      console.error(`Erro ao enviar cancelamento para agendamento ${appointmentId}:`, error);
    }
  }

  // Formatar data para exibição
  private formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Verificar status do serviço
  getStatus() {
    return {
      isRunning: this.isRunning,
      startedAt: this.isRunning ? new Date().toISOString() : null
    };
  }
}

export const notificationService = new NotificationService();