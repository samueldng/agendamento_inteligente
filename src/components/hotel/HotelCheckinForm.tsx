import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, Users, FileText, AlertTriangle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

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
  const [formData, setFormData] = useState({
    reservation_id: '',
    actual_guests: 1,
    checkin_notes: '',
    checkout_notes: '',
    room_condition_checkin: 'Bom',
    room_condition_checkout: 'Bom',
    damages_reported: '',
    additional_charges: 0,
    payment_method: 'Cartão de Crédito',
    staff_checkin: '',
    staff_checkout: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (checkin) {
      setFormData({
        reservation_id: checkin.reservation_id || '',
        actual_guests: checkin.actual_guests || 1,
        checkin_notes: checkin.checkin_notes || '',
        checkout_notes: checkin.checkout_notes || '',
        room_condition_checkin: checkin.room_condition_checkin || 'Bom',
        room_condition_checkout: checkin.room_condition_checkout || 'Bom',
        damages_reported: checkin.damages_reported || '',
        additional_charges: checkin.additional_charges || 0,
        payment_method: checkin.payment_method || 'Cartão de Crédito',
        staff_checkin: checkin.staff_checkin || '',
        staff_checkout: checkin.staff_checkout || ''
      });
    } else if (reservation) {
      setFormData(prev => ({
        ...prev,
        reservation_id: reservation.id,
        actual_guests: reservation.num_guests || 1
      }));
    }
  }, [checkin, reservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      toast.error('Erro ao processar formulário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
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

  const roomConditionOptions = [
    { value: 'Excelente', label: 'Excelente' },
    { value: 'Bom', label: 'Bom' },
    { value: 'Regular', label: 'Regular' },
    { value: 'Ruim', label: 'Ruim' },
    { value: 'Péssimo', label: 'Péssimo' }
  ];

  const paymentMethods = [
    { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
    { value: 'Cartão de Débito', label: 'Cartão de Débito' },
    { value: 'Dinheiro', label: 'Dinheiro' },
    { value: 'PIX', label: 'PIX' },
    { value: 'Transferência', label: 'Transferência' }
  ];

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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                      name="actual_guests"
                      value={formData.actual_guests}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condição do Quarto (Check-in)
                  </label>
                  <select
                    name="room_condition_checkin"
                    value={formData.room_condition_checkin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roomConditionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações do Check-in
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="checkin_notes"
                    value={formData.checkin_notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Observações sobre o check-in..."
                  />
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
                    name="room_condition_checkout"
                    value={formData.room_condition_checkout}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roomConditionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxas Adicionais (R$)
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="additional_charges"
                      value={formData.additional_charges}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {formData.additional_charges > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pagamento
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danos Reportados
                </label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="damages_reported"
                    value={formData.damages_reported}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva qualquer dano encontrado no quarto..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações do Check-out
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="checkout_notes"
                    value={formData.checkout_notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Observações sobre o check-out..."
                  />
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