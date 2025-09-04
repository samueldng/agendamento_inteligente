import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';
import { hotelRoomSchema } from '../../lib/validations';
import type { z } from 'zod';
import type { Database } from '../../lib/supabase';

type BaseHotelRoom = Database['public']['Tables']['hotel_rooms']['Row'];
type HotelRoomFormData = z.infer<typeof hotelRoomSchema>;

// Extended type with calculated status
interface HotelRoom extends BaseHotelRoom {
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
}

interface RoomFormProps {
  room?: HotelRoom;
  onSubmit: (data: Omit<HotelRoomFormData, 'status'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function RoomForm({ room, onSubmit, onCancel, loading = false }: RoomFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HotelRoomFormData>({
    resolver: zodResolver(hotelRoomSchema),
    defaultValues: {
      room_number: room?.room_number || '',
      room_type: room?.room_type || 'single',
      status: room?.status || 'available',
      capacity: room?.capacity || 1,
      base_price: room?.base_price || 0,
      description: room?.description || '',
      amenities: room?.amenities || [],
      is_active: room?.is_active ?? true,
    },
  });

  const watchedStatus = watch('status');
  const watchedRoomType = watch('room_type');

  const handleFormSubmit = async (data: HotelRoomFormData) => {
    try {
      console.log('📝 [RoomForm] Iniciando submissão do formulário');
      console.log('📝 [RoomForm] Dados do formulário:', data);
      setIsSubmitting(true);
      
      const { status, ...roomData } = data;

      console.log('🏨 Enviando dados do quarto:', roomData);
      console.log('✅ [RoomForm] Validação passou, enviando dados...');

      await onSubmit(roomData);
      
      console.log('✅ [RoomForm] Quarto salvo com sucesso!');
      onCancel();
    } catch (error) {
      console.error('❌ [RoomForm] Erro ao salvar quarto:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const amenitiesOptions = [
    'Wi-Fi',
    'TV',
    'Ar Condicionado',
    'Frigobar',
    'Cofre',
    'Varanda',
    'Banheira',
    'Secador de Cabelo',
    'Telefone',
    'Serviço de Quarto',
  ];

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = watch('amenities') || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    setValue('amenities', newAmenities);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {room ? 'Editar Quarto' : 'Novo Quarto'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => {
          console.log('🔥 TESTE: Form onSubmit executado!');
          return handleFormSubmit(data);
        })} className="space-y-6">
          {/* Debug info */}
          <div className="hidden">
            {console.log('🏨 RoomForm - Renderizando formulário, errors:', errors)}
            {console.log('🏨 RoomForm - Form valid:', Object.keys(errors).length === 0)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Number */}
            <div className="space-y-2">
              <Label htmlFor="room_number">Número do Quarto *</Label>
              <Input
                id="room_number"
                {...register('room_number')}
                placeholder="Ex: 101"
                className={errors.room_number ? 'border-red-500' : ''}
              />
              {errors.room_number && (
                <p className="text-sm text-red-500">{errors.room_number.message}</p>
              )}
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <Label htmlFor="room_type">Tipo do Quarto *</Label>
              <Select
                value={watchedRoomType}
                onValueChange={(value) => setValue('room_type', value as any)}
              >
                <SelectTrigger className={errors.room_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Solteiro</SelectItem>
                  <SelectItem value="double">Casal</SelectItem>
                  <SelectItem value="suite">Suíte</SelectItem>
                  <SelectItem value="family">Família</SelectItem>
                </SelectContent>
              </Select>
              {errors.room_type && (
                <p className="text-sm text-red-500">{errors.room_type.message}</p>
              )}
            </div>

            {/* Status */}
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
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="occupied">Ocupado</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="cleaning">Limpeza</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade Máxima *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="10"
                {...register('capacity', { valueAsNumber: true })}
                className={errors.capacity ? 'border-red-500' : ''}
              />
              {errors.capacity && (
                <p className="text-sm text-red-500">{errors.capacity.message}</p>
              )}
            </div>

            {/* Base Price */}
            <div className="space-y-2">
              <Label htmlFor="base_price">Preço Base (R$) *</Label>
              <Input
                id="base_price"
                type="number"
                min="0"
                step="0.01"
                {...register('base_price', { valueAsNumber: true })}
                className={errors.base_price ? 'border-red-500' : ''}
              />
              {errors.base_price && (
                <p className="text-sm text-red-500">{errors.base_price.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descrição do quarto..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <Label>Comodidades</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {amenitiesOptions.map((amenity) => {
                const isSelected = watch('amenities')?.includes(amenity) || false;
                return (
                  <label
                    key={amenity}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

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
                room ? 'Atualizar' : 'Criar Quarto'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}