import React from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useHotelRooms } from '../../hooks/useHotel';
import { toast } from 'sonner';
import type { Database } from '../../lib/supabase';

type BaseHotelRoom = Database['public']['Tables']['hotel_rooms']['Row'];

export function TestRoomForm() {
  const { createRoom, loading } = useHotelRooms();

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 TESTE: Formulário de teste submetido!');
    console.log('🔥 TESTE: Loading state:', loading);
    console.log('🔥 TESTE: createRoom function:', typeof createRoom);
    
    const testData = {
      room_number: '999',
      room_type: 'single' as const,
      capacity: 1,
      base_price: 100,
      description: 'Quarto de teste',
      amenities: ['Wi-Fi'],
      professional_id: '', // será preenchido pelo hook
      is_active: true
    };
    
    console.log('🔥 TESTE: Dados do teste:', testData);
    console.log('🔥 TESTE: Iniciando chamada createRoom...');
    
    try {
      const result = await createRoom(testData);
      console.log('🔥 TESTE: Resultado createRoom:', result);
      console.log('🔥 TESTE: Quarto criado com sucesso!');
      toast.success('Quarto de teste criado com sucesso!');
    } catch (error) {
      console.error('🔥 TESTE: Erro ao criar quarto:', error);
      console.error('🔥 TESTE: Stack trace:', error instanceof Error ? error.stack : 'N/A');
      toast.error('Erro ao criar quarto de teste.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Teste de Formulário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTestSubmit} className="space-y-4">
            <Input 
              placeholder="Número do quarto" 
              defaultValue="999" 
              readOnly 
            />
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Criando...' : 'Criar Quarto de Teste'}
            </Button>
          </form>
          
          <div className="mt-4">
            <Button 
              onClick={() => {
                console.log('🔥 TESTE: Botão de log clicado!');
                alert('Botão funcionando!');
              }}
              variant="outline"
              className="w-full"
            >
              Teste de Clique
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}