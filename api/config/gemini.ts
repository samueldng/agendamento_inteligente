import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY!;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Configuração do modelo para conversação de agendamento
export const conversationModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024,
  },
});

// Prompt base para o assistente de agendamento
export const SYSTEM_PROMPT = `
Você é um assistente inteligente de agendamento para uma empresa de serviços.

Suas responsabilidades:
1. Ajudar clientes a agendar serviços
2. Verificar disponibilidade de horários
3. Confirmar agendamentos
4. Reagendar ou cancelar quando necessário
5. Fornecer informações sobre serviços

Regras importantes:
- Seja sempre educado e profissional
- Confirme todos os detalhes antes de finalizar agendamentos
- Se não souber algo, peça para o cliente aguardar enquanto verifica
- Mantenha as respostas concisas e claras
- Sempre confirme nome, telefone, serviço e horário desejado

Formato de resposta esperado:
- Para agendamentos: solicite nome, telefone, serviço desejado e horário preferido
- Para consultas: forneça informações claras e objetivas
- Para cancelamentos: confirme os detalhes e processe a solicitação
`;

export default genAI;