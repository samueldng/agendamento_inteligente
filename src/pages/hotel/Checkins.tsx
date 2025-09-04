import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckinForm } from '@/components/hotel/CheckinForm';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { z } from 'zod';
import { hotelCheckinSchema } from '@/lib/validations/hotel';

type CheckinFormData = z.infer<typeof hotelCheckinSchema>;

interface Checkin {
  id: string;
  reservation_id: string;
  checkin_datetime: string;
  checkout_datetime: string;
  actual_guests: number;
  checkin_notes?: string;
  checkout_notes?: string;
  room_condition_checkin?: string;
  room_condition_checkout?: string;
  damages_reported?: string;
  additional_charges: number;
  payment_method?: string;
  staff_checkin: string;
  staff_checkout?: string;
  created_at: string;
  updated_at: string;
  hotel_reservations: {
    guest_name: string;
    guest_email: string;
    hotel_rooms: {
      room_number: string;
      room_type: string;
    };
  };
}

export default function Checkins() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadCheckins();
  }, []);

  const loadCheckins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hotel_checkins')
        .select(`
          *,
          hotel_reservations (
            guest_name,
            guest_email,
            hotel_rooms (
              room_number,
              room_type
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Error loading checkins:', error);
      toast.error('Erro ao carregar check-ins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheckin = async (data: CheckinFormData) => {
    try {
      const { error } = await supabase
        .from('hotel_checkins')
        .insert([data]);

      if (error) throw error;

      toast.success('Check-in realizado com sucesso!');
      setShowForm(false);
      loadCheckins();
    } catch (error) {
      console.error('Error creating checkin:', error);
      toast.error('Erro ao realizar check-in');
    }
  };

  const handleUpdateCheckin = async (data: CheckinFormData) => {
    if (!editingCheckin) return;

    try {
      const { error } = await supabase
        .from('hotel_checkins')
        .update(data)
        .eq('id', editingCheckin.id);

      if (error) throw error;

      toast.success('Check-in atualizado com sucesso!');
      setEditingCheckin(null);
      setShowForm(false);
      loadCheckins();
    } catch (error) {
      console.error('Error updating checkin:', error);
      toast.error('Erro ao atualizar check-in');
    }
  };

  const handleDeleteCheckin = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este check-in?')) return;

    try {
      const { error } = await supabase
        .from('hotel_checkins')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Check-in excluído com sucesso!');
      loadCheckins();
    } catch (error) {
      console.error('Error deleting checkin:', error);
      toast.error('Erro ao excluir check-in');
    }
  };

  const filteredCheckins = checkins.filter(checkin => {
    const matchesSearch = 
      checkin.hotel_reservations.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkin.hotel_reservations.hotel_rooms.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkin.staff_checkin.toLowerCase().includes(searchTerm.toLowerCase());

    const now = new Date();
    const checkoutDate = new Date(checkin.checkout_datetime);
    const isActive = checkoutDate > now;
    const isCompleted = checkoutDate <= now;

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && isActive) ||
      (filterStatus === 'completed' && isCompleted);

    return matchesSearch && matchesFilter;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (checkin: Checkin) => {
    const now = new Date();
    const checkoutDate = new Date(checkin.checkout_datetime);
    const isActive = checkoutDate > now;

    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Ativo' : 'Finalizado'}
      </Badge>
    );
  };

  const getRoomConditionBadge = (condition?: string) => {
    if (!condition) return null;
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      excellent: 'default',
      good: 'secondary',
      fair: 'outline',
      poor: 'destructive'
    };

    const labels: Record<string, string> = {
      excellent: 'Excelente',
      good: 'Boa',
      fair: 'Regular',
      poor: 'Ruim'
    };

    return (
      <Badge variant={variants[condition] || 'outline'}>
        {labels[condition] || condition}
      </Badge>
    );
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <CheckinForm
          checkin={editingCheckin}
          onSubmit={editingCheckin ? handleUpdateCheckin : handleCreateCheckin}
          onCancel={() => {
            setShowForm(false);
            setEditingCheckin(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Check-ins</h1>
          <p className="text-gray-600">Gerencie os check-ins e check-outs do hotel</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Check-in
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por hóspede, quarto ou funcionário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                <Filter className="mr-2 h-4 w-4" />
                Todos
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Ativos
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
                size="sm"
              >
                Finalizados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkins List */}
      {loading ? (
        <div className="text-center py-8">
          <p>Carregando check-ins...</p>
        </div>
      ) : filteredCheckins.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum check-in encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro check-in'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Check-in
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCheckins.map((checkin) => (
            <Card key={checkin.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {checkin.hotel_reservations.guest_name}
                      {getStatusBadge(checkin)}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Quarto {checkin.hotel_reservations.hotel_rooms.room_number} - {checkin.hotel_reservations.hotel_rooms.room_type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCheckin(checkin);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCheckin(checkin.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Check-in</p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(checkin.checkin_datetime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Check-out Previsto</p>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(checkin.checkout_datetime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hóspedes</p>
                    <p>{checkin.actual_guests}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Funcionário</p>
                    <p>{checkin.staff_checkin}</p>
                  </div>
                </div>

                {checkin.room_condition_checkin && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Condição do Quarto</p>
                    {getRoomConditionBadge(checkin.room_condition_checkin)}
                  </div>
                )}

                {checkin.additional_charges > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Encargos Adicionais</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(checkin.additional_charges)}
                    </p>
                  </div>
                )}

                {(checkin.checkin_notes || checkin.damages_reported) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Observações</p>
                    {checkin.checkin_notes && (
                      <p className="text-sm bg-blue-50 p-2 rounded mb-2">
                        <strong>Check-in:</strong> {checkin.checkin_notes}
                      </p>
                    )}
                    {checkin.damages_reported && (
                      <p className="text-sm bg-red-50 p-2 rounded">
                        <strong>Danos:</strong> {checkin.damages_reported}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}