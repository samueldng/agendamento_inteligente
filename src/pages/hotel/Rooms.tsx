import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Bed, Users, DollarSign, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { RoomForm } from '../../components/hotel/RoomForm';
import { useHotelRooms } from '../../hooks/useHotel';
import { toast } from 'sonner';
import type { Database } from '../../lib/supabase';

type BaseHotelRoom = Database['public']['Tables']['hotel_rooms']['Row'];

// Extended interface with calculated status
interface HotelRoom extends BaseHotelRoom {
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
}

export function Rooms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<HotelRoom | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<HotelRoom | null>(null);

  console.log('🔥 TESTE: Componente Rooms renderizado, isFormOpen:', isFormOpen);

  const {
    rooms: baseRooms,
    loading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    refreshRooms,
  } = useHotelRooms();

  // Calculate status for each room
  const rooms: HotelRoom[] = baseRooms.map(room => ({
    ...room,
    status: room.is_active ? 'available' : 'maintenance' as const
  }));

  const handleCreateRoom = async (data: Omit<BaseHotelRoom, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createRoom(data);
      setIsFormOpen(false);
      toast.success('Quarto criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar quarto:', error);
      toast.error('Erro ao criar quarto. Tente novamente.');
    }
  };

  const handleUpdateRoom = async (data: Partial<BaseHotelRoom>) => {
    if (!editingRoom) return;
    
    try {
      await updateRoom(editingRoom.id, data);
      setEditingRoom(null);
      toast.success('Quarto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar quarto:', error);
      toast.error('Erro ao atualizar quarto. Tente novamente.');
    }
  };

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return;
    
    try {
      await deleteRoom(deletingRoom.id);
      setDeletingRoom(null);
      toast.success('Quarto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir quarto:', error);
      toast.error('Erro ao excluir quarto. Tente novamente.');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshRooms();
      toast.success('Lista de quartos atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      toast.error('Erro ao atualizar lista. Tente novamente.');
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.room_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'cleaning':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'occupied':
        return 'Ocupado';
      case 'maintenance':
        return 'Manutenção';
      case 'cleaning':
        return 'Limpeza';
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar quartos</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quartos</h1>
          <p className="text-gray-600 mt-2">Gerencie os quartos do hotel</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          {/* Botão de teste direto */}
          <Button 
            onClick={() => {
              console.log('🔥 TESTE: Botão teste clicado, forçando abertura do modal');
              setIsFormOpen(true);
            }}
            variant="outline"
          >
            TESTE MODAL
          </Button>
          
          <Dialog open={isFormOpen} onOpenChange={(open) => {
            console.log('🔥 TESTE: Dialog onOpenChange chamado, open:', open);
            setIsFormOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                console.log('🔥 TESTE: Botão Novo Quarto clicado!');
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Quarto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Quarto</DialogTitle>
              </DialogHeader>
              <RoomForm
                onSubmit={handleCreateRoom}
                onCancel={() => {
                  console.log('🔥 TESTE: Cancelar formulário clicado!');
                  setIsFormOpen(false);
                }}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por número, tipo ou status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && rooms.length === 0 ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando quartos...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bed className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Quartos</p>
                    <p className="text-2xl font-bold">{rooms.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-600">Disponíveis</p>
                    <p className="text-2xl font-bold">
                      {rooms.filter(r => r.status === 'available').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-600">Ocupados</p>
                    <p className="text-2xl font-bold">
                      {rooms.filter(r => r.status === 'occupied').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-600">Manutenção</p>
                    <p className="text-2xl font-bold">
                      {rooms.filter(r => r.status === 'maintenance').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum quarto encontrado' : 'Nenhum quarto cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando o primeiro quarto do hotel'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Quarto
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">Quarto {room.room_number}</CardTitle>
                        <p className="text-gray-600">{room.room_type}</p>
                      </div>
                      <Badge className={getStatusColor(room.status)}>
                        {getStatusLabel(room.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                          <Users className="mr-1 h-4 w-4" />
                          Até {room.capacity} pessoas
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-lg font-semibold text-green-600">
                          <DollarSign className="mr-1 h-4 w-4" />
                          {formatCurrency(room.base_price)}
                        </span>
                        <span className="text-sm text-gray-500">por noite</span>
                      </div>

                      {room.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {room.description}
                        </p>
                      )}

                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {room.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{room.amenities.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Dialog open={editingRoom?.id === room.id} onOpenChange={(open) => {
                          if (!open) setEditingRoom(null);
                        }}>
                          <DialogTrigger
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 flex-1"
                            onClick={() => setEditingRoom(room)}
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            Editar
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Editar Quarto {room.room_number}</DialogTitle>
                            </DialogHeader>
                            <RoomForm
                              room={room}
                              onSubmit={handleUpdateRoom}
                              onCancel={() => setEditingRoom(null)}
                            />
                          </DialogContent>
                        </Dialog>

                        <AlertDialog open={deletingRoom?.id === room.id} onOpenChange={(open) => {
                          if (!open) setDeletingRoom(null);
                        }}>
                          <AlertDialogTrigger
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700"
                            onClick={() => setDeletingRoom(room)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o quarto {room.room_number}?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteRoom}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}