import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, Edit, Trash2, Calendar, Users, DollarSign, Loader2, AlertCircle, RefreshCw, Clock, Phone, Mail } from 'lucide-react';
import { ReservationForm } from '../../components/hotel/ReservationForm';
import { useHotelReservations } from '../../hooks/useHotel';
import { toast } from 'sonner';
import type { Database } from '../../lib/supabase';

type HotelReservation = Database['public']['Tables']['hotel_reservations']['Row'] & {
  hotel_rooms: Database['public']['Tables']['hotel_rooms']['Row'];
};

export function Reservations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<HotelReservation | null>(null);
  const [deletingReservation, setDeletingReservation] = useState<HotelReservation | null>(null);

  const {
    reservations,
    loading,
    error,
    createReservation,
    updateReservation,
    deleteReservation,
    cancelReservation,
    refreshReservations,
  } = useHotelReservations();

  const handleCreateReservation = async (data: any) => {
    try {
      await createReservation(data);
      setIsFormOpen(false);
      toast.success('Reserva criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast.error('Erro ao criar reserva. Tente novamente.');
    }
  };

  const handleUpdateReservation = async (data: any) => {
    if (!editingReservation) return;
    
    try {
      await updateReservation(editingReservation.id, data);
      setEditingReservation(null);
      toast.success('Reserva atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      toast.error('Erro ao atualizar reserva. Tente novamente.');
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservation(reservationId);
      toast.success('Reserva cancelada com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      toast.error('Erro ao cancelar reserva. Tente novamente.');
    }
  };

  const handleDeleteReservation = async () => {
    if (!deletingReservation) return;
    
    try {
      await deleteReservation(deletingReservation.id);
      setDeletingReservation(null);
      toast.success('Reserva excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
      toast.error('Erro ao excluir reserva. Tente novamente.');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshReservations();
      toast.success('Lista de reservas atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      toast.error('Erro ao atualizar lista. Tente novamente.');
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.guest_phone.includes(searchTerm) ||
      reservation.hotel_rooms.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Concluída';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getDaysUntilCheckin = (checkinDate: string) => {
    const today = new Date();
    const checkin = new Date(checkinDate);
    const diffTime = checkin.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar reservas</h2>
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
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-600 mt-2">Gerencie as reservas do hotel</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Reserva</DialogTitle>
              </DialogHeader>
              <ReservationForm
                onSubmit={handleCreateReservation}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por hóspede, e-mail, telefone ou quarto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && reservations.length === 0 ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando reservas...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Reservas</p>
                    <p className="text-2xl font-bold">{reservations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold">
                      {reservations.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-600">Confirmadas</p>
                    <p className="text-2xl font-bold">
                      {reservations.filter(r => r.status === 'confirmed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        reservations
                          .filter(r => r.status !== 'cancelled')
                          .reduce((sum, r) => sum + (r.total_amount || 0), 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reservations List */}
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhuma reserva encontrada' 
                  : 'Nenhuma reserva cadastrada'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando a primeira reserva'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Reserva
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => {
                const daysUntilCheckin = getDaysUntilCheckin(reservation.check_in_date);
                
                return (
                  <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Guest Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {reservation.guest_name}
                            </h3>
                            <Badge className={getStatusColor(reservation.status)}>
                              {getStatusLabel(reservation.status)}
                            </Badge>
                            {reservation.status === 'confirmed' && daysUntilCheckin <= 3 && daysUntilCheckin >= 0 && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                <Clock className="mr-1 h-3 w-3" />
                                {daysUntilCheckin === 0 ? 'Hoje' : `${daysUntilCheckin} dias`}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4" />
                              {reservation.guest_email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4" />
                              {reservation.guest_phone}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              {formatDate(reservation.check_in_date)} - {formatDate(reservation.check_out_date)}
                            </div>
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              {reservation.guests_count} hóspede{reservation.guests_count > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        {/* Room and Price Info */}
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-6">
                          <div className="text-center lg:text-right">
                            <p className="text-sm text-gray-600">Quarto</p>
                            <p className="font-semibold">
                              {reservation.hotel_rooms.room_number} - {reservation.hotel_rooms.room_type}
                            </p>
                          </div>
                          
                          <div className="text-center lg:text-right">
                            <p className="text-sm text-gray-600">Valor Total</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(reservation.total_amount || 0)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          {reservation.status === 'confirmed' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
                                  Cancelar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja cancelar a reserva de {reservation.guest_name}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Não</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelReservation(reservation.id)}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    Sim, Cancelar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          
                          <Dialog open={editingReservation?.id === reservation.id} onOpenChange={(open) => {
                            if (!open) setEditingReservation(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingReservation(reservation)}
                              >
                                <Edit className="mr-1 h-4 w-4" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Editar Reserva - {reservation.guest_name}</DialogTitle>
                              </DialogHeader>
                              <ReservationForm
                                reservation={reservation}
                                onSubmit={handleUpdateReservation}
                                onCancel={() => setEditingReservation(null)}
                              />
                            </DialogContent>
                          </Dialog>

                          <AlertDialog open={deletingReservation?.id === reservation.id} onOpenChange={(open) => {
                            if (!open) setDeletingReservation(null);
                          }}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setDeletingReservation(reservation)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a reserva de {reservation.guest_name}?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteReservation}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {reservation.special_requests && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Solicitações Especiais:</p>
                          <p className="text-sm">{reservation.special_requests}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}