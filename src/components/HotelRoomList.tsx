import React, { useState, useEffect } from 'react';
import { Plus, Users, Bed, DollarSign, Edit, Trash2, MoreVertical, CheckCircle, XCircle, Clock, Wrench, Wifi, Car, Coffee, Tv, Wind, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HotelRoomForm } from './HotelRoomForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Empty } from '@/components/ui/empty';
import { formatCurrency } from '@/lib/utils';
import { roomsApi, reservationsApi } from '@/lib/api/hotel';
import { HotelRoom as BaseHotelRoom, HotelReservation } from '@/lib/validations/hotel';

// Extended interface for room with status and additional properties
interface ExtendedHotelRoom extends BaseHotelRoom {
  id: string;
  created_at: string;
  updated_at: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  currentReservation?: {
    id: string;
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
  };
  nextReservation?: {
    id: string;
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
  };
  occupancyRate?: number;
}

type HotelRoom = ExtendedHotelRoom;

interface HotelRoomListProps {
  professionalId: string;
}

const roomTypeLabels = {
  single: 'Single',
  double: 'Duplo',
  suite: 'Suíte',
  family: 'Família'
};

const statusConfig = {
  available: { label: 'Disponível', color: 'bg-green-100 text-green-800' },
  occupied: { label: 'Ocupado', color: 'bg-red-100 text-red-800' },
  maintenance: { label: 'Manutenção', color: 'bg-yellow-100 text-yellow-800' },
  cleaning: { label: 'Limpeza', color: 'bg-blue-100 text-blue-800' }
};

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  tv: Tv,
  ac: Wind,
  minibar: Coffee
};

