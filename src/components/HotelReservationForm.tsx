import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Users, Mail, Phone, DollarSign, User, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Modal from './Modal';
import { Button } from './ui/button';
import { FormField } from './ui/FormField';
import LoadingSpinner from './LoadingSpinner';
import { ErrorDisplay } from './ErrorBoundary';
import { ButtonSpinner } from './ui/ButtonSpinner';
import { useFormSubmission, useDataFetching } from '../hooks/useAsyncOperation';
import { roomsApi, reservationsApi } from '../lib/api/hotel';
import { hotelReservationSchema, type HotelReservationFormData } from '../lib/validations/hotel';
import type { HotelReservation, HotelRoom } from '../types/hotel';



interface HotelReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reservation: Omit<HotelReservation, 'id'>) => Promise<void>;
  reservation?: HotelReservation;
  professionalId: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pendente', color: 'text-yellow-600' },
  { value: 'confirmed', label: 'Confirmada', color: 'text-green-600' },
  { value: 'cancelled', label: 'Cancelada', color: 'text-red-600' },
  { value: 'completed', label: 'Concluída', color: 'text-blue-600' }
];

export default function HotelReservationForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  reservation, 
  professionalId 
}: HotelReservationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<HotelReservationFormData>({
    resolver: zodResolver(hotelReservationSchema),
    defaultValues: {
      professional_id: professionalId,
      room_id: '',
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      guest_document: '',
      check_in_date: '',
      check_out_date: '',
      guests_count: 1,
      total_amount: 0,
      status: 'pending',
      special_requests: ''
    }
  });
  const { execute: submitForm, loading: isSubmitting, error: submitError } = useFormSubmission();
  const { data: availableRooms, loading: loadingRooms, error: roomsError, execute: fetchRooms } = useDataFetching<HotelRoom[]>([]);
  
  const watchedFields = watch(['check_in_date', 'check_out_date', 'room_id']);
  const [checkInDate, checkOutDate, roomId] = watchedFields;

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    if (reservation) {
      reset({
        professional_id: reservation.professional_id,
        room_id: reservation.room_id,
        guest_name: reservation.guest_name,
        guest_email: reservation.guest_email,
        guest_phone: reservation.guest_phone,
        guest_document: reservation.guest_document,
        check_in_date: reservation.check_in_date.split('T')[0],
        check_out_date: reservation.check_out_date.split('T')[0],
        guests_count: reservation.guests_count,
        total_amount: reservation.total_amount,
        status: reservation.status,
        special_requests: reservation.special_requests || ''
      });
    } else {
      reset({
        professional_id: professionalId,
        room_id: '',
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_document: '',
        check_in_date: '',
        check_out_date: '',
        guests_count: 1,
        total_amount: 0,
        status: 'pending',
        special_requests: ''
      });
    }
  }, [reservation, professionalId, isOpen, reset]);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      checkAvailability();
    }
  }, [checkInDate, checkOutDate]);

  useEffect(() => {
    calculateTotal();
  }, [roomId, checkInDate, checkOutDate, availableRooms]);

  const checkAvailability = async () => {
    if (!checkInDate || !checkOutDate) return;
    
    await fetchRooms(async () => {
      return await roomsApi.getAvailable(checkInDate, checkOutDate);
    });
  };

  const calculateTotal = () => {
    if (!roomId || !checkInDate || !checkOutDate) {
      setValue('total_amount', 0);
      return;
    }

    const room = availableRooms.find(r => r.id === roomId);
    if (!room) return;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const total = nights * room.base_price;
    setValue('total_amount', total);
  };



  const onSubmitForm = async (data: HotelReservationFormData) => {
    console.log('🏨 HotelReservationForm onSubmitForm called with data:', data);
    console.log('🏨 Professional ID:', professionalId);
    console.log('🏨 Reservation (editing):', reservation);
    
    try {
      const reservationData = {
        ...data,
        check_in_date: data.check_in_date + 'T14:00:00.000Z',
        check_out_date: data.check_out_date + 'T12:00:00.000Z'
      };
      
      console.log('🏨 Reservation data to be sent:', reservationData);
      
      let result;
      if (reservation) {
        console.log('🏨 Updating reservation with ID:', reservation.id);
        result = await reservationsApi.update(reservation.id!, reservationData);
        console.log('🏨 Reservation updated successfully');
        toast.success('Reserva atualizada com sucesso!');
      } else {
        console.log('🏨 Creating new reservation');
        result = await reservationsApi.create(reservationData);
        console.log('🏨 Reservation created successfully');
        toast.success('Reserva criada com sucesso!');
      }
      
      onSubmit(result);
      onClose();
    } catch (error) {
      console.error('🏨 Erro ao salvar reserva:', error);
      toast.error('Erro ao salvar reserva');
    }
  };



  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reservation ? 'Editar Reserva' : 'Nova Reserva'}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {submitError && (
          <ErrorDisplay error={submitError} />
        )}
        
        {roomsError && (
          <ErrorDisplay error={roomsError} />
        )}
        
        {/* Dados do Hóspede */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Dados do Hóspede
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nome Completo"
              error={errors.guest_name?.message}
              required
            >
              <input
                type="text"
                {...register('guest_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do hóspede"
              />
            </FormField>

            <FormField
              label="Documento (CPF/RG)"
              error={errors.guest_document?.message}
              required
            >
              <input
                type="text"
                {...register('guest_document')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000.000.000-00"
              />
            </FormField>

            <FormField
              label="Email"
              error={errors.guest_email?.message}
              required
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  {...register('guest_email')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>
            </FormField>

            <FormField
              label="Telefone"
              error={errors.guest_phone?.message}
              required
            >
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  {...register('guest_phone')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Dados da Reserva */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Dados da Reserva
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              label="Check-in"
              error={errors.check_in_date?.message}
              required
            >
              <input
                type="date"
                {...register('check_in_date')}
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField
              label="Check-out"
              error={errors.check_out_date?.message}
              required
            >
              <input
                type="date"
                {...register('check_out_date')}
                min={checkInDate || tomorrow}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField
              label="Número de Hóspedes"
              error={errors.guests_count?.message}
              required
            >
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  min="1"
                  max="10"
                  {...register('guests_count', { valueAsNumber: true })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </FormField>

            <FormField
              label="Quarto"
              error={errors.room_id?.message}
              required
            >
              <select
                {...register('room_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingRooms || availableRooms.length === 0}
              >
                <option value="">Selecione um quarto</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id}>
                    Quarto {room.room_number} - {room.room_type} (R$ {room.base_price}/noite)
                  </option>
                ))}
              </select>
              {loadingRooms && (
                <p className="text-sm text-gray-500 mt-1">Verificando disponibilidade...</p>
              )}
              {!loadingRooms && availableRooms.length === 0 && checkInDate && checkOutDate && (
                <p className="text-sm text-red-500 mt-1">Nenhum quarto disponível para as datas selecionadas</p>
              )}
            </FormField>

            <FormField label="Status" error={errors.status?.message} required>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Valor Total">
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={`R$ ${watch('total_amount')?.toFixed(2) || '0.00'}`}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                />
              </div>
            </FormField>
          </div>
        </div>

        <FormField label="Solicitações Especiais">
          <textarea
            {...register('special_requests')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Solicitações especiais do hóspede..."
          />
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
            disabled={isSubmitting || availableRooms.length === 0}
            className="flex items-center gap-2"
          >
            {isSubmitting && <ButtonSpinner size="xs" />}
            {reservation ? 'Atualizar' : 'Criar'} Reserva
          </Button>
        </div>
      </form>
    </Modal>
  );
}