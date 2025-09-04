import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHotelRooms, useHotelReservations, useHotelConsumption, useHotelCheckins } from '../../hooks/useHotel';

export default function FeedbackTest() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createRoom } = useHotelRooms();
  const { createReservation } = useHotelReservations();
  const { createConsumption } = useHotelConsumption();
  const { createCheckin } = useHotelCheckins();

  const testToastTypes = () => {
    toast.success('✅ Toast de sucesso funcionando!');
    setTimeout(() => {
      toast.error('❌ Toast de erro funcionando!');
    }, 1000);
    setTimeout(() => {
      toast.info('ℹ️ Toast de informação funcionando!');
    }, 2000);
    setTimeout(() => {
      toast.warning('⚠️ Toast de aviso funcionando!');
    }, 3000);
  };

  const testRoomCreation = async () => {
    setIsLoading(true);
    try {
      await createRoom({
        room_number: 'TEST-' + Date.now(),
        room_type: 'single',
        capacity: 1,
        base_price: 100,
        description: 'Quarto de teste para feedback visual',
        amenities: ['Wi-Fi'],
        is_active: true
      });
    } catch (error) {
      console.error('Erro no teste de criação de quarto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testReservationCreation = async () => {
    setIsLoading(true);
    try {
      // Simular erro para testar toast de erro
      await createReservation({
        guest_name: 'Teste Feedback',
        guest_email: 'teste@feedback.com',
        guest_phone: '(11) 99999-9999',
        guest_document: '123.456.789-00',
        room_id: 'invalid-room-id', // ID inválido para gerar erro
        check_in_date: '2024-12-01',
        check_out_date: '2024-12-02',
        guests_count: 1,
        total_amount: 100,
        status: 'confirmed',
        special_requests: 'Teste de feedback visual'
      });
    } catch (error) {
      console.error('Erro esperado no teste de reserva:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConsumptionCreation = async () => {
    setIsLoading(true);
    try {
      // Simular erro para testar toast de erro
      await createConsumption({
        reservation_id: 'invalid-reservation-id',
        item_id: 'invalid-item-id',
        quantity: 1,
        unit_price: 10,
        total_price: 10,
        consumed_at: new Date().toISOString(),
        notes: 'Teste de feedback visual'
      });
    } catch (error) {
      console.error('Erro esperado no teste de consumo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testCheckinCreation = async () => {
    setIsLoading(true);
    try {
      // Simular erro para testar toast de erro
      await createCheckin({
        reservation_id: 'invalid-reservation-id',
        professional_id: 'test-professional-id',
        actual_check_in: new Date().toISOString(),
        guests_present: 1,
        additional_charges: 0,
        notes: 'Teste de feedback visual',
        status: 'checked_in'
      });
    } catch (error) {
      console.error('Erro esperado no teste de check-in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/hotel')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Teste de Feedback Visual - Hotel
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teste de Toasts Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Toasts Básicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Teste os diferentes tipos de toast disponíveis no sistema.
              </p>
              <Button
                onClick={testToastTypes}
                className="w-full"
                variant="outline"
              >
                Testar Todos os Toasts
              </Button>
            </CardContent>
          </Card>

          {/* Teste de Criação de Quarto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Feedback de Quartos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Teste o feedback visual ao criar um quarto (deve mostrar sucesso).
              </p>
              <Button
                onClick={testRoomCreation}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Testando...' : 'Testar Criação de Quarto'}
              </Button>
            </CardContent>
          </Card>

          {/* Teste de Erro de Reserva */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Feedback de Reservas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Teste o feedback visual de erro ao criar uma reserva inválida.
              </p>
              <Button
                onClick={testReservationCreation}
                disabled={isLoading}
                className="w-full"
                variant="destructive"
              >
                {isLoading ? 'Testando...' : 'Testar Erro de Reserva'}
              </Button>
            </CardContent>
          </Card>

          {/* Teste de Erro de Consumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Feedback de Consumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Teste o feedback visual de erro ao criar um consumo inválido.
              </p>
              <Button
                onClick={testConsumptionCreation}
                disabled={isLoading}
                className="w-full"
                variant="destructive"
              >
                {isLoading ? 'Testando...' : 'Testar Erro de Consumo'}
              </Button>
            </CardContent>
          </Card>

          {/* Teste de Erro de Check-in */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Feedback de Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Teste o feedback visual de erro ao criar um check-in inválido.
              </p>
              <Button
                onClick={testCheckinCreation}
                disabled={isLoading}
                className="w-full"
                variant="destructive"
              >
                {isLoading ? 'Testando...' : 'Testar Erro de Check-in'}
              </Button>
            </CardContent>
          </Card>

          {/* Instruções */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Instruções de Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>Toasts Básicos:</strong> Deve mostrar 4 toasts em sequência (sucesso, erro, info, aviso)</p>
                <p>• <strong>Criação de Quarto:</strong> Deve mostrar toast de sucesso se a operação for bem-sucedida</p>
                <p>• <strong>Testes de Erro:</strong> Devem mostrar toasts de erro com mensagens apropriadas</p>
                <p>• <strong>Posição:</strong> Os toasts devem aparecer no canto superior direito</p>
                <p>• <strong>Duração:</strong> Os toasts devem desaparecer automaticamente após alguns segundos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}