export default function HotelRoomList({ professionalId }: HotelRoomListProps) {
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<HotelRoom | undefined>();
  const [deletingRoom, setDeletingRoom] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, [professionalId]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredRooms(rooms);
    } else {
      setFilteredRooms(rooms.filter(room => {
        const status = !room.is_active ? 'maintenance' : (room.status || 'available');
        return status === statusFilter;
      }));
    }
  }, [rooms, statusFilter]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      
      // Carregar quartos
      const roomsData = await roomsApi.getAll();
      
      // Carregar reservas para calcular ocupação
      const reservationsData = await reservationsApi.getAll();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Enriquecer dados dos quartos com informações de ocupação
        const enrichedRooms = roomsData.map((room: BaseHotelRoom & { id: string; created_at: string; updated_at: string }) => {
          const roomReservations = reservationsData.filter((reservation: HotelReservation) => 
            reservation.room_id === room.id && reservation.status === 'confirmed'
          );
          
          // Encontrar reserva atual (check-in hoje ou anterior, check-out futuro)
          const currentReservation = roomReservations.find((reservation: HotelReservation) => {
            const checkIn = new Date(reservation.check_in_date);
            const checkOut = new Date(reservation.check_out_date);
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);
            return checkIn <= today && checkOut > today;
          });
          
          // Encontrar próxima reserva
          const nextReservation = roomReservations
            .filter((reservation: HotelReservation) => {
              const checkIn = new Date(reservation.check_in_date);
              checkIn.setHours(0, 0, 0, 0);
              return checkIn > today;
            })
            .sort((a: HotelReservation, b: HotelReservation) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())[0];
          
          // Calcular taxa de ocupação dos últimos 30 dias
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const recentReservations = roomReservations.filter((reservation: HotelReservation) => {
            const checkOut = new Date(reservation.check_out_date);
            return checkOut >= thirtyDaysAgo;
          });
          
          let occupiedDays = 0;
          recentReservations.forEach((reservation: HotelReservation) => {
            const checkIn = new Date(reservation.check_in_date);
            const checkOut = new Date(reservation.check_out_date);
            const start = checkIn > thirtyDaysAgo ? checkIn : thirtyDaysAgo;
            const end = checkOut < today ? checkOut : today;
            
            if (start < end) {
              occupiedDays += Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            }
          });
          
          const occupancyRate = Math.round((occupiedDays / 30) * 100);
          
          // Calcular status baseado na reserva atual e se o quarto está ativo
          let roomStatus: 'available' | 'occupied' | 'maintenance' | 'cleaning' = 'available';
          if (!room.is_active) {
            roomStatus = 'maintenance';
          } else if (currentReservation) {
            roomStatus = 'occupied';
          }
          
          return {
            ...room,
            status: roomStatus,
            currentReservation: currentReservation ? {
              id: currentReservation.id,
              guestName: currentReservation.guest_name,
              checkInDate: currentReservation.check_in_date,
              checkOutDate: currentReservation.check_out_date,
              status: currentReservation.status
            } : undefined,
            nextReservation: nextReservation ? {
              id: nextReservation.id,
              guestName: nextReservation.guest_name,
              checkInDate: nextReservation.check_in_date,
              checkOutDate: nextReservation.check_out_date
            } : undefined,
            occupancyRate
          };
        });
        
        setRooms(enrichedRooms);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (roomData: BaseHotelRoom) => {
    try {
      await roomsApi.create(roomData);
      await loadRooms();
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao criar quarto:', error);
      throw error;
    }
  };

  const handleUpdateRoom = async (roomData: BaseHotelRoom) => {
    if (!editingRoom) return;

    try {
      await roomsApi.update(editingRoom.id, roomData);
      await loadRooms();
      setEditingRoom(undefined);
    } catch (error) {
      console.error('Erro ao atualizar quarto:', error);
      throw error;
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Tem certeza que deseja excluir este quarto?')) {
      return;
    }

    try {
      setDeletingRoom(roomId);
      await roomsApi.delete(roomId);
      await loadRooms();
    } catch (error) {
      console.error('Erro ao excluir quarto:', error);
    } finally {
      setDeletingRoom(null);
    }
  };

  const handleEditRoom = (room: ExtendedHotelRoom) => {
    setEditingRoom(room);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRoom(undefined);
  };

  const handleUpdateRoomStatus = async (roomId: string, newStatus: string) => {
    try {
      setUpdatingStatus(roomId);
      await roomsApi.updateStatus(roomId, newStatus);
      await loadRooms();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = ['available', 'occupied', 'maintenance', 'cleaning'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Quartos</h2>
          <p className="text-gray-600 mt-1">Gerencie os quartos e acomodações do seu hotel</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Quarto
        </Button>
      </div>

      {/* Filtros e Estatísticas */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'all' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({rooms.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'available' 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Disponíveis ({rooms.filter(r => r.status === 'available').length})
            </button>
            <button
              onClick={() => setStatusFilter('occupied')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'occupied' 
                  ? 'bg-red-100 text-red-800 border border-red-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ocupados ({rooms.filter(r => r.status === 'occupied').length})
            </button>
            <button
              onClick={() => setStatusFilter('maintenance')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'maintenance' 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Manutenção ({rooms.filter(r => r.status === 'maintenance').length})
            </button>
            <button
              onClick={() => setStatusFilter('cleaning')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'cleaning' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Limpeza ({rooms.filter(r => r.status === 'cleaning').length})
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Taxa de ocupação geral: <span className="font-bold">
              {rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <Empty
          icon={Bed}
          title={statusFilter === 'all' ? "Nenhum quarto cadastrado" : `Nenhum quarto ${statusFilter === 'available' ? 'disponível' : statusFilter === 'occupied' ? 'ocupado' : statusFilter === 'maintenance' ? 'em manutenção' : 'em limpeza'}`}
          description={statusFilter === 'all' ? "Comece criando o primeiro quarto do seu hotel" : "Não há quartos com este status no momento"}
          action={
            statusFilter === 'all' ? (
              <Button onClick={() => setShowForm(true)}>
                Criar Primeiro Quarto
              </Button>
            ) : (
              <Button onClick={() => setStatusFilter('all')} variant="outline">
                Ver Todos os Quartos
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Quarto {room.room_number}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium capitalize">
                      {roomTypeLabels[room.room_type]}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[room.status].color}`}>
                    {room.status === 'available' ? '✅ Disponível' : 
                     room.status === 'occupied' ? '🔴 Ocupado' : 
                     room.status === 'maintenance' ? '🔧 Manutenção' : statusConfig[room.status].label}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{room.capacity} pessoa{room.capacity !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-700">R$ {room.base_price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Informações de Ocupação */}
                  {room.occupancyRate !== undefined && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Taxa de Ocupação (30 dias)</span>
                        <span className={`text-sm font-bold ${
                          room.occupancyRate >= 80 ? 'text-green-600' :
                          room.occupancyRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {room.occupancyRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            room.occupancyRate >= 80 ? 'bg-green-500' :
                            room.occupancyRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${room.occupancyRate}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Reserva Atual */}
                  {room.currentReservation && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-red-800">Ocupado Atualmente</span>
                      </div>
                      <p className="text-sm text-red-700">
                        <strong>{room.currentReservation.guestName}</strong>
                      </p>
                      <p className="text-xs text-red-600">
                        Check-out: {new Date(room.currentReservation.checkOutDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {/* Próxima Reserva */}
                  {room.nextReservation && !room.currentReservation && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-800">Próxima Reserva</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        <strong>{room.nextReservation.guestName}</strong>
                      </p>
                      <p className="text-xs text-blue-600">
                        Check-in: {new Date(room.nextReservation.checkInDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {room.amenities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">🏨 Comodidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 4).map((amenity) => {
                          const Icon = amenityIcons[amenity as keyof typeof amenityIcons] || Coffee;
                          return (
                            <div key={amenity} className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded">
                              <Icon className="w-3 h-3" />
                              <span>{amenity}</span>
                            </div>
                          );
                        })}
                        {room.amenities.length > 4 && (
                          <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border">+{room.amenities.length - 4} mais</span>
                        )}
                      </div>
                    </div>
                  )}

                  {room.description && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {room.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 mt-4 border-t border-gray-100 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRoom(room)}
                    className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  
                  {/* Dropdown para atualizar status */}
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updatingStatus === room.id}
                      className="flex items-center gap-1"
                    >
                      {updatingStatus === room.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Status
                    </Button>
                    
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      {getStatusOptions(room.status).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateRoomStatus(room.id, status)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md flex items-center gap-2"
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            status === 'available' ? 'bg-green-500' :
                            status === 'occupied' ? 'bg-red-500' :
                            status === 'maintenance' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          {status === 'available' ? 'Disponível' :
                           status === 'occupied' ? 'Ocupado' :
                           status === 'maintenance' ? 'Manutenção' :
                           'Limpeza'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRoom(room.id)}
                    loading={deletingRoom === room.id}
                    disabled={deletingRoom === room.id}
                    className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <HotelRoomForm
        isOpen={showForm || !!editingRoom}
        onClose={handleCloseForm}
        onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom}
        room={editingRoom}
        professionalId={professionalId}
      />
    </div>
  );
}