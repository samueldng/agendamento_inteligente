import React, { useState } from 'react';
import { useHotelConsumption, useHotelConsumptionItems } from '../../hooks/useHotel';
import { Button } from '../../components/ui/button';
import { ShoppingCart, Package, Coffee, DollarSign } from 'lucide-react';

export default function TestConsumptionForm() {
  const { 
    consumption, 
    loading: consumptionLoading, 
    error: consumptionError, 
    professionalId, 
    createConsumption, 
    updateConsumption, 
    deleteConsumption 
  } = useHotelConsumption();
  
  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    createItem,
    updateItem,
    deleteItem
  } = useHotelConsumptionItems();
  
  const [testResult, setTestResult] = useState<string>('');

  const handleTestCreateItem = async () => {
    console.log('🏨 TestConsumptionForm - Iniciando teste de criação de item');
    console.log('🏨 Professional ID:', professionalId);
    console.log('🏨 Items loading state:', itemsLoading);
    console.log('🏨 Items error state:', itemsError);
    console.log('🏨 createItem function type:', typeof createItem);
    
    if (!professionalId) {
      setTestResult('❌ Professional ID não encontrado');
      return;
    }
    
    try {
      const testItemData = {
        professional_id: professionalId,
        name: 'Água Mineral Teste',
        description: 'Água mineral 500ml - item de teste',
        price: 5.50,
        category: 'bebidas',
        available: true
      };
      
      console.log('🏨 Dados do item de teste:', testItemData);
      console.log('🏨 Chamando createItem...');
      
      const result = await createItem(testItemData);
      
      console.log('🏨 Resultado da criação do item:', result);
      setTestResult('✅ Item de consumo criado com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao criar item:', error);
      console.error('🏨 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      setTestResult(`❌ Erro ao criar item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleTestCreateConsumption = async () => {
    console.log('🏨 TestConsumptionForm - Iniciando teste de criação de consumo');
    console.log('🏨 Professional ID:', professionalId);
    console.log('🏨 Consumption loading state:', consumptionLoading);
    console.log('🏨 Consumption error state:', consumptionError);
    console.log('🏨 createConsumption function type:', typeof createConsumption);
    
    if (!professionalId) {
      setTestResult('❌ Professional ID não encontrado');
      return;
    }
    
    try {
      const testConsumptionData = {
        professional_id: professionalId,
        reservation_id: '1', // ID de teste - ajustar conforme necessário
        total_amount: 25.50,
        notes: 'Consumo de teste automático',
        items: [
          {
            item_id: items.length > 0 ? items[0].id : '1',
            quantity: 2,
            unit_price: 5.50,
            total_price: 11.00
          },
          {
            item_id: items.length > 1 ? items[1].id : '2',
            quantity: 1,
            unit_price: 14.50,
            total_price: 14.50
          }
        ]
      };
      
      console.log('🏨 Dados do consumo de teste:', testConsumptionData);
      console.log('🏨 Chamando createConsumption...');
      
      const result = await createConsumption(testConsumptionData);
      
      console.log('🏨 Resultado da criação do consumo:', result);
      setTestResult('✅ Consumo de teste criado com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao criar consumo:', error);
      console.error('🏨 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      setTestResult(`❌ Erro ao criar consumo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleTestUpdateItem = async () => {
    console.log('🏨 TestConsumptionForm - Iniciando teste de atualização de item');
    
    if (items.length === 0) {
      setTestResult('❌ Nenhum item disponível para atualizar');
      return;
    }
    
    try {
      const firstItem = items[0];
      const updateData = {
        name: 'Item Atualizado Teste',
        price: 7.50,
        description: 'Item atualizado via teste'
      };
      
      console.log('🏨 Atualizando item ID:', firstItem.id);
      console.log('🏨 Dados de atualização:', updateData);
      
      const result = await updateItem(firstItem.id, updateData);
      
      console.log('🏨 Resultado da atualização do item:', result);
      setTestResult('✅ Item atualizado com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao atualizar item:', error);
      setTestResult(`❌ Erro ao atualizar item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleTestDeleteConsumption = async () => {
    console.log('🏨 TestConsumptionForm - Iniciando teste de exclusão de consumo');
    
    if (consumption.length === 0) {
      setTestResult('❌ Nenhum consumo disponível para excluir');
      return;
    }
    
    try {
      const lastConsumption = consumption[consumption.length - 1];
      
      console.log('🏨 Excluindo consumo ID:', lastConsumption.id);
      
      await deleteConsumption(lastConsumption.id);
      
      console.log('🏨 Consumo excluído com sucesso');
      setTestResult('✅ Consumo excluído com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao excluir consumo:', error);
      setTestResult(`❌ Erro ao excluir consumo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2 text-green-600" />
            Teste - Formulário de Consumo
          </h1>
          
          {/* Status dos Hooks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-3">Hook useHotelConsumption</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-green-700 font-medium">Professional ID:</span>
                  <p className="text-gray-900">{professionalId || 'Carregando...'}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Loading:</span>
                  <p className="text-gray-900">{consumptionLoading ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Error:</span>
                  <p className="text-gray-900">{consumptionError || 'Nenhum'}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Total de Consumos:</span>
                  <p className="text-gray-900">{consumption.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">Hook useHotelConsumptionItems</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Loading:</span>
                  <p className="text-gray-900">{itemsLoading ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Error:</span>
                  <p className="text-gray-900">{itemsError || 'Nenhum'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Total de Itens:</span>
                  <p className="text-gray-900">{items.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botões de Teste */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button
              onClick={handleTestCreateItem}
              disabled={itemsLoading || !professionalId}
              className="flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Criar Item
            </Button>
            
            <Button
              onClick={handleTestCreateConsumption}
              disabled={consumptionLoading || !professionalId}
              className="flex items-center justify-center gap-2"
            >
              <Coffee className="w-4 h-4" />
              Criar Consumo
            </Button>
            
            <Button
              onClick={handleTestUpdateItem}
              disabled={itemsLoading || items.length === 0}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Atualizar Item
            </Button>
            
            <Button
              onClick={handleTestDeleteConsumption}
              disabled={consumptionLoading || consumption.length === 0}
              variant="destructive"
              className="flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Excluir Consumo
            </Button>
          </div>
          
          {/* Resultado do Teste */}
          {testResult && (
            <div className={`p-4 rounded-lg mb-6 ${
              testResult.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="font-medium">{testResult}</p>
            </div>
          )}
          
          {/* Lista de Itens e Consumos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Itens Disponíveis ({items.length})
              </h3>
              
              {itemsLoading && (
                <p className="text-gray-600">Carregando itens...</p>
              )}
              
              {!itemsLoading && items.length === 0 && (
                <p className="text-gray-600">Nenhum item encontrado.</p>
              )}
              
              {!itemsLoading && items.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={item.id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-xs text-gray-500">Categoria: {item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            R$ {item.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.available ? 'Disponível' : 'Indisponível'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Consumos Registrados ({consumption.length})
              </h3>
              
              {consumptionLoading && (
                <p className="text-gray-600">Carregando consumos...</p>
              )}
              
              {!consumptionLoading && consumption.length === 0 && (
                <p className="text-gray-600">Nenhum consumo encontrado.</p>
              )}
              
              {!consumptionLoading && consumption.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {consumption.map((cons, index) => (
                    <div key={cons.id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Consumo #{cons.id}</p>
                          <p className="text-sm text-gray-600">
                            Reserva: {cons.reservation_id}
                          </p>
                          <p className="text-sm text-gray-600">{cons.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            R$ {cons.total_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(cons.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}