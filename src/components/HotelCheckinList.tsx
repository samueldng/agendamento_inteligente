import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CreditCard, User, LogIn, LogOut, Edit, Eye, Filter, CheckCircle, XCircle } from 'lucide-react';
import { checkinsApi, reservationsApi } from '../lib/api/hotel';
import { HotelReservation, HotelCheckin } from '../lib/supabase';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Empty } from './ui/Empty';
import HotelCheckinForm from './HotelCheckinForm';



interface HotelCheckinListProps {
  professionalId: string;
}

const statusOptions = [
  { value: '', label: 'Todos os Status', color: 'text-gray-600' },
  { value: 'pending', label: 'Pendente', color: 'text-yellow-600' },
  { value: 'checked_in', label: 'Check-in Realizado', color: 'text-green-600' },
  { value: 'checked_out', label: 'Check-out Realizado', color: 'text-blue-600' }
];

const getStatusColor = (status: string) => {
  const statusOption = statusOptions.find(option => option.value === status);
  return statusOption?.color || 'text-gray-600';
};

const getStatusLabel = (status: string) => {
  const statusOption = statusOptions.find(option => option.value === status);
  return statusOption?.label || status;
};

export default function HotelCheckinList({ professionalId }: HotelCheckinListProps) {
  const [checkins, setCheckins] = useState<HotelCheckin[]>([]);
  const [pendingReservations, setPendingReservations] = useState<HotelReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState<HotelCheckin | undefined>();
  const [selectedReservation, setSelectedReservation] = useState<HotelReservation | undefined>();
  const [selectedCheckin, setSelectedCheckin] = useState<HotelCheckin | null>(null);
  const [formType, setFormType] = useState<'checkin' | 'checkout'>('checkin');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'checkins' | 'pending'>('checkins');

  useEffect(() => {
    loadData();
  }, [professionalId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCheckins(),
        loadPendingReservations()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCheckins = async () => {
    try {
      // TODO: Usar ID do profissional logado
      const data = await checkinsApi.getByProfessional('current-professional-id');
      setCheckins(data);
    } catch (error) {
      console.error('Erro ao carregar check-ins:', error);
    }
  };

  const loadPendingReservations = async () => {
    try {
      // TODO: Usar ID do profissional logado
      const data = await checkinsApi.getPendingReservations('current-professional-id');
      setPendingReservations(data);
    } catch (error) {
      console.error('Erro ao carregar reservas pendentes:', error);
    }
  };

  const handleCreateCheckin = async (checkinData: Omit<HotelCheckin, 'id'>) => {
    try {
      await checkinsApi.create(checkinData);
      await loadData();
    } catch (error) {
      console.error('Erro ao realizar check-in/check-out:', error);
      throw error;
    }
  };

  const handleUpdateCheckin = async (checkinData: Omit<HotelCheckin, 'id'>) => {
    if (!editingCheckin) return;

    try {
      await checkinsApi.update(editingCheckin.id, checkinData);
      await loadData();
      setEditingCheckin(undefined);
    } catch (error) {
      console.error('Erro ao atualizar check-in/check-out:', error);
      throw error;
    }
  };

  const handleQuickCheckin = async (reservation: HotelReservation) => {
    const now = new Date().toISOString();
    const checkinData = {
      reservation_id: reservation.id,
      professional_id: professionalId,
      actual_check_in: now,
      guests_present: reservation.guests_count,
      additional_charges: 0,
      status: 'checked_in' as const
    };

    try {
      await handleCreateCheckin(checkinData);
    } catch (error) {
      console.error('Erro no check-in rápido:', error);
    }
  };

  const handleQuickCheckout = async (checkin: HotelCheckin) => {
    try {
      await checkinsApi.checkout(checkin.id, {
        checkout_datetime: new Date().toISOString(),
        notes: checkin.notes ? `${checkin.notes}\n\nCheck-out rápido realizado` : 'Check-out rápido realizado'
      });
      
      await loadData();
    } catch (error) {
      console.error('Erro ao realizar check-out rápido:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const filteredCheckins = checkins.filter(checkin => {
    const matchesStatus = !statusFilter || checkin.status === statusFilter;
    const matchesDate = !dateFilter || 
      (checkin.actual_check_in && checkin.actual_check_in.startsWith(dateFilter)) ||
      (checkin.actual_check_out && checkin.actual_check_out.startsWith(dateFilter));
    
    return matchesStatus && matchesDate;
  });

  const checkedInGuests = checkins.filter(c => c.status === 'checked_in');

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Check-in & Check-out</h2>
          <p className="text-gray-600">Gerencie check-ins e check-outs do seu hotel</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setFormType('checkin');
              setSelectedReservation(undefined);
              setShowForm(true);
            }}
            className="flex items-center"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Check-in Manual
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFormType('checkout');
              setSelectedReservation(undefined);
              setShowForm(true);
            }}
            className="flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Check-out Manual
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-green-800 font-medium">Hóspedes Ativos</p>
              <p className="text-2xl font-bold text-green-900">{checkedInGuests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">Check-ins Pendentes</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingReservations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-blue-800 font-medium">Total Check-ins</p>
              <p className="text-2xl font-bold text-blue-900">{checkins.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('checkins')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'checkins'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Check-ins Realizados ({filteredCheckins.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Check-ins Pendentes ({pendingReservations.length})
          </button>
        </nav>
      </div>

      {/* Filtros para Check-ins Realizados */}
      {activeTab === 'checkins' && (
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
      )}

      {/* Conteúdo das Tabs */}
      {activeTab === 'checkins' ? (
        /* Lista de Check-ins Realizados */
        filteredCheckins.length === 0 ? (
          <Empty
            title="Nenhum check-in encontrado"
            description="Não há check-ins realizados ou que correspondam aos filtros aplicados."
            action={
              <Button onClick={() => setActiveTab('pending')}>
                Ver Check-ins Pendentes
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {filteredCheckins.map((checkin) => (
              <div
                key={checkin.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {checkin.reservation?.guest_name || 'Hóspede não identificado'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(checkin.status)} bg-gray-100`}>
                        {getStatusLabel(checkin.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      {checkin.actual_check_in && (
                        <div className="flex items-center">
                          <LogIn className="w-4 h-4 mr-2 text-green-500" />
                          <span>Check-in: {formatDateTime(checkin.actual_check_in)}</span>
                        </div>
                      )}
                      
                      {checkin.actual_check_out && (
                        <div className="flex items-center">
                          <LogOut className="w-4 h-4 mr-2 text-blue-500" />
                          <span>Check-out: {formatDateTime(checkin.actual_check_out)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{checkin.guests_present} hóspede{checkin.guests_present !== 1 ? 's' : ''}</span>
                      </div>
                      
                      {checkin.reservation?.room && (
                        <div className="flex items-center">
                          <span className="text-gray-500">Quarto:</span>
                          <span className="ml-1 font-medium">
                            {checkin.reservation.room.room_number} ({checkin.reservation.room.room_type})
                          </span>
                        </div>
                      )}
                      
                      {checkin.additional_charges && checkin.additional_charges > 0 && (
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Taxas extras: {formatCurrency(checkin.additional_charges)}</span>
                        </div>
                      )}
                    </div>
                    
                    {checkin.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Observações:</strong> {checkin.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-row lg:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCheckin(checkin)}
                      className="flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCheckin(checkin);
                        setFormType(checkin.status === 'checked_in' ? 'checkout' : 'checkin');
                        setShowForm(true);
                      }}
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    {checkin.status === 'checked_in' && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickCheckout(checkin)}
                        className="flex items-center bg-blue-600 hover:bg-blue-700"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Check-out
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Lista de Check-ins Pendentes */
        pendingReservations.length === 0 ? (
          <Empty
            title="Nenhum check-in pendente"
            description="Não há reservas aguardando check-in no momento."
          />
        ) : (
          <div className="grid gap-4">
            {pendingReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.guest_name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                        Aguardando Check-in
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Check-in previsto: {formatDate(reservation.check_in_date)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{reservation.guests_count} hóspede{reservation.guests_count !== 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{formatCurrency(reservation.total_amount)}</span>
                      </div>
                      
                      {reservation.room && (
                        <div className="flex items-center">
                          <span className="text-gray-500">Quarto:</span>
                          <span className="ml-1 font-medium">
                            {reservation.room.room_number} ({reservation.room.room_type})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleQuickCheckin(reservation)}
                      className="flex items-center bg-green-600 hover:bg-green-700"
                    >
                      <LogIn className="w-4 h-4 mr-1" />
                      Check-in Rápido
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setFormType('checkin');
                        setShowForm(true);
                      }}
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Check-in Detalhado
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal de Formulário */}
      <HotelCheckinForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCheckin(undefined);
          setSelectedReservation(undefined);
        }}
        onSubmit={editingCheckin ? handleUpdateCheckin : handleCreateCheckin}
        checkin={editingCheckin}
        reservation={selectedReservation}
        professionalId={professionalId}
        type={formType}
      />

      {/* Modal de Detalhes */}
      {selectedCheckin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">Detalhes do Check-in/Check-out</h2>
                <button
                  onClick={() => setSelectedCheckin(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {selectedCheckin.reservation && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Informações da Reserva</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Hóspede:</span>
                        <p className="font-medium">{selectedCheckin.reservation.guest_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Documento:</span>
                        <p className="font-medium">{selectedCheckin.reservation.guest_document}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Check-in previsto:</span>
                        <p className="font-medium">{formatDate(selectedCheckin.reservation.check_in_date)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Check-out previsto:</span>
                        <p className="font-medium">{formatDate(selectedCheckin.reservation.check_out_date)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informações do Check-in/Check-out</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {selectedCheckin.actual_check_in && (
                      <div>
                        <span className="text-gray-500">Check-in realizado:</span>
                        <p className="font-medium">{formatDateTime(selectedCheckin.actual_check_in)}</p>
                      </div>
                    )}
                    {selectedCheckin.actual_check_out && (
                      <div>
                        <span className="text-gray-500">Check-out realizado:</span>
                        <p className="font-medium">{formatDateTime(selectedCheckin.actual_check_out)}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Hóspedes presentes:</span>
                      <p className="font-medium">{selectedCheckin.guests_present}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className={`font-medium ${getStatusColor(selectedCheckin.status)}`}>
                        {getStatusLabel(selectedCheckin.status)}
                      </p>
                    </div>
                    {selectedCheckin.additional_charges && selectedCheckin.additional_charges > 0 && (
                      <div>
                        <span className="text-gray-500">Taxas adicionais:</span>
                        <p className="font-medium">{formatCurrency(selectedCheckin.additional_charges)}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedCheckin.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Observações</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {selectedCheckin.notes}
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