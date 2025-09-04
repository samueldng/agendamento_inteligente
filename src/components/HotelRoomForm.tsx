import React, { useState, useEffect } from 'react';
import { Bed, Wifi, Car, Coffee, Tv, Wind, Users } from 'lucide-react';
import { Button } from './ui/button';
import { FormField } from './ui/form-field';
import Modal from './Modal';
import { toast } from 'sonner';
import { roomsApi } from '../lib/api/hotel';
import { useFormSubmission } from '../hooks/useAsyncOperation';
import { ButtonSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorBoundary';
import { hotelRoomSchema, type HotelRoomFormData } from '../lib/validations/hotel';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface HotelRoom {
  id?: string;
  professional_id?: string;
  room_number: string;
  room_type: 'single' | 'double' | 'suite' | 'family';
  capacity: number;
  base_price: number;
  amenities?: string[];
  description?: string;
  is_active?: boolean;
}

interface HotelRoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (room: Omit<HotelRoom, 'id'>) => Promise<void>;
  room?: HotelRoom;
  professionalId: string;
}

const roomTypes = [
  { value: 'single', label: 'Quarto Single' },
  { value: 'double', label: 'Quarto Duplo' },
  { value: 'suite', label: 'Suíte' },
  { value: 'family', label: 'Quarto Família' }
];

// Status options removed as they're not part of the room schema

const amenityOptions = [
  { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { value: 'parking', label: 'Estacionamento', icon: Car },
  { value: 'breakfast', label: 'Café da Manhã', icon: Coffee },
  { value: 'tv', label: 'TV', icon: Tv },
  { value: 'ac', label: 'Ar Condicionado', icon: Wind },
  { value: 'minibar', label: 'Frigobar', icon: Coffee }
];

export default function HotelRoomForm({ isOpen, onClose, onSubmit, room, professionalId }: HotelRoomFormProps) {
  const { execute: submitForm, loading: isSubmitting, error: submitError } = useFormSubmission();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors: formErrors },
    reset
  } = useForm<HotelRoomFormData>({
    resolver: zodResolver(hotelRoomSchema),
    defaultValues: {
      room_number: '',
      room_type: 'single',
      capacity: 1,
      base_price: 0,
      amenities: [],
      description: '',
      is_active: true
    }
  });

  const formData = watch();

  useEffect(() => {
    if (room) {
      reset({
        room_number: room.room_number,
        room_type: room.room_type,
        capacity: room.capacity,
        base_price: room.base_price,
        amenities: room.amenities || [],
        description: room.description || '',
        is_active: room.is_active ?? true
      });
    } else {
      reset({
        room_number: '',
        room_type: 'single',
        capacity: 1,
        base_price: 0,
        amenities: [],
        description: '',
        is_active: true
      });
    }
    setErrors({});
  }, [room, professionalId, isOpen, reset]);



  const onFormSubmit = async (data: HotelRoomFormData) => {
    console.log('🏨 HotelRoomForm onFormSubmit called with data:', data);
    console.log('🏨 Professional ID:', professionalId);
    console.log('🏨 Room (editing):', room);
    
    await submitForm(async () => {
      if (room?.id) {
        // Update existing room
        console.log('🏨 Updating room with ID:', room.id);
        const updatedRoom = await roomsApi.update(room.id, data);
        console.log('🏨 Room updated successfully:', updatedRoom);
        toast.success('Quarto atualizado com sucesso!');
        onSubmit(updatedRoom);
      } else {
        // Create new room - include professional_id
        const roomData = {
          ...data,
          professional_id: professionalId
        };
        console.log('🏨 Creating new room with data:', roomData);
        const newRoom = await roomsApi.create(roomData);
        console.log('🏨 Room created successfully:', newRoom);
        toast.success('Quarto criado com sucesso!');
        onSubmit(newRoom);
      }
      onClose();
    }, {
      successMessage: room ? 'Quarto atualizado com sucesso!' : 'Quarto criado com sucesso!',
      errorMessage: 'Erro ao salvar quarto'
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    setValue('amenities', newAmenities);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={room ? 'Editar Quarto' : 'Novo Quarto'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {submitError && (
          <ErrorDisplay error={submitError} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Número do Quarto"
            error={errors.room_number}
            required
          >
            <input
              type="text"
              {...register('room_number')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 101, 201A"
            />
            {formErrors.room_number && (
              <p className="text-sm text-red-600">{formErrors.room_number.message}</p>
            )}
          </FormField>

          <FormField label="Tipo de Quarto" required>
            <select
              {...register('room_type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {formErrors.room_type && (
              <p className="text-sm text-red-600">{formErrors.room_type.message}</p>
            )}
          </FormField>

          <FormField
            label="Capacidade"
            error={errors.capacity}
            required
          >
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                min="1"
                max="10"
                {...register('capacity', { valueAsNumber: true })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {formErrors.capacity && (
              <p className="text-sm text-red-600">{formErrors.capacity.message}</p>
            )}
          </FormField>

          <FormField
            label="Preço por Noite (R$)"
            error={formErrors.base_price?.message}
            required
          >
            <input
              type="number"
              min="0"
              step="0.01"
              {...register('base_price', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            {formErrors.base_price && (
              <p className="text-sm text-red-600">{formErrors.base_price.message}</p>
            )}
          </FormField>

          <FormField label="Ativo">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('is_active')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Quarto ativo</span>
            </label>
            {formErrors.is_active && (
              <p className="text-sm text-red-600">{formErrors.is_active.message}</p>
            )}
          </FormField>
        </div>

        <FormField label="Comodidades">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenityOptions.map(amenity => {
              const Icon = amenity.icon;
              const isSelected = (formData.amenities || []).includes(amenity.value);
              
              return (
                <button
                  key={amenity.value}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity.value)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{amenity.label}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label="Descrição">
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descrição adicional do quarto..."
          />
          {formErrors.description && (
            <p className="text-sm text-red-600">{formErrors.description.message}</p>
          )}
        </FormField>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting && <ButtonSpinner size="xs" />}
            {room ? 'Atualizar' : 'Criar'} Quarto
          </Button>
        </div>
      </form>
    </Modal>
  );
}