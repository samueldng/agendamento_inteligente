import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckinForm } from '@/components/hotel/CheckinForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
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
  hotel_reservations: {
    guest_name: string;
    hotel_rooms: {
      room_number: string;
      room_type: string;
    };
  };
}

export function CheckinPage() {
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

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

  const handleSubmit = async (data: CheckinFormData) => {
    try {
      setFormLoading(true);
      
      if (selectedCheckin) {
        // Update existing checkin
        const { error } = await supabase
          .from('hotel_checkins')
          .update(data)
          .eq('id', selectedCheckin.id);

        if (error) throw error;
        toast.success('Check-in atualizado com sucesso!');
      } else {
        // Create new checkin
        const { error } = await supabase
          .from('hotel_checkins')
          .insert([data]);

        if (error) throw error;
        toast.success('Check-in realizado com sucesso!');
      }

      setShowForm(false);
      setSelectedCheckin(null);
      loadCheckins();
    } catch (error) {
      console.error('Error saving checkin:', error);
      toast.error('Erro ao salvar check-in');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (checkin: Checkin) => {
    setSelectedCheckin(checkin);
    setShowForm(true);
  };

  const handleDelete = async (checkinId: string) => {
    if (!confirm('Tem certeza que deseja excluir este check-in?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('hotel_checkins')
        .delete()
        .eq('id', checkinId);

      if (error) throw error;
      toast.success('Check-in excluído com sucesso!');
      loadCheckins();
    } catch (error) {
      console.error('Error deleting checkin:', error);
      toast.error('Erro ao excluir check-in');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCheckin(null);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <CheckinForm
          checkin={selectedCheckin}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Check-ins</h1>
          <p className="text-gray-600 mt-2">Gerencie os check-ins e check-outs do hotel</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Check-in
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {checkins.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 text-lg mb-4">Nenhum check-in encontrado</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Realizar Primeiro Check-in
                </Button>
              </CardContent>
            </Card>
          ) : (
            checkins.map((checkin) => (
              <Card key={checkin.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {checkin.hotel_reservations.guest_name}
                      </CardTitle>
                      <p className="text-gray-600">
                        Quarto {checkin.hotel_reservations.hotel_rooms.room_number} - 
                        {checkin.hotel_reservations.hotel_rooms.room_type}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(checkin)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(checkin.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-semibold">{formatDateTime(checkin.checkin_datetime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out Previsto</p>
                      <p className="font-semibold">{formatDateTime(checkin.checkout_datetime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hóspedes</p>
                      <p className="font-semibold">{checkin.actual_guests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Funcionário</p>
                      <p className="font-semibold">{checkin.staff_checkin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Encargos Adicionais</p>
                      <p className="font-semibold">{formatCurrency(checkin.additional_charges)}</p>
                    </div>
                    {checkin.payment_method && (
                      <div>
                        <p className="text-sm text-gray-600">Método de Pagamento</p>
                        <p className="font-semibold">
                          {checkin.payment_method === 'cash' && 'Dinheiro'}
                          {checkin.payment_method === 'credit_card' && 'Cartão de Crédito'}
                          {checkin.payment_method === 'debit_card' && 'Cartão de Débito'}
                          {checkin.payment_method === 'pix' && 'PIX'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {checkin.checkin_notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Observações do Check-in</p>
                      <p className="text-sm bg-gray-50 p-2 rounded">{checkin.checkin_notes}</p>
                    </div>
                  )}
                  
                  {checkin.damages_reported && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Danos Reportados</p>
                      <p className="text-sm bg-red-50 p-2 rounded text-red-800">{checkin.damages_reported}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}