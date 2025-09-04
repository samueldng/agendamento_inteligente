import React, { useState, useEffect } from 'react';
import { checkinsApi, reservationsApi } from '../lib/api/hotel';
import { toast } from 'sonner';
import { User, Clock, Calendar, CreditCard, FileText, AlertCircle, X } from 'lucide-react';
import { HotelReservation, HotelCheckin } from '../lib/supabase';
import { Button } from './ui/button';
import LoadingSpinner from './LoadingSpinner';
import { ErrorDisplay } from './ui/ErrorDisplay';
import { FormField } from './ui/FormField';
import { ButtonSpinner } from './ui/ButtonSpinner';



interface HotelCheckinFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (checkin: Omit<HotelCheckin, 'id'>) => Promise<void>;
  checkin?: HotelCheckin;
  reservation?: HotelReservation;
  professionalId: string;
  type: 'checkin' | 'checkout';
}

export default function HotelCheckinForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  checkin, 
  reservation, 
  professionalId,
  type 
}: HotelCheckinFormProps) {
  const [formData, setFormData] = useState<Omit<HotelCheckin, 'id'>>({
    reservation_id: '',
    professional_id: professionalId,
    guests_present: 1,
    additional_charges: 0,
    notes: '',
    status: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (checkin) {
      setFormData({
        reservation_id: checkin.reservation_id,
        professional_id: checkin.professional_id,
        actual_check_in: checkin.actual_check_in ? new Date(checkin.actual_check_in).toISOString().slice(0, 16) : undefined,
        actual_check_out: checkin.actual_check_out ? new Date(checkin.actual_check_out).toISOString().slice(0, 16) : undefined,
        guests_present: checkin.guests_present,
        additional_charges: checkin.additional_charges || 0,
        notes: checkin.notes || '',
        status: checkin.status
      });
    } else if (reservation) {
      const now = new Date();
      const currentDateTime = now.toISOString().slice(0, 16);
      
      setFormData({
        reservation_id: reservation.id,
        professional_id: professionalId,
        actual_check_in: type === 'checkin' ? currentDateTime : undefined,
        actual_check_out: type === 'checkout' ? currentDateTime : undefined,
        guests_present: reservation.guests_count,
        additional_charges: 0,
        notes: '',
        status: type === 'checkin' ? 'checked_in' : 'checked_out'
      });
    } else {
      setFormData({
        reservation_id: '',
        professional_id: professionalId,
        guests_present: 1,
        additional_charges: 0,
        notes: '',
        status: 'pending'
      });
    }
    setErrors({});
  }, [checkin, reservation, professionalId, type, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.reservation_id) {
      newErrors.reservation_id = 'Reserva é obrigatória';
    }

    if (type === 'checkin' && !formData.actual_check_in) {
      newErrors.actual_check_in = 'Data e hora do check-in são obrigatórias';
    }

    if (type === 'checkout' && !formData.actual_check_out) {
      newErrors.actual_check_out = 'Data e hora do check-out são obrigatórias';
    }

    if (formData.guests_present < 1) {
      newErrors.guests_present = 'Número de hóspedes deve ser maior que 0';
    }

    if (formData.additional_charges && formData.additional_charges < 0) {
      newErrors.additional_charges = 'Taxas adicionais não podem ser negativas';
    }

    // Validar se check-out é posterior ao check-in
    if (type === 'checkout' && formData.actual_check_in && formData.actual_check_out) {
      const checkInDate = new Date(formData.actual_check_in);
      const checkOutDate = new Date(formData.actual_check_out);
      
      if (checkOutDate <= checkInDate) {
        newErrors.actual_check_out = 'Check-out deve ser posterior ao check-in';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData = {
        ...formData,
        actual_check_in: formData.actual_check_in ? new Date(formData.actual_check_in).toISOString() : undefined,
        actual_check_out: formData.actual_check_out ? new Date(formData.actual_check_out).toISOString() : undefined
      };
      
      await onSubmit(submitData);
      toast.success(checkin ? `${type === 'checkin' ? 'Check-in' : 'Check-out'} atualizado com sucesso!` : `${type === 'checkin' ? 'Check-in' : 'Check-out'} realizado com sucesso!`);
      onClose();
    } catch (error) {
      console.error('Erro ao realizar operação:', error);
      toast.error(`Erro ao realizar ${type}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTitle = () => {
    if (type === 'checkin') {
      return checkin ? 'Editar Check-in' : 'Realizar Check-in';
    }
    return checkin ? 'Editar Check-out' : 'Realizar Check-out';
  };

  const totalAmount = reservation ? reservation.total_amount + (formData.additional_charges || 0) : (formData.additional_charges || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Informações da Reserva */}
        {reservation && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informações da Reserva
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Hóspede:</span>
                <p className="font-medium">{reservation.guest_name}</p>
              </div>
              <div>
                <span className="text-gray-500">Documento:</span>
                <p className="font-medium">{reservation.guest_document}</p>
              </div>
              <div>
                <span className="text-gray-500">Check-in previsto:</span>
                <p className="font-medium">{formatDate(reservation.check_in_date)}</p>
              </div>
              <div>
                <span className="text-gray-500">Check-out previsto:</span>
                <p className="font-medium">{formatDate(reservation.check_out_date)}</p>
              </div>
              <div>
                <span className="text-gray-500">Quarto:</span>
                <p className="font-medium">
                  {reservation.room ? `${reservation.room.room_number} (${reservation.room.room_type})` : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Hóspedes reservados:</span>
                <p className="font-medium">{reservation.guests_count}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dados do Check-in/Check-out */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Dados do {type === 'checkin' ? 'Check-in' : 'Check-out'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {type === 'checkin' && (
              <FormField
                label="Data e Hora do Check-in"
                error={errors.actual_check_in}
                required
              >
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    value={formData.actual_check_in || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, actual_check_in: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </FormField>
            )}

            {type === 'checkout' && (
              <FormField
                label="Data e Hora do Check-out"
                error={errors.actual_check_out}
                required
              >
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    value={formData.actual_check_out || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, actual_check_out: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </FormField>
            )}

            <FormField
              label="Hóspedes Presentes"
              error={errors.guests_present}
              required
            >
              <input
                type="number"
                min="1"
                max="10"
                value={formData.guests_present}
                onChange={(e) => setFormData(prev => ({ ...prev, guests_present: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField
              label="Taxas Adicionais"
              error={errors.additional_charges}
            >
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.additional_charges || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, additional_charges: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>
            </FormField>
          </div>
        </div>

        <FormField label="Observações">
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Observações sobre o ${type === 'checkin' ? 'check-in' : 'check-out'}...`}
            />
          </div>
        </FormField>

        {/* Resumo Financeiro */}
        {(reservation || formData.additional_charges) && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-blue-900 mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Resumo Financeiro
            </h4>
            <div className="space-y-2 text-sm">
              {reservation && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Valor da reserva:</span>
                  <span className="font-medium">{formatCurrency(reservation.total_amount)}</span>
                </div>
              )}
              {formData.additional_charges && formData.additional_charges > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Taxas adicionais:</span>
                  <span className="font-medium">{formatCurrency(formData.additional_charges)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="text-blue-900 font-medium">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {type === 'checkout' && formData.additional_charges && formData.additional_charges > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-yellow-800 font-medium">Taxas Adicionais</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  Foram adicionadas taxas extras de {formatCurrency(formData.additional_charges || 0)} ao valor da reserva.
                </p>
              </div>
            </div>
          </div>
        )}

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
            {type === 'checkin' ? 'Confirmar Check-in' : 'Confirmar Check-out'}
          </Button>
        </div>
      </form>
        </div>
      </div>
    );
}