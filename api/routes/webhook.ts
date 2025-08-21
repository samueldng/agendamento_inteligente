import { Router, Request, Response } from 'express';
import { validateWhatsAppNumber, sendWhatsAppMessage } from '../config/twilio';
import { aiService } from '../services/ai';
import { supabase } from '../config/supabase';
import { WhatsAppMessage } from '../types';

const router = Router();

// Middleware para validar webhook do Twilio
const validateTwilioWebhook = (req: Request, res: Response, next: any) => {
  // Em produção, validar assinatura do Twilio
  // const signature = req.headers['x-twilio-signature'];
  // const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  // const isValid = twilio.validateRequest(authToken, signature, url, req.body);
  
  // Por enquanto, apenas verificar se tem os campos necessários
  if (!req.body.From || !req.body.Body) {
    return res.status(400).json({ error: 'Dados do webhook inválidos' });
  }
  
  next();
};

// Webhook para receber mensagens do WhatsApp
router.post('/whatsapp', validateTwilioWebhook, async (req: Request, res: Response) => {
  try {
    const {
      From: from,
      Body: body,
      MessageSid: messageSid,
      ProfileName: profileName
    } = req.body;

    // Extrair número de telefone (remover prefixo whatsapp:)
    const phoneNumber = from.replace('whatsapp:', '');
    
    console.log(`Mensagem recebida de ${phoneNumber}: ${body}`);

    // Salvar mensagem recebida
    await saveWhatsAppMessage({
      message_sid: messageSid,
      from: from,
      to: 'whatsapp:+5511999999999', // número da empresa
      body: body,
      timestamp: new Date().toISOString(),
      processed: false
    });

    // Processar mensagem com IA
    const aiResponse = await aiService.processMessage(body, phoneNumber);
    
    // Enviar resposta via WhatsApp
    const twilioResponse = await sendWhatsAppMessage(phoneNumber, aiResponse.response);
    
    // Salvar mensagem enviada
    if (twilioResponse.success && twilioResponse.messageSid) {
      await saveWhatsAppMessage({
        message_sid: twilioResponse.success ? twilioResponse.messageSid : '',
        from: 'whatsapp:+5511999999999', // número da empresa
        to: from,
        body: aiResponse.response,
        timestamp: new Date().toISOString(),
        processed: true
      });
    }

    // Responder ao Twilio com TwiML vazio (mensagem já foi enviada)
    res.set('Content-Type', 'text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    
    // Em caso de erro, tentar enviar mensagem de erro
    try {
      const phoneNumber = req.body.From?.replace('whatsapp:', '');
      if (phoneNumber) {
        await sendWhatsAppMessage(
          phoneNumber,
          'Desculpe, ocorreu um erro temporário. Tente novamente em alguns instantes.'
        );
      }
    } catch (sendError) {
      console.error('Erro ao enviar mensagem de erro:', sendError);
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook para status de mensagens
router.post('/whatsapp/status', (req: Request, res: Response) => {
  try {
    const {
      MessageSid: messageSid,
      MessageStatus: messageStatus,
      ErrorCode: errorCode,
      ErrorMessage: errorMessage
    } = req.body;

    console.log(`Status da mensagem ${messageSid}: ${messageStatus}`);

    // Atualizar status da mensagem no banco
    updateMessageStatus(messageSid, messageStatus, errorCode, errorMessage);
    
    res.set('Content-Type', 'text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    
  } catch (error) {
    console.error('Erro no webhook de status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para enviar mensagem manual (para testes)
router.post('/send-message', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Número de telefone e mensagem são obrigatórios' });
    }

    // Validar número de telefone
    const isValid = validateWhatsAppNumber(phoneNumber);
    if (!isValid) {
      return res.status(400).json({ error: 'Número de telefone inválido' });
    }

    // Enviar mensagem
    const response = await sendWhatsAppMessage(phoneNumber, message);
    
    // Salvar mensagem enviada
    await saveWhatsAppMessage({
      message_sid: response.success ? response.messageSid : '',
      from: 'whatsapp:+5511999999999', // número da empresa
      to: `whatsapp:${phoneNumber}`,
      body: message,
      timestamp: new Date().toISOString(),
      processed: true
    });

    res.json({ 
      success: true, 
      messageSid: response.success ? response.messageSid : '',
      message: 'Mensagem enviada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Endpoint para obter histórico de conversas
router.get('/conversations/:phoneNumber', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    const { count } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', phoneNumber);

    res.json({
      messages: messages || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

// Endpoint para obter estatísticas de mensagens
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { date_from, date_to } = req.query;
    
    let query = supabase
      .from('whatsapp_messages')
      .select('direction, status, created_at');
    
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    
    if (date_to) {
      query = query.lte('created_at', date_to);
    }
    
    const { data: messages, error } = await query;
    
    if (error) throw error;
    
    // Calcular estatísticas
    const stats = {
      total_messages: messages?.length || 0,
      inbound_messages: messages?.filter(m => m.direction === 'inbound').length || 0,
      outbound_messages: messages?.filter(m => m.direction === 'outbound').length || 0,
      sent_messages: messages?.filter(m => m.status === 'sent').length || 0,
      delivered_messages: messages?.filter(m => m.status === 'delivered').length || 0,
      failed_messages: messages?.filter(m => m.status === 'failed').length || 0
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Funções auxiliares
async function saveWhatsAppMessage(messageData: {
  message_sid: string;
  from: string;
  to: string;
  body: string;
  timestamp: string;
  processed: boolean;
}) {
  try {
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert({
        id: crypto.randomUUID(),
        ...messageData,
        created_at: messageData.timestamp
      });
    
    if (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
  }
}

async function updateMessageStatus(
  messageSid: string,
  status: string,
  errorCode?: string,
  errorMessage?: string
) {
  try {
    const updateData: any = { status };
    
    if (errorCode) {
      updateData.error_code = errorCode;
    }
    
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }
    
    const { error } = await supabase
      .from('whatsapp_messages')
      .update(updateData)
      .eq('message_sid', messageSid);
    
    if (error) {
      console.error('Erro ao atualizar status da mensagem:', error);
    }
  } catch (error) {
    console.error('Erro ao atualizar status da mensagem:', error);
  }
}

export default router;