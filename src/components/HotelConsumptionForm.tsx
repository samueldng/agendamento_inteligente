import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { consumptionApi } from '../lib/api/hotel';
import { hotelConsumptionSchema, type HotelConsumption } from '../lib/validations/hotel';
import { toast } from 'sonner';
import { useFormSubmission, useDataFetching } from '../hooks/useAsyncOperation';
import LoadingSpinner from './LoadingSpinner';
import { ErrorDisplay } from './ui/ErrorDisplay';

interface ConsumptionItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  is_active: boolean;
}

interface CartItem extends ConsumptionItem {
  quantity: number;
}

interface HotelConsumptionFormProps {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  onConsumptionAdded: () => void;
  onClose: () => void;
}

const categories = [
  'Minibar',
  'Room Service',
  'Lavanderia',
  'Spa',
  'Serviços Extras'
];

export default function HotelConsumptionForm({
  reservationId,
  guestName,
  roomNumber,
  onConsumptionAdded,
  onClose
}: HotelConsumptionFormProps) {
  const { execute: submitForm, loading: isSubmitting, error: submitError } = useFormSubmission();
  const { data: consumptionItems, loading: loadingItems, error: itemsError, execute: fetchItems } = useDataFetching<ConsumptionItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Minibar');
  
  const form = useForm<HotelConsumption>({
    resolver: zodResolver(hotelConsumptionSchema),
    defaultValues: {
      reservation_id: reservationId,
      consumption_date: new Date().toISOString().split('T')[0],
      total_amount: 0,
      notes: '',
      status: 'pending'
    }
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    await fetchItems(async () => {
      return await consumptionApi.getItems();
    });
  };

  const addToCart = (item: ConsumptionItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    if (cart.length === 0) {
      toast.error('Adicione pelo menos um item ao carrinho');
      return;
    }

    await submitForm(async () => {
      const consumptionData = {
        ...data,
        total_amount: getTotalAmount(),
        consumption_date: new Date().toISOString()
      };
      
      const consumption = await consumptionApi.create(consumptionData);
      
      // Criar os itens de consumo
      const itemsData = cart.map(item => ({
        consumption_id: consumption.id,
        item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));
      
      await consumptionApi.addItems(consumption.id, itemsData);
      
      onConsumptionAdded();
      onClose();
      return consumption;
    }, {
      successMessage: 'Consumo registrado com sucesso!',
      errorMessage: 'Erro ao registrar consumo'
    });
  });

  const filteredItems = consumptionItems.filter(item => item.category === selectedCategory);

  if (loadingItems) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Registrar Consumo</h2>
            <p className="text-gray-600">
              {guestName} - Quarto {roomNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {submitError && (
          <div className="p-4 border-b">
            <ErrorDisplay error={submitError} />
          </div>
        )}
        
        {itemsError && (
          <div className="p-4 border-b">
            <ErrorDisplay error={itemsError} />
          </div>
        )}

        <div className="flex h-[calc(90vh-200px)]">
          {/* Itens disponíveis */}
          <div className="flex-1 p-6 border-r">
            <h3 className="text-lg font-semibold mb-4">Itens Disponíveis</h3>
            
            {/* Filtro por categoria */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de itens */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                    <p className="text-sm font-semibold text-green-600">
                      R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    onClick={() => addToCart(item)}
                    size="sm"
                    className="flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              ))}
              
              {filteredItems.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Nenhum item disponível nesta categoria
                </p>
              )}
            </div>
          </div>

          {/* Carrinho */}
          <div className="w-80 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Carrinho ({cart.length})
            </h3>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Carrinho vazio
              </p>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">
                          R$ {item.price.toFixed(2)} cada
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t pt-3 mb-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total:</span>
                    <span className="text-lg text-green-600">
                      R$ {getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Observações */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Observações (opcional)
                   </label>
                   <textarea
                     {...form.register('notes')}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     rows={3}
                     placeholder="Observações sobre o consumo..."
                   />
                   {form.formState.errors.notes && (
                     <p className="text-red-500 text-xs mt-1">
                       {form.formState.errors.notes.message}
                     </p>
                   )}
                 </div>

                {/* Botões */}
                <div className="space-y-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center gap-2"
                  >
                    {isSubmitting && <LoadingSpinner />}
                    Registrar Consumo
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}