import React, { useState } from 'react';
import { useHotelReservations } from '../../hooks/useHotel';
import { Button } from '../../components/ui/button';
import { Calendar, Users, Mail, Phone, DollarSign } from 'lucide-react';

export default function TestReservationForm() {
  const { 
    reservations, 
    loading, 
    error, 
    professionalId, 
    createReservation, 
    updateReservation, 
    cancelReservation 
  } = useHotelReservations();
  
  const [testResult, setTestResult] = useState<string>('');

  const handleTestCreateReservation = async () => {
    console.log('🏨 TestReservationForm - Iniciando teste de criação de reserva');
    console.log('🏨 Professional ID:', professionalId);
    console.log('🏨 Loading state:', loading);
    console.log('🏨 Error state:', error);
    console.log('🏨 createReservation function type:', typeof createReservation);
    
    if (!professionalId) {
      setTestResult('❌ Professional ID não encontrado');
      return;
    }
    
    try {
      const testReservationData = {
        professional_id: professionalId,
        room_id: '1', // ID de teste - ajustar conforme necessário
        guest_name: 'João Silva Teste',
        guest_email: 'joao.teste@email.com',
        guest_phone: '(11) 99999-9999',
        guest_document: '123.456.789-00',
        check_in_date: '2024-02-01T14:00:00.000Z',
        check_out_date: '2024-02-03T12:00:00.000Z',
        guests_count: 2,
        total_amount: 300.00,
        status: 'pending' as const,
        special_requests: 'Teste de reserva automática'
      };
      
      console.log('🏨 Dados da reserva de teste:', testReservationData);
      console.log('🏨 Chamando createReservation...');
      
      const result = await createReservation(testReservationData);
      
      console.log('🏨 Resultado da criação:', result);
      setTestResult('✅ Reserva de teste criada com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao criar reserva de teste:', error);
      console.error('🏨 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      setTestResult(`❌ Erro ao criar reserva: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleTestUpdateReservation = async () => {
    console.log('🏨 TestReservationForm - Iniciando teste de atualização de reserva');
    
    if (reservations.length === 0) {
      setTestResult('❌ Nenhuma reserva disponível para atualizar');
      return;
    }
    
    try {
      const firstReservation = reservations[0];
      const updateData = {
        guest_name: 'João Silva Atualizado',
        special_requests: 'Reserva atualizada via teste'
      };
      
      console.log('🏨 Atualizando reserva ID:', firstReservation.id);
      console.log('🏨 Dados de atualização:', updateData);
      
      const result = await updateReservation(firstReservation.id, updateData);
      
      console.log('🏨 Resultado da atualização:', result);
      setTestResult('✅ Reserva atualizada com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao atualizar reserva:', error);
      setTestResult(`❌ Erro ao atualizar reserva: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleTestCancelReservation = async () => {
    console.log('🏨 TestReservationForm - Iniciando teste de cancelamento de reserva');
    
    if (reservations.length === 0) {
      setTestResult('❌ Nenhuma reserva disponível para cancelar');
      return;
    }
    
    try {
      const lastReservation = reservations[reservations.length - 1];
      
      console.log('🏨 Cancelando reserva ID:', lastReservation.id);
      
      await cancelReservation(lastReservation.id);
      
      console.log('🏨 Reserva cancelada com sucesso');
      setTestResult('✅ Reserva cancelada com sucesso!');
    } catch (error) {
      console.error('🏨 Erro ao cancelar reserva:', error);
      setTestResult(`❌ Erro ao cancelar reserva: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            Teste - Formulário de Reservas
          </h1>
          
          {/* Status do Hook */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Status do Hook useHotelReservations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Professional ID:</span>
                <p className="text-gray-900">{professionalId || 'Carregando...'}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Loading:</span>
                <p className="text-gray-900">{loading ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Error:</span>
                <p className="text-gray-900">{error || 'Nenhum'}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Total de Reservas:</span>
                <p className="text-gray-900">{reservations.length}</p>
              </div>
            </div>
          </div>
          
          {/* Botões de Teste */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              onClick={handleTestCreateReservation}
              disabled={loading || !professionalId}
              className="flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Criar Reserva de Teste
            </Button>
            
            <Button
              onClick={handleTestUpdateReservation}
              disabled={loading || reservations.length === 0}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Atualizar Primeira Reserva
            </Button>
            
            <Button
              onClick={handleTestCancelReservation}
              disabled={loading || reservations.length === 0}
              variant="destructive"
              className="flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Cancelar Última Reserva
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
          
          {/* Lista de Reservas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Reservas Carregadas ({reservations.length})
            </h3>
            
            {loading && (
              <p className="text-gray-600">Carregando reservas...</p>
            )}
            
            {!loading && reservations.length === 0 && (
              <p className="text-gray-600">Nenhuma reserva encontrada.</p>
            )}
            
            {!loading && reservations.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reservations.map((reservation, index) => (
                  <div key={reservation.id} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{reservation.guest_name}</p>
                        <p className="text-sm text-gray-600">
                          Check-in: {new Date(reservation.check_in_date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Check-out: {new Date(reservation.check_out_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          R$ {reservation.total_amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: {reservation.status}
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
  );
}