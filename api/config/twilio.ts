import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const isConfigured = accountSid && authToken && whatsappNumber && 
  accountSid.startsWith('AC') && authToken.length > 0;

let twilioClient: twilio.Twilio | null = null;

if (isConfigured) {
  twilioClient = twilio(accountSid!, authToken!);
} else {
  console.warn('⚠️  Twilio não configurado - funcionalidades de WhatsApp desabilitadas');
}

const client = twilioClient;

export { client as twilioClient, whatsappNumber };

// Função para enviar mensagem WhatsApp
export const sendWhatsAppMessage = async (to: string, body: string) => {
  if (!twilioClient || !whatsappNumber) {
    console.warn('Twilio não configurado - não é possível enviar mensagem');
    return {
      success: false,
      error: 'Twilio não configurado'
    };
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: whatsappNumber,
      to: `whatsapp:${to}`
    });
    
    return {
      success: true,
      messageSid: message.sid
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// Função para validar número WhatsApp
export const validateWhatsAppNumber = async (phoneNumber: string): Promise<boolean> => {
  if (!twilioClient) {
    console.warn('Twilio não configurado - validação de número desabilitada');
    return true; // Assume válido quando não configurado
  }

  try {
    const lookup = await twilioClient.lookups.v1.phoneNumbers(phoneNumber).fetch();
    return lookup.phoneNumber !== null;
  } catch (error) {
    console.error('Erro ao validar número WhatsApp:', error);
    return false;
  }
};

// Função para formatar número WhatsApp
export const formatWhatsAppNumber = (phoneNumber: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Se não começar com código do país, assume Brasil (+55)
  if (!cleaned.startsWith('55') && cleaned.length === 11) {
    return `+55${cleaned}`;
  }
  
  // Se já tem código do país
  if (cleaned.startsWith('55') && cleaned.length === 13) {
    return `+${cleaned}`;
  }
  
  // Se já tem + no início
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  return `+${cleaned}`;
};