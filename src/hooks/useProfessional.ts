import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface UseProfessionalReturn {
  professionalId: string;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Hook centralizado para gerenciar o Professional ID
 * Inclui retry automático e melhor tratamento de erros
 */
export function useProfessional(): UseProfessionalReturn {
  const [professionalId, setProfessionalId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadProfessionalData = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      console.log('🔍 [useProfessional] Verificando sessão do usuário...');
      // Verificar sessão do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 [useProfessional] Sessão:', session ? 'Encontrada' : 'Não encontrada', session?.user?.email);
      
      if (sessionError) {
        throw new Error(`Erro de sessão: ${sessionError.message}`);
      }
      
      if (!session?.user?.id) {
        console.log('❌ [useProfessional] Usuário não autenticado');
        throw new Error('Usuário não está autenticado');
      }

      if (!session.access_token) {
        console.log('❌ [useProfessional] Token de acesso não encontrado');
        throw new Error('Token de acesso não encontrado');
      }

      console.log('✅ [useProfessional] Usuário autenticado:', session.user.email);
      // Fazer requisição para obter dados do profissional
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      console.log('🌐 [useProfessional] Fazendo requisição para:', `${API_BASE_URL}/professionals/by-user`);
      const response = await fetch(`${API_BASE_URL}/professionals/by-user`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('📡 [useProfessional] Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API (${response.status}): ${errorText}`);
      }

      const responseData = await response.json();
      
      // Verificar estrutura da resposta
      const professional = responseData.success ? responseData.data : responseData;
      
      if (!professional?.id) {
        console.log('❌ [useProfessional] Professional ID não encontrado na resposta:', responseData);
        throw new Error('Professional ID não encontrado na resposta da API');
      }

      console.log('✅ [useProfessional] Professional ID obtido:', professional.id);
       setProfessionalId(professional.id);
      setError(null);
      setRetryCount(0);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados do profissional';
      console.error('Erro ao carregar dados do profissional:', err);
      
      setError(errorMessage);
      
      // Retry automático (máximo 3 tentativas)
      if (retryCount < 3 && !isRetry) {
        console.log(`Tentativa ${retryCount + 1}/3 de retry em 2 segundos...`);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          loadProfessionalData(true);
        }, 2000);
      } else {
        // Mostrar toast apenas se não for um retry automático
        if (!isRetry) {
          toast.error(errorMessage);
        }
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, [retryCount]);

  const retry = useCallback(() => {
    setRetryCount(0);
    loadProfessionalData();
  }, [loadProfessionalData]);

  useEffect(() => {
    loadProfessionalData();
  }, []);

  return {
    professionalId,
    loading,
    error,
    retry
  };
}

/**
 * Hook para aguardar o Professional ID estar disponível
 * Útil para componentes que precisam garantir que o ID está carregado
 */
export function useAwaitProfessional(): Promise<string> {
  return new Promise((resolve, reject) => {
    const checkProfessional = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          throw new Error('Usuário não está autenticado');
        }

        const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_BASE_URL}/professionals/by-user`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }

        const responseData = await response.json();
        const professional = responseData.success ? responseData.data : responseData;
        
        if (!professional?.id) {
          throw new Error('Professional ID não encontrado');
        }

        resolve(professional.id);
      } catch (error) {
        reject(error);
      }
    };

    checkProfessional();
  });
}