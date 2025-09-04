import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthTest: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 [AuthTest] Verificando autenticação...');
        
        // Verificar sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔍 [AuthTest] Sessão:', session);
        console.log('🔍 [AuthTest] Erro de sessão:', sessionError);
        
        if (sessionError) {
          setError(`Erro de sessão: ${sessionError.message}`);
          return;
        }
        
        if (!session) {
          setError('Usuário não está autenticado');
          return;
        }
        
        // Verificar usuário
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        console.log('🔍 [AuthTest] Usuário:', user);
        console.log('🔍 [AuthTest] Erro de usuário:', userError);
        
        setAuthStatus({
          session: {
            access_token: session.access_token ? 'Presente' : 'Ausente',
            refresh_token: session.refresh_token ? 'Presente' : 'Ausente',
            expires_at: session.expires_at,
            user: {
              id: session.user?.id,
              email: session.user?.email,
              role: session.user?.role
            }
          },
          user: {
            id: user?.id,
            email: user?.email,
            role: user?.role
          }
        });
        
      } catch (err) {
        console.error('🔍 [AuthTest] Erro:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      console.log('🔍 [AuthTest] Tentando fazer login...');
      
      // Redirecionar para página de login
      window.location.href = '/login';
      
    } catch (err) {
      console.error('🔍 [AuthTest] Erro no login:', err);
      setError(err instanceof Error ? err.message : 'Erro no login');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Teste de Autenticação</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Autenticação</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          <h2 className="font-semibold mb-2">Erro</h2>
          <p>{error}</p>
          <button
            onClick={handleLogin}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ir para Login
          </button>
        </div>
      )}
      
      {authStatus && (
        <div className="space-y-6">
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">Sessão</h2>
            <div className="text-sm space-y-1">
              <p><strong>Access Token:</strong> {authStatus.session.access_token}</p>
              <p><strong>Refresh Token:</strong> {authStatus.session.refresh_token}</p>
              <p><strong>Expires At:</strong> {authStatus.session.expires_at ? new Date(authStatus.session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
              <p><strong>User ID:</strong> {authStatus.session.user.id || 'N/A'}</p>
              <p><strong>Email:</strong> {authStatus.session.user.email || 'N/A'}</p>
              <p><strong>Role:</strong> {authStatus.session.user.role || 'N/A'}</p>
            </div>
          </div>
          
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">Usuário</h2>
            <div className="text-sm space-y-1">
              <p><strong>ID:</strong> {authStatus.user.id || 'N/A'}</p>
              <p><strong>Email:</strong> {authStatus.user.email || 'N/A'}</p>
              <p><strong>Role:</strong> {authStatus.user.role || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthTest;