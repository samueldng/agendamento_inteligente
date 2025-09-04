import { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, Phone, Mail, Edit, Trash2, Eye, Plus, Filter, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Empty } from './ui/Empty';
import HotelReservationForm from './HotelReservationForm';
import { reservationsApi } from '../lib/api/hotel';
import type { HotelReservation } from '../lib/supabase';



interface HotelReservationListProps {
  professionalId: string;
}

const statusOptions = [
  { value: '', label: 'Todos os Status', color: 'text-gray-600' },
  { value: 'pending', label: 'Pendente', color: 'text-yellow-600' },
  { value: 'confirmed', label: 'Confirmada', color: 'text-green-600' },
  { value: 'cancelled', label: 'Cancelada', color: 'text-red-600' },
  { value: 'completed', label: 'Concluída', color: 'text-blue-600' }
];

const getStatusColor = (status: string) => {
  const statusOption = statusOptions.find(option => option.value === status);
  return statusOption?.color || 'text-gray-600';
};

const getStatusLabel = (status: string) => {
  const statusOption = statusOptions.find(option => option.value === status);
  return statusOption?.label || status;
};

export default function HotelReservationList({ professionalId }: HotelReservationListProps) {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<HotelReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<HotelReservation | undefined>();
  const [selectedReservation, setSelectedReservation] = useState<HotelReservation | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadReservations();
  }, [professionalId]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationsApi.getByProfessional(professionalId);
      setReservations(data || []);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async (reservationData: Omit<HotelReservation, 'id'>) => {
    try {
      await reservationsApi.create(reservationData);
      await loadReservations();
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      throw error;
    }
  };

  const handleUpdateReservation = async (reservationData: Omit<HotelReservation, 'id'>) => {
    if (!editingReservation) return;

    try {
      await reservationsApi.update(editingReservation.id, reservationData);
      await loadReservations();
      setEditingReservation(undefined);
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      throw error;
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;

    try {
      await reservationsApi.cancel(id);
      await loadReservations();
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = !statusFilter || reservation.status === statusFilter;
    const matchesDate = !dateFilter || 
      reservation.check_in_date.startsWith(dateFilter) || 
      reservation.check_out_date.startsWith(dateFilter);
    
    return matchesStatus && matchesDate;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Reservas</h2>
          <p className="text-gray-600">Gerencie reservas e hospedagens do seu hotel</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Filtrar por data"
              />
            </div>
            
            {(statusFilter || dateFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('');
                  setDateFilter('');
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Reservas */}
      {filteredReservations.length === 0 ? (
        <Empty
          title="Nenhuma reserva encontrada"
          description="Não há reservas cadastradas ou que correspondam aos filtros aplicados."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira reserva
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
            >
              <div className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">👤 {reservation.guest_name}</h3>
                    {reservation.room && (
                      <p className="font-medium text-gray-600">🏨 Quarto {reservation.room.room_number}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)} bg-gray-100 capitalize`}>
                    {reservation.status === 'confirmed' ? '✅ Confirmada' :
                     reservation.status === 'pending' ? '⏳ Pendente' :
                     reservation.status === 'cancelled' ? '❌ Cancelada' :
                     reservation.status === 'completed' ? '✅ Concluída' :
                     getStatusLabel(reservation.status)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>📅 Check-in: {formatDate(reservation.check_in_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>📅 Check-out: {formatDate(reservation.check_out_date)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-700">{formatCurrency(reservation.total_amount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">{reservation.guests_count} hóspede{reservation.guests_count > 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                {reservation.special_requests && (
                  <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm text-gray-700">📝 {reservation.special_requests}</p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/hotel-consumption/${reservation.id}`)}
                    className="flex-1 hover:bg-green-50 hover:border-green-300 text-green-600"
                    disabled={reservation.status === 'cancelled'}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Consumo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingReservation(reservation);
                      setShowForm(true);
                    }}
                    className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteReservation(reservation.id)}
                    className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      <HotelReservationForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingReservation(undefined);
        }}
        onSubmit={editingReservation ? handleUpdateReservation : handleCreateReservation}
        reservation={editingReservation}
        professionalId={professionalId}
      />

      {/* Modal de Detalhes */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">Detalhes da Reserva</h2>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informações do Hóspede</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nome:</span>
                      <p className="font-medium">{selectedReservation.guest_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Documento:</span>
                      <p className="font-medium">{selectedReservation.guest_document}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedReservation.guest_email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Telefone:</span>
                      <p className="font-medium">{selectedReservation.guest_phone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informações da Reserva</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Check-in:</span>
                      <p className="font-medium">{formatDate(selectedReservation.check_in_date)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Check-out:</span>
                      <p className="font-medium">{formatDate(selectedReservation.check_out_date)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Hóspedes:</span>
                      <p className="font-medium">{selectedReservation.guests_count}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Noites:</span>
                      <p className="font-medium">{calculateNights(selectedReservation.check_in_date, selectedReservation.check_out_date)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className={`font-medium ${getStatusColor(selectedReservation.status)}`}>
                        {getStatusLabel(selectedReservation.status)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Valor Total:</span>
                      <p className="font-medium text-lg">{formatCurrency(selectedReservation.total_amount)}</p>
                    </div>
                  </div>
                </div>
                
                {selectedReservation.special_requests && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Solicitações Especiais</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {selectedReservation.special_requests}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}