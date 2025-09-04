import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import HotelRoomList from '../components/HotelRoomList';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function HotelRooms() {
  const [loading, setLoading] = useState(true);
  const [professionalId, setProfessionalId] = useState<string>('');

  useEffect(() => {
    const loadProfessionalData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token || !session?.user?.id) {
          return;
        }

        const response = await fetch(`/api/professionals?user_id=${session.user.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
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
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!professionalId) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Perfil Profissional Necessário
          </h2>
          <p className="text-gray-600">
            Você precisa ter um perfil profissional cadastrado para gerenciar quartos.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <HotelRoomList professionalId={professionalId} />
        </div>
      </div>
    </Layout>
  );
}