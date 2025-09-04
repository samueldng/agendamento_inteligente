import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import HotelConsumptionForm from '../components/HotelConsumptionForm';
import HotelConsumptionList from '../components/HotelConsumptionList';
import { toast } from 'sonner';

interface HotelReservation {
  id: string;
  guest_name: string;
  guest_document: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  room_id: string;
  status: string;
  total_amount: number;
  special_requests?: string;
  hotel_rooms: {
    id: string;
    room_number: string;
    room_type: string;
    capacity: number;
    price_per_night: number;
    amenities: string[];
    is_active: boolean;
  };
}

export default function HotelConsumption() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<HotelReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (reservationId) {
      loadReservation();
    }
  }, [reservationId]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hotel-reservations/${reservationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservation(data.data);
      } else {
        toast.error('Reserva não encontrada');
        navigate('/hotel/reservations');
      }
    } catch (error) {
      console.error('Erro ao carregar reserva:', error);
      toast.error('Erro ao carregar reserva');
      navigate('/hotel/reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleConsumptionAdded = () => {
    setShowForm(false);
    // A lista será recarregada automaticamente através do useEffect
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'checked_in':
        return 'Check-in Realizado';
      case 'checked_out':
        return 'Check-out Realizado';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendente';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reserva não encontrada</h2>
          <p className="text-gray-600 mb-4">A reserva solicitada não foi encontrada.</p>
          <Button onClick={() => navigate('/hotel/reservations')}>Voltar às Reservas</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              onClick={() => navigate('/hotel/reservations')}
              variant="outline"
              className="mr-4 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="w-8 h-8 mr-3" />
              Consumo do Hóspede
            </h1>
          </div>

          {/* Informações da Reserva */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Hóspede</h3>
                <p className="text-lg font-semibold text-gray-900">{reservation.guest_name}</p>
                <p className="text-sm text-gray-600">{reservation.guest_document}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Quarto</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {reservation.hotel_rooms.room_number}
                </p>
                <p className="text-sm text-gray-600">{reservation.hotel_rooms.room_type}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Período</h3>
                <p className="text-sm text-gray-900">
                  {formatDate(reservation.check_in_date)} até {formatDate(reservation.check_out_date)}
                </p>
                <p className="text-sm text-gray-600">
                  {reservation.guests_count} hóspede{reservation.guests_count > 1 ? 's' : ''}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getStatusColor(reservation.status)
                }`}>
                  {getStatusText(reservation.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        {showForm ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <HotelConsumptionForm
              reservationId={reservation.id}
              guestName={reservation.guest_name}
              roomNumber={reservation.hotel_rooms.room_number}
              onConsumptionAdded={handleConsumptionAdded}
              onClose={() => setShowForm(false)}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <HotelConsumptionList
              reservationId={reservation.id}
              guestName={reservation.guest_name}
              roomNumber={reservation.hotel_rooms.room_number}
              onAddConsumption={() => setShowForm(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}