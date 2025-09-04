import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Calendar } from 'lucide-react';
import { hotelReservationSchema } from '../../lib/validations';
import { useHotelRooms } from '../../hooks/useHotel';
import type { z } from 'zod';
import type { Database } from '../../lib/supabase';

type HotelReservation = Database['public']['Tables']['hotel_reservations']['Row'];
type HotelRoom = Database['public']['Tables']['hotel_rooms']['Row'];
type HotelReservationFormData = z.infer<typeof hotelReservationSchema>;

interface ReservationFormProps {
  reservation?: HotelReservation & { hotel_rooms: HotelRoom };
  onSubmit: (data: HotelReservationFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ReservationForm({ reservation, onSubmit, onCancel, loading = false }: ReservationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<HotelRoom[]>([]);
  const { rooms, getAvailableRooms } = useHotelRooms();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HotelReservationFormData>({
    resolver: zodResolver(hotelReservationSchema),
    defaultValues: {
      guest_name: reservation?.guest_name || '',
      guest_email: reservation?.guest_email || '',
      guest_phone: reservation?.guest_phone || '',
      guest_document: reservation?.guest_document || '',
      room_id: reservation?.room_id || '',
      check_in_date: reservation?.check_in_date ? reservation.check_in_date.split('T')[0] : '',
      check_out_date: reservation?.check_out_date ? reservation.check_out_date.split('T')[0] : '',
      guests_count: reservation?.guests_count || 1,
      total_amount: reservation?.total_amount || 0,
      status: reservation?.status || 'confirmed',
      special_requests: reservation?.special_requests || '',
    },
  });

  const watchedCheckIn = watch('check_in_date');
  const watchedCheckOut = watch('check_out_date');
  const watchedRoomId = watch('room_id');
  const watchedStatus = watch('status');

  // Calculate total amount when dates or room changes
  useEffect(() => {
    const calculateTotal = () => {
      if (watchedCheckIn && watchedCheckOut && watchedRoomId) {
        const checkIn = new Date(watchedCheckIn);
        const checkOut = new Date(watchedCheckOut);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        
        const selectedRoom = rooms.find(room => room.id === watchedRoomId);
        if (selectedRoom && nights > 0) {
          const total = nights * (selectedRoom.base_price || 0);
          setValue('total_amount', total);
        }
      }
    };

    calculateTotal();
  }, [watchedCheckIn, watchedCheckOut, watchedRoomId, rooms, setValue]);

  // Get available rooms when dates change
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (watchedCheckIn && watchedCheckOut) {
        try {
          const available = await getAvailableRooms(watchedCheckIn, watchedCheckOut);
          setAvailableRooms(available);
        } catch (error) {
          console.error('Erro ao buscar quartos disponíveis:', error);
          setAvailableRooms([]);
        }
      } else {
        setAvailableRooms(rooms.filter(room => room.status === 'available'));
      }
    };

    fetchAvailableRooms();
  }, [watchedCheckIn, watchedCheckOut, getAvailableRooms, rooms]);

  const handleFormSubmit = async (data: HotelReservationFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {reservation ? 'Editar Reserva' : 'Nova Reserva'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações do Hóspede</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest_name">Nome Completo *</Label>
                <Input
                  id="guest_name"
                  {...register('guest_name')}
                  placeholder="Nome do hóspede"
                  className={errors.guest_name ? 'border-red-500' : ''}
                />
                {errors.guest_name && (
                  <p className="text-sm text-red-500">{errors.guest_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest_email">E-mail *</Label>
                <Input
                  id="guest_email"
                  type="email"
                  {...register('guest_email')}
                  placeholder="email@exemplo.com"
                  className={errors.guest_email ? 'border-red-500' : ''}
                />
                {errors.guest_email && (
                  <p className="text-sm text-red-500">{errors.guest_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest_phone">Telefone *</Label>
                <Input
                  id="guest_phone"
                  {...register('guest_phone')}
                  placeholder="(11) 99999-9999"
                  className={errors.guest_phone ? 'border-red-500' : ''}
                />
                {errors.guest_phone && (
                  <p className="text-sm text-red-500">{errors.guest_phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest_document">Documento *</Label>
                <Input
                  id="guest_document"
                  {...register('guest_document')}
                  placeholder="CPF ou RG"
                  className={errors.guest_document ? 'border-red-500' : ''}
                />
                {errors.guest_document && (
                  <p className="text-sm text-red-500">{errors.guest_document.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalhes da Reserva</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in_date">Data de Check-in *</Label>
                <div className="relative">
                  <Input
                    id="check_in_date"
                    type="date"
                    min={today}
                    {...register('check_in_date')}
                    className={errors.check_in_date ? 'border-red-500' : ''}
                  />
                  <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.check_in_date && (
                  <p className="text-sm text-red-500">{errors.check_in_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="check_out_date">Data de Check-out *</Label>
                <div className="relative">
                  <Input
                    id="check_out_date"
                    type="date"
                    min={watchedCheckIn || today}
                    {...register('check_out_date')}
                    className={errors.check_out_date ? 'border-red-500' : ''}
                  />
                  <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.check_out_date && (
                  <p className="text-sm text-red-500">{errors.check_out_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests_count">Número de Hóspedes *</Label>
                <Input
                  id="guests_count"
                  type="number"
                  min="1"
                  max="10"
                  {...register('guests_count', { valueAsNumber: true })}
                  className={errors.guests_count ? 'border-red-500' : ''}
                />
                {errors.guests_count && (
                  <p className="text-sm text-red-500">{errors.guests_count.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_id">Quarto *</Label>
                <Select
                  value={watchedRoomId}
                  onValueChange={(value) => setValue('room_id', value)}
                >
                  <SelectTrigger className={errors.room_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione um quarto" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Quarto {room.room_number} - {room.room_type} ({formatCurrency(room.base_price || 0)}/noite)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.room_id && (
                  <p className="text-sm text-red-500">{errors.room_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={watchedStatus}
                  onValueChange={(value) => setValue('status', value as any)}
                >
                  <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="checked_in">Check-in Realizado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_amount">Valor Total (R$) *</Label>
                <Input
                  id="total_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('total_amount', { valueAsNumber: true })}
                  className={errors.total_amount ? 'border-red-500' : ''}
                  readOnly
                />
                {errors.total_amount && (
                  <p className="text-sm text-red-500">{errors.total_amount.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="special_requests">Solicitações Especiais</Label>
            <Textarea
              id="special_requests"
              {...register('special_requests')}
              placeholder="Solicitações especiais do hóspede..."
              rows={3}
              className={errors.special_requests ? 'border-red-500' : ''}
            />
            {errors.special_requests && (
              <p className="text-sm text-red-500">{errors.special_requests.message}</p>
            )}
          </div>

          {/* Summary */}
          {watchedCheckIn && watchedCheckOut && watchedRoomId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumo da Reserva</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Check-in:</span>
                <span>{new Date(watchedCheckIn).toLocaleDateString('pt-BR')}</span>
                <span>Check-out:</span>
                <span>{new Date(watchedCheckOut).toLocaleDateString('pt-BR')}</span>
                <span>Noites:</span>
                <span>
                  {Math.ceil((new Date(watchedCheckOut).getTime() - new Date(watchedCheckIn).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">{formatCurrency(watch('total_amount') || 0)}</span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="min-w-[120px]"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                reservation ? 'Atualizar' : 'Criar Reserva'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}