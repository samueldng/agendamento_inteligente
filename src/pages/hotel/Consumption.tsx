import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { useHotelConsumption, useHotelConsumptionItems } from '../../hooks/useHotel';
import { HotelConsumption } from '../../types/hotel';
import { ConsumptionForm } from '../../components/hotel/ConsumptionForm';
import { toast } from 'sonner';

export default function Consumption() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConsumption, setEditingConsumption] = useState<HotelConsumption | null>(null);
  const { 
    consumption, 
    loading, 
    error, 
    createConsumption, 
    deleteConsumption 
  } = useHotelConsumption();
  
  const { 
    items: consumptionItems, 
    loading: itemsLoading 
  } = useHotelConsumptionItems();

  const handleAddConsumption = async (data: any) => {
    try {
      await createConsumption(data);
      setIsFormOpen(false);
      setEditingConsumption(null);
    } catch (error) {
      console.error('Erro ao adicionar consumo:', error);
    }
  };

  const handleEdit = (consumption: HotelConsumption) => {
    setEditingConsumption(consumption);
    setIsFormOpen(true);
  };

  const handleDeleteConsumption = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item de consumo?')) {
      try {
        await deleteConsumption(id);
      } catch (error) {
        console.error('Erro ao excluir consumo:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingConsumption(null);
  };

  // Funções auxiliares para formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getItemName = (itemId: string) => {
    const item = consumptionItems.find(i => i.id === itemId);
    return item?.name || 'Item não encontrado';
  };

  const getItemCategory = (itemId: string) => {
    const item = consumptionItems.find(i => i.id === itemId);
    return item?.category || 'N/A';
  };

  // Filter consumption based on search term
  const filteredConsumption = consumption.filter(c => {
    const itemName = getItemName(c.item_id).toLowerCase();
    const guestName = c.hotel_reservations?.guest_name?.toLowerCase() || '';
    const roomNumber = c.hotel_reservations?.hotel_rooms?.room_number?.toString() || '';
    const search = searchTerm.toLowerCase();
    
    return itemName.includes(search) || 
           guestName.includes(search) || 
           roomNumber.includes(search);
  });

  // Calculate totals
  const totalConsumption = consumption.reduce((sum, c) => sum + (c.total_price || 0), 0);
  const todayConsumption = consumption
    .filter(c => {
      const today = new Date().toDateString();
      const consumedDate = new Date(c.consumed_at).toDateString();
      return today === consumedDate;
    })
    .reduce((sum, c) => sum + (c.total_price || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Consumo</h1>
          <p className="text-gray-600 mt-1">Gerencie o consumo de hóspedes</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Consumo
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingConsumption ? 'Editar Consumo' : 'Adicionar Consumo'}
              </DialogTitle>
            </DialogHeader>
            <ConsumptionForm
              onSubmit={handleAddConsumption}
              initialData={editingConsumption}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingConsumption(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consumo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalConsumption)}</div>
            <p className="text-xs text-muted-foreground">
              {consumption.length} itens consumidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayConsumption)}</div>
            <p className="text-xs text-muted-foreground">
              {consumption.filter(c => {
                const today = new Date().toDateString();
                const consumedDate = new Date(c.consumed_at).toDateString();
                return today === consumedDate;
              }).length} itens hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Disponíveis</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consumptionItems.filter(i => i.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              {consumptionItems.length} itens cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por item, hóspede ou quarto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consumption Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Consumo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading || itemsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredConsumption.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum consumo encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Adicione o primeiro consumo para começar.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Consumo
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hóspede</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConsumption.map((consumptionItem) => (
                    <tr key={consumptionItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getItemName(consumptionItem.item_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Badge variant="outline">
                          {getItemCategory(consumptionItem.item_id)}
                        </Badge>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {consumptionItem.hotel_reservations?.guest_name || 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {consumptionItem.hotel_reservations?.hotel_rooms?.room_number || 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {consumptionItem.quantity}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {formatCurrency(consumptionItem.unit_price || 0)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                         {formatCurrency(consumptionItem.total_price || 0)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {formatDateTime(consumptionItem.consumed_at)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleEdit(consumptionItem)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleDeleteConsumption(consumptionItem.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}