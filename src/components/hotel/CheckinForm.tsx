import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Calendar, Clock } from 'lucide-react';
import { hotelCheckinSchema } from '../../lib/validations';
import { useHotelReservations, useHotelConsumption } from '../../hooks/useHotel';
import type { z } from 'zod';
import type { Database } from '../../lib/supabase';

type HotelCheckin = Database['public']['Tables']['hotel_checkins']['Row'];
type HotelReservation = Database['public']['Tables']['hotel_reservations']['Row'];
type HotelRoom = Database['public']['Tables']['hotel_rooms']['Row'];
type HotelCheckinFormData = z.infer<typeof hotelCheckinSchema>;

interface CheckinFormProps {
  checkin?: HotelCheckin & { hotel_reservations: HotelReservation & { hotel_rooms: HotelRoom } };
  onSubmit: (data: HotelCheckinFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CheckinForm({ checkin, onSubmit, onCancel, loading = false }: CheckinFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consumptionTotal, setConsumptionTotal] = useState(0);
  const { reservations } = useHotelReservations();
  const { getTotalAmount } = useHotelConsumption();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HotelCheckinFormData>({
    resolver: zodResolver(hotelCheckinSchema),
    defaultValues: {
      reservation_id: checkin?.reservation_id || '',
      checkin_datetime: checkin?.checkin_datetime ? 
        new Date(checkin.checkin_datetime).toISOString().slice(0, 16) : 
        new Date().toISOString().slice(0, 16),
      checkout_datetime: checkin?.checkout_datetime ? 
        new Date(checkin.checkout_datetime).toISOString().slice(0, 16) : '',
      actual_guests: checkin?.actual_guests || 1,
      checkin_notes: checkin?.checkin_notes || '',
      checkout_notes: checkin?.checkout_notes || '',
      room_condition_checkin: checkin?.room_condition_checkin || '',
      room_condition_checkout: checkin?.room_condition_checkout || '',
      damages_reported: checkin?.damages_reported || '',
      additional_charges: checkin?.additional_charges || 0,
      payment_method: checkin?.payment_method || '',
      staff_checkin: checkin?.staff_checkin || '',
      staff_checkout: checkin?.staff_checkout || '',
    },
  });

  const watchedReservationId = watch('reservation_id');
  const watchedCheckoutDatetime = watch('checkout_datetime');
  const watchedAdditionalCharges = watch('additional_charges');

  // Get consumption total when checkin ID changes
  useEffect(() => {
    const fetchConsumptionTotal = async () => {
      if (checkin?.id) {
        try {
          const total = await getTotalAmount(checkin.id);
          setConsumptionTotal(total);
          // Update additional charges with consumption
          const totalCharges = (watchedAdditionalCharges || 0) + total;
          setValue('additional_charges', totalCharges);
        } catch (error) {
          console.error('Erro ao buscar total de consumo:', error);
        }
      }
    };

    fetchConsumptionTotal();
  }, [checkin?.id, getTotalAmount, watchedAdditionalCharges, setValue]);

  // Set values based on selected reservation
  useEffect(() => {
    if (watchedReservationId) {
      const selectedReservation = reservations.find(r => r.id === watchedReservationId);
      if (selectedReservation) {
        setValue('actual_guests', selectedReservation.num_guests || 1);
        setValue('staff_checkin', 'Sistema');
      }
    }
  }, [watchedReservationId, reservations, setValue]);

  const handleFormSubmit = async (data: HotelCheckinFormData) => {
    try {
      setIsSubmitting(true);
      // Convert datetime-local to ISO string
      const formattedData = {
        ...data,
        checkin_datetime: data.checkin_datetime ? new Date(data.checkin_datetime).toISOString() : new Date().toISOString(),
        checkout_datetime: data.checkout_datetime ? new Date(data.checkout_datetime).toISOString() : null,
      };
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Erro ao salvar check-in:', error);
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Filter reservations that are confirmed and not yet checked in
  const availableReservations = reservations.filter(r => 
    r.status === 'confirmed' || (checkin && r.id === checkin.reservation_id)
  );

  const selectedReservation = reservations.find(r => r.id === watchedReservationId);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {checkin ? 'Editar Check-in' : 'Novo Check-in'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Reservation Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reserva</h3>
            <div className="space-y-2">
              <Label htmlFor="reservation_id">Reserva *</Label>
              <Select
                value={watchedReservationId}
                onValueChange={(value) => setValue('reservation_id', value)}
                disabled={!!checkin} // Disable if editing existing checkin
              >
                <SelectTrigger className={errors.reservation_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma reserva" />
                </SelectTrigger>
                <SelectContent>
                  {availableReservations.map((reservation) => (
                    <SelectItem key={reservation.id} value={reservation.id}>
                      {reservation.guest_name} - Quarto {reservation.hotel_rooms.room_number} 
                      ({formatDateTime(reservation.check_in_date)} - {formatDateTime(reservation.check_out_date)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reservation_id && (
                <p className="text-sm text-red-500">{errors.reservation_id.message}</p>
              )}
            </div>

            {/* Reservation Details */}
            {selectedReservation && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Detalhes da Reserva</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Hóspede:</span>
                  <span>{selectedReservation.guest_name}</span>
                  <span>E-mail:</span>
                  <span>{selectedReservation.guest_email}</span>
                  <span>Telefone:</span>
                  <span>{selectedReservation.guest_phone}</span>
                  <span>Quarto:</span>
                  <span>{selectedReservation.hotel_rooms.room_number} - {selectedReservation.hotel_rooms.room_type}</span>
                  <span>Check-in previsto:</span>
                  <span>{formatDateTime(selectedReservation.check_in_date)}</span>
                  <span>Check-out previsto:</span>
                  <span>{formatDateTime(selectedReservation.check_out_date)}</span>
                  <span>Valor da reserva:</span>
                  <span>{formatCurrency(selectedReservation.total_amount || 0)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Check-in Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalhes do Check-in</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkin_datetime">Check-in Realizado *</Label>
                <div className="relative">
                  <Input
                    id="checkin_datetime"
                    type="datetime-local"
                    {...register('checkin_datetime')}
                    className={errors.checkin_datetime ? 'border-red-500' : ''}
                  />
                  <Clock className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.checkin_datetime && (
                  <p className="text-sm text-red-500">{errors.checkin_datetime.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout_datetime">Check-out Previsto *</Label>
                <div className="relative">
                  <Input
                    id="checkout_datetime"
                    type="datetime-local"
                    {...register('checkout_datetime')}
                    className={errors.checkout_datetime ? 'border-red-500' : ''}
                  />
                  <Clock className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.checkout_datetime && (
                  <p className="text-sm text-red-500">{errors.checkout_datetime.message}</p>
                )}
              </div>



              <div className="space-y-2">
                <Label htmlFor="actual_guests">Número de Hóspedes *</Label>
                <Input
                  id="actual_guests"
                  type="number"
                  min="1"
                  max="10"
                  {...register('actual_guests', { valueAsNumber: true })}
                  className={errors.actual_guests ? 'border-red-500' : ''}
                />
                {errors.actual_guests && (
                  <p className="text-sm text-red-500">{errors.actual_guests.message}</p>
                )}
              </div>


            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalhes Financeiros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="additional_charges">Encargos Adicionais (R$)</Label>
                <Input
                  id="additional_charges"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('additional_charges', { valueAsNumber: true })}
                  className={errors.additional_charges ? 'border-red-500' : ''}
                />
                {errors.additional_charges && (
                  <p className="text-sm text-red-500">{errors.additional_charges.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Método de Pagamento</Label>
                <Select
                  value={watch('payment_method') || ''}
                  onValueChange={(value) => setValue('payment_method', value)}
                >
                  <SelectTrigger className={errors.payment_method ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-sm text-red-500">{errors.payment_method.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff_checkin">Funcionário Responsável *</Label>
                <Input
                  id="staff_checkin"
                  type="text"
                  {...register('staff_checkin')}
                  placeholder="Nome do funcionário"
                  className={errors.staff_checkin ? 'border-red-500' : ''}
                />
                {errors.staff_checkin && (
                  <p className="text-sm text-red-500">{errors.staff_checkin.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações sobre o check-in..."
              rows={3}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Summary */}
          {watchedReservationId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumo Financeiro</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Valor da reserva:</span>
                <span>{formatCurrency(watch('total_amount') || 0)}</span>
                <span>Consumo adicional:</span>
                <span>{formatCurrency(consumptionTotal)}</span>
                <span className="font-semibold text-lg">Total a pagar:</span>
                <span className="font-semibold text-lg">{formatCurrency(watch('final_amount') || 0)}</span>
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
                checkin ? 'Atualizar' : 'Realizar Check-in'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}