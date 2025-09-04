import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Plus, Minus } from 'lucide-react';
import { hotelConsumptionSchema } from '../../lib/validations';
import { useHotelReservations, useHotelConsumptionItems } from '../../hooks/useHotel';
import type { z } from 'zod';
import type { Database } from '../../lib/supabase';

type HotelConsumption = Database['public']['Tables']['hotel_consumption']['Row'];
type HotelConsumptionItem = Database['public']['Tables']['hotel_consumption_items']['Row'];
type HotelReservation = Database['public']['Tables']['hotel_reservations']['Row'];
type HotelConsumptionFormData = z.infer<typeof hotelConsumptionSchema>;

interface ConsumptionFormProps {
  consumption?: HotelConsumption;
  onSubmit: (data: HotelConsumptionFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ConsumptionForm({ consumption, onSubmit, onCancel, loading = false }: ConsumptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { reservations } = useHotelReservations();
  const { items } = useHotelConsumptionItems();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HotelConsumptionFormData>({
    resolver: zodResolver(hotelConsumptionSchema),
    defaultValues: {
      reservation_id: consumption?.reservation_id || '',
      item_id: consumption?.item_id || '',
      quantity: consumption?.quantity || 1,
      unit_price: consumption?.unit_price || 0,
      total_price: consumption?.total_price || 0,
      consumed_at: consumption?.consumed_at ? 
        new Date(consumption.consumed_at).toISOString().slice(0, 16) : 
        new Date().toISOString().slice(0, 16),
      notes: consumption?.notes || '',
    },
  });

  const watchedReservationId = watch('reservation_id');
  const watchedItemId = watch('item_id');
  const watchedQuantity = watch('quantity');

  // Calculate total price when item or quantity changes
  useEffect(() => {
    if (watchedItemId && watchedQuantity) {
      const selectedItem = items.find(item => item.id === watchedItemId);
      if (selectedItem) {
        const unitPrice = selectedItem.price || 0;
        const totalPrice = unitPrice * watchedQuantity;
        setValue('unit_price', unitPrice);
        setValue('total_price', totalPrice);
      }
    }
  }, [watchedItemId, watchedQuantity, items, setValue]);

  const handleFormSubmit = async (data: HotelConsumptionFormData) => {
    try {
      setIsSubmitting(true);
      // Convert datetime-local to ISO string
      const formattedData = {
        ...data,
        consumed_at: data.consumed_at ? new Date(data.consumed_at).toISOString() : new Date().toISOString(),
      };
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Erro ao salvar consumo:', error);
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

  // Filter reservations that are checked in
  const checkedInReservations = reservations.filter(r => r.status === 'checked_in');
  const selectedReservation = reservations.find(r => r.id === watchedReservationId);
  const selectedItem = items.find(item => item.id === watchedItemId);

  const adjustQuantity = (delta: number) => {
    const currentQuantity = watchedQuantity || 1;
    const newQuantity = Math.max(1, currentQuantity + delta);
    setValue('quantity', newQuantity);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {consumption ? 'Editar Consumo' : 'Novo Consumo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Reservation Selection */}
          <div className="space-y-2">
            <Label htmlFor="reservation_id">Reserva *</Label>
            <Select
              value={watchedReservationId}
              onValueChange={(value) => setValue('reservation_id', value)}
            >
              <SelectTrigger className={errors.reservation_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma reserva" />
              </SelectTrigger>
              <SelectContent>
                {checkedInReservations.map((reservation) => (
                  <SelectItem key={reservation.id} value={reservation.id}>
                    {reservation.guest_name} - Quarto {reservation.hotel_rooms?.room_number}
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
                <span>Quarto:</span>
                <span>{selectedReservation.hotel_rooms?.room_number}</span>
                <span>Check-in:</span>
                <span>{formatDateTime(selectedReservation.check_in_date)}</span>
              </div>
            </div>
          )}

          {/* Item Selection */}
          <div className="space-y-2">
            <Label htmlFor="item_id">Item *</Label>
            <Select
              value={watchedItemId}
              onValueChange={(value) => setValue('item_id', value)}
            >
              <SelectTrigger className={errors.item_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione um item" />
              </SelectTrigger>
              <SelectContent>
                {items.filter(item => item.is_active).map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {formatCurrency(item.price || 0)} ({item.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.item_id && (
              <p className="text-sm text-red-500">{errors.item_id.message}</p>
            )}
          </div>

          {/* Item Details */}
          {selectedItem && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Detalhes do Item</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Nome:</span>
                <span>{selectedItem.name}</span>
                <span>Categoria:</span>
                <span>{selectedItem.category}</span>
                <span>Preço unitário:</span>
                <span>{formatCurrency(selectedItem.price || 0)}</span>
                {selectedItem.description && (
                  <>
                    <span>Descrição:</span>
                    <span>{selectedItem.description}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustQuantity(-1)}
                disabled={watchedQuantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register('quantity', { valueAsNumber: true })}
                className={`text-center ${errors.quantity ? 'border-red-500' : ''}`}
                style={{ width: '80px' }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustQuantity(1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_price">Preço Unitário (R$)</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                {...register('unit_price', { valueAsNumber: true })}
                className={errors.unit_price ? 'border-red-500' : ''}
                readOnly
              />
              {errors.unit_price && (
                <p className="text-sm text-red-500">{errors.unit_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_price">Preço Total (R$)</Label>
              <Input
                id="total_price"
                type="number"
                min="0"
                step="0.01"
                {...register('total_price', { valueAsNumber: true })}
                className={errors.total_price ? 'border-red-500' : ''}
                readOnly
              />
              {errors.total_price && (
                <p className="text-sm text-red-500">{errors.total_price.message}</p>
              )}
            </div>
          </div>

          {/* Consumed At */}
          <div className="space-y-2">
            <Label htmlFor="consumed_at">Data/Hora do Consumo</Label>
            <Input
              id="consumed_at"
              type="datetime-local"
              {...register('consumed_at')}
              className={errors.consumed_at ? 'border-red-500' : ''}
            />
            {errors.consumed_at && (
              <p className="text-sm text-red-500">{errors.consumed_at.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações sobre o consumo..."
              rows={3}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Summary */}
          {watchedItemId && watchedQuantity && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumo</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Item:</span>
                <span>{selectedItem?.name}</span>
                <span>Quantidade:</span>
                <span>{watchedQuantity}</span>
                <span>Preço unitário:</span>
                <span>{formatCurrency(watch('unit_price') || 0)}</span>
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">{formatCurrency(watch('total_price') || 0)}</span>
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
                consumption ? 'Atualizar' : 'Adicionar Consumo'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}