import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados do usuário
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Simular usuário logado para demonstração
          setUser({
            id: '1',
            email: 'admin@example.com',
            name: 'Administrador',
            role: 'admin'
          });
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user
  };
}