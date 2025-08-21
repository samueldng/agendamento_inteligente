import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../config/supabase';
import { ConversationContext, WhatsAppMessage } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async processMessage(
    message: string,
    phoneNumber: string,
    context?: ConversationContext
  ): Promise<{ response: string; context: ConversationContext; action?: string }> {
    try {
      // Buscar ou criar cliente
      const client = await this.getOrCreateClient(phoneNumber);
      
      // Buscar contexto da conversa
      const conversationContext = context || await this.getConversationContext(phoneNumber);
      
      // Buscar dados necessários para o contexto
      const [professionals, services] = await Promise.all([
        this.getProfessionals(),
        this.getServices()
      ]);

      // Preparar prompt para o Gemini
      const prompt = this.buildPrompt(message, conversationContext, professionals, services, client);
      
      // Gerar resposta
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Processar resposta e extrair ações
      const { cleanResponse, action, updatedContext } = this.parseResponse(
        response,
        conversationContext,
        client.id
      );
      
      // Salvar contexto atualizado
      await this.saveConversationContext(phoneNumber, updatedContext);
      
      // Executar ação se necessário
      if (action) {
        await this.executeAction(action, updatedContext, client.id);
      }
      
      return {
        response: cleanResponse,
        context: updatedContext,
        action
      };
    } catch (error) {
      console.error('Erro no processamento da mensagem:', error);
      return {
        response: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        context: context || { step: 'greeting' }
      };
    }
  }

  private async getOrCreateClient(phoneNumber: string) {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phoneNumber)
      .single();

    if (existingClient) {
      return existingClient;
    }

    // Criar novo cliente
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        name: 'Cliente WhatsApp',
        phone: phoneNumber,
        source: 'whatsapp'
      })
      .select()
      .single();

    if (error) throw error;
    return newClient;
  }

  private async getConversationContext(phoneNumber: string): Promise<ConversationContext> {
    const { data } = await supabase
      .from('conversations')
      .select('context')
      .eq('phone_number', phoneNumber)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data?.context || { step: 'greeting', data: {} };
  }

  private async saveConversationContext(phoneNumber: string, context: ConversationContext) {
    await supabase
      .from('conversations')
      .upsert({
        phone_number: phoneNumber,
        context,
        status: 'active',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'phone_number'
      });
  }

  private async getProfessionals() {
    const { data } = await supabase
      .from('professionals')
      .select(`
        id,
        name,
        specialties,
        working_hours,
        is_active
      `)
      .eq('is_active', true);

    return data || [];
  }

  private async getServices() {
    const { data } = await supabase
      .from('services')
      .select(`
        id,
        name,
        description,
        duration,
        price,
        category,
        is_active
      `)
      .eq('is_active', true);

    return data || [];
  }

  private buildPrompt(
    message: string,
    context: ConversationContext,
    professionals: any[],
    services: any[],
    client: any
  ): string {
    const systemPrompt = `
Você é um assistente de agendamento inteligente para uma clínica/salão. Seu objetivo é ajudar clientes a agendar serviços de forma natural e eficiente.

CONTEXTO ATUAL:
- Etapa da conversa: ${context.step}
- Dados coletados: ${JSON.stringify({
  service: context.selected_service,
  professional: context.selected_professional,
  date: context.selected_date,
  time: context.selected_time,
  name: context.client_name,
  email: context.client_email
})}
- Cliente: ${client.name} (${client.phone})

PROFISSIONAIS DISPONÍVEIS:
${professionals.map(p => `- ${p.name}: ${p.specialties?.join(', ') || 'Geral'}`).join('\n')}

SERVIÇOS DISPONÍVEIS:
${services.map(s => `- ${s.name}: ${s.description} (${s.duration}min - R$ ${s.price})`).join('\n')}

ETAPAS DO AGENDAMENTO:
1. greeting - Saudação inicial
2. service_selection - Escolha do serviço
3. professional_selection - Escolha do profissional (se necessário)
4. date_selection - Escolha da data
5. time_selection - Escolha do horário
6. confirmation - Confirmação dos dados
7. completed - Agendamento finalizado

INSTRUÇÕES:
- Seja natural, amigável e profissional
- Colete informações uma de cada vez
- Confirme dados importantes
- Use emojis moderadamente
- Responda em português brasileiro
- Se o cliente quiser cancelar ou remarcar, ajude-o

FORMATO DA RESPOSTA:
[RESPONSE]Sua resposta natural ao cliente[/RESPONSE]
[CONTEXT]{"step": "próxima_etapa", "selected_service": "id_servico", "selected_professional": "id_profissional", "selected_date": "data", "selected_time": "horario", "client_name": "nome", "client_email": "email"}[/CONTEXT]
[ACTION]ação_a_executar[/ACTION] (opcional)

AÇÕES DISPONÍVEIS:
- CREATE_APPOINTMENT: Criar agendamento
- CHECK_AVAILABILITY: Verificar disponibilidade
- UPDATE_CLIENT: Atualizar dados do cliente

MENSAGEM DO CLIENTE: ${message}
`;

    return systemPrompt;
  }

  private parseResponse(
    response: string,
    currentContext: ConversationContext,
    clientId: string
  ): { cleanResponse: string; action?: string; updatedContext: ConversationContext } {
    // Extrair resposta
    const responseMatch = response.match(/\[RESPONSE\](.*?)\[\/RESPONSE\]/s);
    const cleanResponse = responseMatch ? responseMatch[1].trim() : response;

    // Extrair contexto
    const contextMatch = response.match(/\[CONTEXT\](.*?)\[\/CONTEXT\]/s);
    let updatedContext = currentContext;
    if (contextMatch) {
      try {
        updatedContext = JSON.parse(contextMatch[1].trim());
      } catch (error) {
        console.error('Erro ao parsear contexto:', error);
      }
    }

    // Extrair ação
    const actionMatch = response.match(/\[ACTION\](.*?)\[\/ACTION\]/s);
    const action = actionMatch ? actionMatch[1].trim() : undefined;

    return { cleanResponse, action, updatedContext };
  }

  private async executeAction(action: string, context: ConversationContext, clientId: string) {
    switch (action) {
      case 'CREATE_APPOINTMENT':
        await this.createAppointment(context, clientId);
        break;
      case 'CHECK_AVAILABILITY':
        await this.checkAvailability(context);
        break;
      case 'UPDATE_CLIENT':
        await this.updateClient(context, clientId);
        break;
    }
  }

  private async createAppointment(context: ConversationContext, clientId: string) {
    const service_id = context.selected_service;
    const professional_id = context.selected_professional;
    const date = context.selected_date;
    const time = context.selected_time;
    
    if (!service_id || !professional_id || !date || !time) {
      throw new Error('Dados insuficientes para criar agendamento');
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        professional_id,
        service_id,
        appointment_date: date,
        appointment_time: time,
        status: 'scheduled',
        created_via: 'whatsapp'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar agendamento: ${error.message}`);
    }

    return data;
  }

  private async checkAvailability(context: ConversationContext) {
    const professional_id = context.selected_professional;
    const date = context.selected_date;
    const service_id = context.selected_service;
    
    if (!professional_id || !date || !service_id) {
      return [];
    }

    // Buscar horários disponíveis
    const { data: service } = await supabase
      .from('services')
      .select('duration')
      .eq('id', service_id)
      .single();

    const { data: professional } = await supabase
      .from('professionals')
      .select('working_hours')
      .eq('id', professional_id)
      .single();

    const { data: appointments } = await supabase
      .from('appointments')
      .select('appointment_time, services(duration)')
      .eq('professional_id', professional_id)
      .eq('appointment_date', date)
      .in('status', ['scheduled', 'confirmed']);

    // Calcular horários disponíveis
    const availableSlots = this.calculateAvailableSlots(
      professional?.working_hours,
      appointments || [],
      service?.duration || 60
    );

    return availableSlots;
  }

  private calculateAvailableSlots(
    workingHours: any,
    appointments: any[],
    serviceDuration: number
  ): string[] {
    // Implementação simplificada - pode ser expandida
    const slots = [];
    const startHour = 9; // 9:00
    const endHour = 18; // 18:00
    const slotDuration = 30; // 30 minutos

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Verificar se o horário não conflita com agendamentos existentes
        const hasConflict = appointments.some(apt => {
          const aptTime = apt.appointment_time;
          const service = Array.isArray(apt.services) ? apt.services[0] : apt.services;
          const aptDuration = service?.duration || 60;
          
          // Lógica de verificação de conflito
          return this.timesOverlap(timeSlot, serviceDuration, aptTime, aptDuration);
        });

        if (!hasConflict) {
          slots.push(timeSlot);
        }
      }
    }

    return slots;
  }

  private timesOverlap(
    time1: string,
    duration1: number,
    time2: string,
    duration2: number
  ): boolean {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    
    const start1 = h1 * 60 + m1;
    const end1 = start1 + duration1;
    const start2 = h2 * 60 + m2;
    const end2 = start2 + duration2;
    
    return start1 < end2 && start2 < end1;
  }

  private async updateClient(context: ConversationContext, clientId: string) {
    const name = context.client_name;
    const email = context.client_email;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('clients')
        .update(updateData)
        .eq('id', clientId);
    }
  }

  async getAppointmentsByClient(clientId: string) {
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        services(name, duration, price),
        professionals(name)
      `)
      .eq('client_id', clientId)
      .order('appointment_date', { ascending: true });

    return data || [];
  }

  async cancelAppointment(appointmentId: string, reason?: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        notes: reason ? `Cancelado: ${reason}` : 'Cancelado via WhatsApp'
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const aiService = new AIService();