import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import HotelCheckinList from '../components/HotelCheckinList';
import { supabase } from '../lib/supabase';

export default function HotelCheckins() {
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfessionalData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/professionals/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.professional) {
            setProfessionalId(data.professional.id);
          } else {
            // Usuário não tem perfil profissional
            navigate('/professionals');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do profissional:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadProfessionalData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!professionalId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Perfil Profissional Necessário
          </h2>
          <p className="text-gray-600 mb-4">
            Você precisa ter um perfil profissional para acessar o sistema de check-ins.
          </p>
          <button
            onClick={() => navigate('/professionals')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Criar Perfil Profissional
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <HotelCheckinList professionalId={professionalId} />
    </div>
  );
}