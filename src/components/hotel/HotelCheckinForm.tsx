import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, Users, FileText, AlertTriangle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useHotel } from '@/hooks/useHotel';
import { HotelReservation, HotelCheckin } from '@/types/hotel';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { hotelCheckinSchema, hotelCheckoutSchema, HotelCheckinFormData, HotelCheckoutFormData } from '@/lib/validations/hotel';

interface HotelCheckinFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  checkin?: any;
  mode: 'checkin' | 'checkout' | 'edit';
  reservation?: any;
}

const HotelCheckinForm: React.FC<HotelCheckinFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  checkin,
  mode,
  reservation
}) => {
  const [loading, setLoading] = useState(false);
  
  // Determine which schema to use based on mode
  const schema = mode === 'checkout' ? hotelCheckoutSchema : hotelCheckinSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<HotelCheckinFormData | HotelCheckoutFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reservation_id: checkin?.reservation_id || reservation?.id || '',
      actual_guests: checkin?.actual_guests || reservation?.guests_count || 1,
      notes: checkin?.notes || '',
      room_condition: checkin?.room_condition || 'good',
      ...(mode === 'checkout' && {
        damages_reported: checkin?.damages_reported || '',
        additional_charges: checkin?.additional_charges || 0
      })
    }
  });

  useEffect(() => {
    if (checkin) {
      reset({
        reservation_id: checkin.reservation_id,
        actual_guests: checkin.actual_guests || 1,
        notes: checkin.notes || '',
        room_condition: checkin.room_condition || 'good',
        ...(mode === 'checkout' && {
          damages_reported: checkin.damages_reported || '',
          additional_charges: checkin.additional_charges || 0
        })
      });
    } else if (reservation) {
      setValue('reservation_id', reservation.id);
      setValue('actual_guests', reservation.guests_count);
    }
  }, [checkin, reservation, reset, setValue, mode]);

  const onFormSubmit = async (data: HotelCheckinFormData | HotelCheckoutFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      toast.error('Erro ao processar formulário');
    } finally {
      setLoading(false);
    }
  };



  if (!isOpen) return null;

  const getTitle = () => {
    switch (mode) {
      case 'checkin':
        return 'Realizar Check-in';
      case 'checkout':
        return 'Realizar Check-out';
      case 'edit':
        return 'Editar Check-in/Check-out';
      default:
        return 'Formulário';
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Informações da Reserva */}
          {reservation && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Informações da Reserva</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Hóspede:</span>
                  <span className="ml-2">{reservation.guest_name}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Quarto:</span>
                  <span className="ml-2">{reservation.hotel_rooms?.room_number}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Check-in:</span>
                  <span className="ml-2">{new Date(reservation.check_in_date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Check-out:</span>
                  <span className="ml-2">{new Date(reservation.check_out_date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Campos do Check-in */}
          {(mode === 'checkin' || mode === 'edit') && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Informações do Check-in
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Hóspedes Presentes
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      {...register('actual_guests', { valueAsNumber: true })}
                      min="1"
                      max="10"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.actual_guests && (
                      <p className="mt-1 text-sm text-red-600">{errors.actual_guests.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condição do Quarto
                  </label>
                  <select
                    {...register('room_condition')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">Excelente</option>
                    <option value="good">Boa</option>
                    <option value="fair">Regular</option>
                    <option value="poor">Ruim</option>
                  </select>
                  {errors.room_condition && (
                    <p className="mt-1 text-sm text-red-600">{errors.room_condition.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Observações sobre o check-in..."
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Campos do Check-out */}
          {(mode === 'checkout' || mode === 'edit') && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Informações do Check-out
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condição do Quarto (Check-out)
                  </label>
                  <select
                    {...register('room_condition')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">Excelente</option>
                    <option value="good">Boa</option>
                    <option value="fair">Regular</option>
                    <option value="poor">Ruim</option>
                  </select>
                  {errors.room_condition && (
                    <p className="mt-1 text-sm text-red-600">{errors.room_condition.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxas Adicionais (R$)
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      {...register('additional_charges', { valueAsNumber: true })}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.additional_charges && (
                      <p className="mt-1 text-sm text-red-600">{errors.additional_charges.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {watch('additional_charges') > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pagamento
                  </label>
                  <select
                    {...register('payment_method')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Dinheiro</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                    <option value="bank_transfer">Transferência Bancária</option>
                  </select>
                  {errors.payment_method && (
                    <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danos Reportados
                </label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    {...register('damages_reported')}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva qualquer dano encontrado no quarto..."
                  />
                  {errors.damages_reported && (
                    <p className="mt-1 text-sm text-red-600">{errors.damages_reported.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações do Check-out
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Observações sobre o check-out..."
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : getTitle()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelCheckinForm;