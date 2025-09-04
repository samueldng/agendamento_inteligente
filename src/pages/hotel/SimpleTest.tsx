import React from 'react';
import { useHotelRooms } from '../../hooks/useHotel';

export function SimpleTest() {
  const { createRoom, loading } = useHotelRooms();

  console.log('🔥 SIMPLE TEST: Componente renderizado');
  console.log('🔥 SIMPLE TEST: Loading:', loading);
  console.log('🔥 SIMPLE TEST: createRoom type:', typeof createRoom);

  const handleClick = async () => {
    console.log('🔥 SIMPLE TEST: Botão clicado!');
    
    const testData = {
      room_number: '888',
      room_type: 'single' as const,
      capacity: 1,
      base_price: 100,
      description: 'Teste simples',
      amenities: ['Wi-Fi'],
      professional_id: '',
      is_active: true
    };
    
    console.log('🔥 SIMPLE TEST: Dados:', testData);
    
    try {
      console.log('🔥 SIMPLE TEST: Chamando createRoom...');
      const result = await createRoom(testData);
      console.log('🔥 SIMPLE TEST: Resultado:', result);
      alert('Sucesso!');
    } catch (error) {
      console.error('🔥 SIMPLE TEST: Erro:', error);
      alert('Erro: ' + (error instanceof Error ? error.message : 'Desconhecido'));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Teste Simples</h1>
      <p>Loading: {loading ? 'true' : 'false'}</p>
      <button 
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Criando...' : 'Criar Quarto Teste'}
      </button>
      <button 
        onClick={() => {
          console.log('🔥 SIMPLE TEST: Botão de log clicado!');
          alert('Log funcionando!');
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginLeft: '10px'
        }}
      >
        Teste Log
      </button>
    </div>
  );
}