import { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, Trash2, Edit, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { LoadingSpinner } from './ui/loading-spinner';
import { Empty } from './ui/empty';
import { consumptionApi } from '../lib/api/hotel';
import { toast } from 'sonner';

interface ConsumptionItem {
  id: string;
  name: string;
  category: string;
  description?: string;
}

interface HotelConsumption {
  id: string;
  reservation_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  consumed_at: string;
  notes?: string;
  hotel_consumption_items: ConsumptionItem;
}

interface HotelConsumptionListProps {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  onAddConsumption: () => void;
}

export default function HotelConsumptionList({
  reservationId,
  guestName,
  roomNumber,
  onAddConsumption
}: HotelConsumptionListProps) {
  const [consumption, setConsumption] = useState<HotelConsumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<HotelConsumption | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    loadConsumption();
  }, [reservationId]);

  const loadConsumption = async () => {
    try {
      setLoading(true);
      const data = await consumptionApi.getByReservation(reservationId);
      setConsumption(data || []);
    } catch (error) {
      console.error('Erro ao carregar consumo:', error);
      toast.error('Erro ao carregar consumo');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: HotelConsumption) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
    setEditNotes(item.notes || '');
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      await consumptionApi.update(editingItem.id, {
        quantity: editQuantity,
        notes: editNotes || undefined
      });
      toast.success('Consumo atualizado com sucesso!');
      setEditingItem(null);
      loadConsumption();
    } catch (error) {
      console.error('Erro ao atualizar consumo:', error);
      toast.error('Erro ao atualizar consumo');
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (!confirm(`Tem certeza que deseja remover "${itemName}" do consumo?`)) return;

    try {
      await consumptionApi.delete(id);
      toast.success('Item removido com sucesso!');
      loadConsumption();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getTotalConsumption = () => {
    return consumption.reduce((total, item) => total + item.total_price, 0);
  };

  const groupedConsumption = consumption.reduce((acc, item) => {
    const category = item.hotel_consumption_items.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, HotelConsumption[]>);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2" />
            Consumo do Hóspede
          </h2>
          <p className="text-gray-600">
            {guestName} - Quarto {roomNumber}
          </p>
        </div>
        <Button
          onClick={onAddConsumption}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Consumo
        </Button>
      </div>

      {/* Resumo */}
      {consumption.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-blue-800 font-medium">Total do Consumo:</span>
            <span className="text-xl font-bold text-blue-900">
              {formatCurrency(getTotalConsumption())}
            </span>
          </div>
        </div>
      )}

      {/* Lista de consumo */}
      {consumption.length === 0 ? (
        <Empty
          icon={ShoppingCart}
          title="Nenhum consumo registrado"
          description="Este hóspede ainda não possui consumo registrado."
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedConsumption).map(([category, items]) => (
            <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {items.map(item => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {item.hotel_consumption_items.name}
                            </h4>
                            {item.hotel_consumption_items.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {item.hotel_consumption_items.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Quantidade:</span>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Valor Unitário:</span>
                            <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <p className="font-medium text-green-600">
                              {formatCurrency(item.total_price)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Data/Hora:</span>
                            <p className="font-medium">{formatDate(item.consumed_at)}</p>
                          </div>
                        </div>
                        
                        {item.notes && (
                          <div className="mt-3">
                            <span className="text-gray-500 text-sm">Observações:</span>
                            <p className="text-sm text-gray-700 mt-1">{item.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          onClick={() => handleEdit(item)}
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item.id, item.hotel_consumption_items.name)}
                          variant="outline"
                          size="sm"
                          className="flex items-center text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edição */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Editar: {editingItem.hotel_consumption_items.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observações sobre o consumo..."
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Valor unitário: {formatCurrency(editingItem.unit_price)}</p>
                <p className="font-semibold">
                  Novo total: {formatCurrency(editingItem.unit_price * editQuantity)}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleUpdate}
                className="flex-1"
              >
                Salvar
              </Button>
              <Button
                onClick={() => setEditingItem(null)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}