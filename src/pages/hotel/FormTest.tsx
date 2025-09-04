import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import HotelReservationForm from '../../components/HotelReservationForm';
import HotelConsumptionForm from '../../components/HotelConsumptionForm';
import HotelCheckinForm from '../../components/HotelCheckinForm';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type FormType = 'reservation' | 'consumption' | 'checkin' | null;

export default function FormTest() {
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const navigate = useNavigate();

  const handleFormClose = () => {
    setActiveForm(null);
  };

  const renderForm = () => {
    switch (activeForm) {
      case 'reservation':
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormClose}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                Teste - Formulário de Reserva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HotelReservationForm
                onClose={handleFormClose}
                onSuccess={() => {
                  console.log('Reserva criada com sucesso!');
                  handleFormClose();
                }}
              />
            </CardContent>
          </Card>
        );
      
      case 'consumption':
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormClose}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                Teste - Formulário de Consumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HotelConsumptionForm
                guestId="test-guest-id"
                onClose={handleFormClose}
                onSuccess={() => {
                  console.log('Consumo registrado com sucesso!');
                  handleFormClose();
                }}
              />
            </CardContent>
          </Card>
        );
      
      case 'checkin':
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormClose}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                Teste - Formulário de Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HotelCheckinForm
                reservationId="test-reservation-id"
                onClose={handleFormClose}
                onSuccess={() => {
                  console.log('Check-in realizado com sucesso!');
                  handleFormClose();
                }}
              />
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/hotel')}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Dashboard
                  </Button>
                  Teste de Formulários de Hotel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Selecione um formulário para testar sua funcionalidade:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveForm('reservation')}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <span className="text-lg font-semibold">Reservas</span>
                    <span className="text-sm opacity-80">Criar/Editar Reserva</span>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveForm('consumption')}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <span className="text-lg font-semibold">Consumo</span>
                    <span className="text-sm opacity-80">Registrar Consumo</span>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveForm('checkin')}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <span className="text-lg font-semibold">Check-in</span>
                    <span className="text-sm opacity-80">Realizar Check-in/out</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status dos Componentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span>HotelReservationForm</span>
                    <span className="text-green-600 font-semibold">✓ Carregado</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span>HotelConsumptionForm</span>
                    <span className="text-green-600 font-semibold">✓ Carregado</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span>HotelCheckinForm</span>
                    <span className="text-green-600 font-semibold">✓ Carregado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {renderForm()}
    </div>
  );
}