import React, { useState } from 'react';
import { useHotelCheckins } from '../../hooks/useHotel';
import { Button } from '../../components/ui/button';
import { LogIn, LogOut, Clock, CreditCard } from 'lucide-react';

export default function TestCheckinForm() {
  const { 
    checkins, 
    loading, 
    error, 
    professionalId, 
    createCheckin, 
    updateCheckin, 
    deleteCheckin 
  } = useHotelCheckins();
  
  const [testResult, setTestResult] = useState<string>('');

  const handleTestCreateCheckin = async () => {
    console.log('🏨 TestCheckinForm - Iniciando teste de criação de check-in');
    console.log('🏨 Professional ID:', professionalId);
    console.log('🏨 Loading state:', loading);
    console.log('🏨 Error state:', error);
    console.log('🏨 createCheckin function type:', typeof createCheckin);
    
    if (!professionalId) {
      setTestResult('❌ Professional ID não encontrado');
      return;
    }
    
    try {
      const testCheckinData = {
        professional_id: professionalId,
        reservation_id: '1', // ID de teste - ajustar conforme necessário
        check_in_date: new Date().toISOString(),
        actual_guests: 2,
        additional_fees: 15.00,
        notes: 'Check-in de teste automático'
      };
      
      console.log('🏨 Dados do check-in de teste:', testCheckinData);
      console.log('🏨 Chamando createCheckin...');
      
      const result = await createCheckin(testCheckinData);
      
      console.log('🏨 Resultado da criação do check-in:', result);
      setTestResult('✅ Check-in de teste criado com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao criar check-in:', error);
      console.error('🏨 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      setTestResult(`❌ Erro ao criar check-in: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleTestCreateCheckout = async () => {
    console.log('🏨 TestCheckinForm - Iniciando teste de criação de check-out');
    
    if (checkins.length === 0) {
      setTestResult('❌ Nenhum check-in disponível para fazer check-out');
      return;
    }
    
    try {
      // Encontrar um check-in sem check-out
      const checkinWithoutCheckout = checkins.find(checkin => !checkin.check_out_date);
      
      if (!checkinWithoutCheckout) {
        setTestResult('❌ Nenhum check-in disponível para check-out (todos já têm check-out)');
        return;
      }
      
      const checkoutData = {
        check_out_date: new Date().toISOString(),
        additional_fees: 25.00,
        notes: 'Check-out de teste automático'
      };
      
      console.log('🏨 Fazendo check-out do ID:', checkinWithoutCheckout.id);
      console.log('🏨 Dados do check-out:', checkoutData);
      
      const result = await updateCheckin(checkinWithoutCheckout.id, checkoutData);
      
      console.log('🏨 Resultado do check-out:', result);
      setTestResult('✅ Check-out de teste realizado com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao fazer check-out:', error);
      setTestResult(`❌ Erro ao fazer check-out: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleTestUpdateCheckin = async () => {
    console.log('🏨 TestCheckinForm - Iniciando teste de atualização de check-in');
    
    if (checkins.length === 0) {
      setTestResult('❌ Nenhum check-in disponível para atualizar');
      return;
    }
    
    try {
      const firstCheckin = checkins[0];
      const updateData = {
        actual_guests: 3,
        additional_fees: 30.00,
        notes: 'Check-in atualizado via teste'
      };
      
      console.log('🏨 Atualizando check-in ID:', firstCheckin.id);
      console.log('🏨 Dados de atualização:', updateData);
      
      const result = await updateCheckin(firstCheckin.id, updateData);
      
      console.log('🏨 Resultado da atualização:', result);
      setTestResult('✅ Check-in atualizado com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao atualizar check-in:', error);
      setTestResult(`❌ Erro ao atualizar check-in: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleTestDeleteCheckin = async () => {
    console.log('🏨 TestCheckinForm - Iniciando teste de exclusão de check-in');
    
    if (checkins.length === 0) {
      setTestResult('❌ Nenhum check-in disponível para excluir');
      return;
    }
    
    try {
      const lastCheckin = checkins[checkins.length - 1];
      
      console.log('🏨 Excluindo check-in ID:', lastCheckin.id);
      
      await deleteCheckin(lastCheckin.id);
      
      console.log('🏨 Check-in excluído com sucesso');
      setTestResult('✅ Check-in excluído com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao excluir check-in:', error);
      setTestResult(`❌ Erro ao excluir check-in: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <LogIn className="w-6 h-6 mr-2 text-purple-600" />
            Teste - Formulário de Check-in/Check-out
          </h1>
          
          {/* Status do Hook */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-purple-900 mb-3">Status do Hook useHotelCheckins</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-purple-700 font-medium">Professional ID:</span>
                <p className="text-gray-900">{professionalId || 'Carregando...'}</p>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Loading:</span>
                <p className="text-gray-900">{loading ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Error:</span>
                <p className="text-gray-900">{error || 'Nenhum'}</p>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Total de Check-ins:</span>
                <p className="text-gray-900">{checkins.length}</p>
              </div>
            </div>
          </div>
          
          {/* Botões de Teste */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button
              onClick={handleTestCreateCheckin}
              disabled={loading || !professionalId}
              className="flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Criar Check-in
            </Button>
            
            <Button
              onClick={handleTestCreateCheckout}
              disabled={loading || checkins.length === 0}
              className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <LogOut className="w-4 h-4" />
              Fazer Check-out
            </Button>
            
            <Button
              onClick={handleTestUpdateCheckin}
              disabled={loading || checkins.length === 0}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Atualizar Check-in
            </Button>
            
            <Button
              onClick={handleTestDeleteCheckin}
              disabled={loading || checkins.length === 0}
              variant="destructive"
              className="flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Excluir Check-in
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
          
          {/* Lista de Check-ins */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Check-ins Registrados ({checkins.length})
            </h3>
            
            {loading && (
              <p className="text-gray-600">Carregando check-ins...</p>
            )}
            
            {!loading && checkins.length === 0 && (
              <p className="text-gray-600">Nenhum check-in encontrado.</p>
            )}
            
            {!loading && checkins.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {checkins.map((checkin, index) => (
                  <div key={checkin.id} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Check-in #{checkin.id}</p>
                        <p className="text-sm text-gray-600">
                          Reserva: {checkin.reservation_id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Check-in: {new Date(checkin.check_in_date).toLocaleString('pt-BR')}
                        </p>
                        {checkin.check_out_date && (
                          <p className="text-sm text-gray-600">
                            Check-out: {new Date(checkin.check_out_date).toLocaleString('pt-BR')}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Hóspedes: {checkin.actual_guests}
                        </p>
                        {checkin.notes && (
                          <p className="text-xs text-gray-500">{checkin.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          checkin.check_out_date 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {checkin.check_out_date ? (
                            <><LogOut className="w-3 h-3 mr-1" />Check-out</>
                          ) : (
                            <><LogIn className="w-3 h-3 mr-1" />Ativo</>
                          )}
                        </div>
                        {checkin.additional_fees > 0 && (
                          <p className="text-sm font-medium text-orange-600 mt-1">
                            Taxa: R$ {checkin.additional_fees.toFixed(2)}
                          </p>
                        )}
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
  );
}