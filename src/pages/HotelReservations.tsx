import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import HotelReservationList from '../components/HotelReservationList';
import { useAuthStore } from '../stores/authStore';

export default function HotelReservations() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    const loadProfessionalData = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`/api/professionals?user_id=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            setProfessionalId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do profissional:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfessionalData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!professionalId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Perfil Profissional Necessário
          </h2>
          <p className="text-gray-600">
            Para gerenciar reservas hoteleiras, você precisa ter um perfil profissional configurado.
          </p>
        </div>
      </div>
    );
  }

  return <HotelReservationList professionalId={professionalId} />;
}