import React from 'react';
import { useHotelRooms, useHotelReservations, useHotelCheckins, useHotelConsumption, useHotelConsumptionItems } from '../../hooks/useHotel';
import { useProfessional } from '../../hooks/useProfessional';

const HookStatusTest: React.FC = () => {
  const { professionalId, loading: professionalLoading, error: professionalError } = useProfessional();
  
  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    fetchRooms
  } = useHotelRooms();
  
  const {
    reservations,
    loading: reservationsLoading,
    error: reservationsError,
    fetchReservations
  } = useHotelReservations();
  
  const {
    checkins,
    loading: checkinsLoading,
    error: checkinsError,
    fetchCheckins
  } = useHotelCheckins();
  
  const {
    consumption,
    loading: consumptionLoading,
    error: consumptionError,
    fetchConsumption
  } = useHotelConsumption();
  
  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    fetchItems
  } = useHotelConsumptionItems();

  React.useEffect(() => {
    console.log('🔍 [HookStatusTest] Professional ID:', professionalId);
    console.log('🔍 [HookStatusTest] Professional Loading:', professionalLoading);
    console.log('🔍 [HookStatusTest] Professional Error:', professionalError);
    
    if (professionalId) {
      console.log('🔍 [HookStatusTest] Iniciando fetch de dados...');
      fetchRooms(professionalId);
      fetchReservations(professionalId);
      fetchCheckins(professionalId);
      fetchConsumption(professionalId);
      fetchItems();
    }
  }, [professionalId, professionalLoading, professionalError]);

  const handleRefreshAll = () => {
    if (professionalId) {
      console.log('🔄 [HookStatusTest] Atualizando todos os dados...');
      fetchRooms(professionalId);
      fetchReservations(professionalId);
      fetchCheckins(professionalId);
      fetchConsumption(professionalId);
      fetchItems();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Status dos Hooks do Hotel</h1>
        <button
          onClick={handleRefreshAll}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!professionalId}
        >
          Atualizar Todos os Dados
        </button>
      </div>

      {/* Professional Status */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Professional</h2>
        <div className="text-sm">
          <p><strong>ID:</strong> {professionalId || 'Não carregado'}</p>
          <p><strong>Loading:</strong> {professionalLoading ? 'Sim' : 'Não'}</p>
          <p><strong>Error:</strong> {professionalError || 'Nenhum'}</p>
          {professionalError && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              <strong>Erro:</strong> {professionalError}
            </div>
          )}
        </div>
      </div>

      {/* Rooms Status */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Quartos</h2>
        <div className="text-sm">
          <p><strong>Loading:</strong> {roomsLoading ? 'Sim' : 'Não'}</p>
          <p><strong>Error:</strong> {roomsError || 'Nenhum'}</p>
          <p><strong>Dados:</strong> {rooms.length} quartos carregados</p>
          {roomsError && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              <strong>Erro:</strong> {roomsError}
            </div>
          )}
        </div>
      </div>

      {/* Reservations Status */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Reservas</h2>
        <div className="text-sm">
          <p><strong>Loading:</strong> {reservationsLoading ? 'Sim' : 'Não'}</p>
          <p><strong>Error:</strong> {reservationsError || 'Nenhum'}</p>
          <p><strong>Dados:</strong> {reservations.length} reservas carregadas</p>
          {reservationsError && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              <strong>Erro:</strong> {reservationsError}
            </div>
          )}
        </div>
      </div>

      {/* Check-ins Status */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Check-ins</h2>
        <div className="text-sm">
          <p><strong>Loading:</strong> {checkinsLoading ? 'Sim' : 'Não'}</p>
          <p><strong>Error:</strong> {checkinsError || 'Nenhum'}</p>
          <p><strong>Dados:</strong> {checkins.length} check-ins carregados</p>
          {checkinsError && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              <strong>Erro:</strong> {checkinsError}
            </div>
          )}
        </div>
      </div>

      {/* Consumption Status */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Consumo</h2>
        <div className="text-sm">
          <p><strong>Loading:</strong> {consumptionLoading ? 'Sim' : 'Não'}</p>
          <p><strong>Error:</strong> {consumptionError || 'Nenhum'}</p>
          <p><strong>Dados:</strong> {consumption.length} registros de consumo carregados</p>
          {consumptionError && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              <strong>Erro:</strong> {consumptionError}
            </div>
          )}
        </div>
      </div>

      {/* Consumption Items Status */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Itens de Consumo</h2>
        <div className="text-sm">
          <p><strong>Loading:</strong> {itemsLoading ? 'Sim' : 'Não'}</p>
          <p><strong>Error:</strong> {itemsError || 'Nenhum'}</p>
          <p><strong>Dados:</strong> {items.length} itens carregados</p>
          {itemsError && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              <strong>Erro:</strong> {itemsError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HookStatusTest;