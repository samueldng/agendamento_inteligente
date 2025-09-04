import { supabase } from '../lib/supabase';
import { HotelRoom, HotelReservation, HotelCheckin, HotelConsumption, HotelConsumptionItem } from '../types/hotel';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Hotel Rooms API Service
export const hotelRoomsApiService = {
  async getAll(professionalId: string): Promise<HotelRoom[]> {
    console.log('🏨 [hotelRoomsApiService.getAll] Iniciando busca de quartos via API', { professionalId });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-rooms?professional_id=${professionalId}`, {
      headers
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelRoomsApiService.getAll] Quartos recebidos via API:', result);
    
    return result.data || [];
  },

  async getById(id: string): Promise<HotelRoom> {
    console.log('🏨 [hotelRoomsApiService.getById] Buscando quarto por ID via API', { id });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-rooms/${id}`, {
      headers
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelRoomsApiService.getById] Quarto recebido via API:', result);
    
    return result.data;
  },

  async create(roomData: Omit<HotelRoom, 'id' | 'created_at' | 'updated_at'>): Promise<HotelRoom> {
    console.log('🏨 [hotelRoomsApiService.create] Criando quarto via API', { roomData });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-rooms`, {
      method: 'POST',
      headers,
      body: JSON.stringify(roomData)
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelRoomsApiService.create] Quarto criado via API:', result);
    
    return result.data;
  },

  async update(id: string, roomData: Partial<HotelRoom>): Promise<HotelRoom> {
    console.log('🏨 [hotelRoomsApiService.update] Atualizando quarto via API', { id, roomData });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-rooms/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(roomData)
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelRoomsApiService.update] Quarto atualizado via API:', result);
    
    return result.data;
  },

  async delete(id: string): Promise<void> {
    console.log('🏨 [hotelRoomsApiService.delete] Deletando quarto via API', { id });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-rooms/${id}`, {
      method: 'DELETE',
      headers
    });
    
    await handleResponse(response);
    console.log('🏨 [hotelRoomsApiService.delete] Quarto deletado via API');
  },

  async getAvailable(checkIn: string, checkOut: string, roomType?: string): Promise<HotelRoom[]> {
    console.log('🏨 [hotelRoomsApiService.getAvailable] Buscando quartos disponíveis via API', { checkIn, checkOut, roomType });
    
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      ...(roomType && { room_type: roomType })
    });
    
    const response = await fetch(`${API_BASE_URL}/hotel-rooms/availability?${params}`, {
      headers
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelRoomsApiService.getAvailable] Quartos disponíveis via API:', result);
    
    return result.data || [];
  }
};

// Hotel Reservations API Service
export const hotelReservationsApiService = {
  async getAll(professionalId: string): Promise<(HotelReservation & { room: HotelRoom })[]> {
    console.log('🏨 [hotelReservationsApiService.getAll] Buscando reservas via API', { professionalId });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-reservations?professional_id=${professionalId}`, {
      headers
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelReservationsApiService.getAll] Reservas recebidas via API:', result);
    
    return result.data || [];
  },

  async getById(id: string): Promise<HotelReservation & { room: HotelRoom }> {
    console.log('🏨 [hotelReservationsApiService.getById] Buscando reserva por ID via API', { id });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-reservations/${id}`, {
      headers
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelReservationsApiService.getById] Reserva recebida via API:', result);
    
    return result.data;
  },

  async create(reservationData: Omit<HotelReservation, 'id' | 'created_at' | 'updated_at'>): Promise<HotelReservation> {
    console.log('🏨 [hotelReservationsApiService.create] Criando reserva via API', { reservationData });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-reservations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reservationData)
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelReservationsApiService.create] Reserva criada via API:', result);
    
    return result.data;
  },

  async update(id: string, reservationData: Partial<HotelReservation>): Promise<HotelReservation> {
    console.log('🏨 [hotelReservationsApiService.update] Atualizando reserva via API', { id, reservationData });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-reservations/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(reservationData)
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelReservationsApiService.update] Reserva atualizada via API:', result);
    
    return result.data;
  }
};

// Hotel Check-ins API Service
export const hotelCheckinsApiService = {
  async getAll(professionalId: string): Promise<(HotelCheckin & { reservation: HotelReservation & { room: HotelRoom } })[]> {
    console.log('🏨 [hotelCheckinsApiService.getAll] Buscando check-ins via API', { professionalId });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-checkins?professional_id=${professionalId}`, {
      headers
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelCheckinsApiService.getAll] Check-ins recebidos via API:', result);
    
    return result.data || [];
  },

  async create(checkinData: Omit<HotelCheckin, 'id' | 'created_at' | 'updated_at'>): Promise<HotelCheckin> {
    console.log('🏨 [hotelCheckinsApiService.create] Criando check-in via API', { checkinData });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-checkins`, {
      method: 'POST',
      headers,
      body: JSON.stringify(checkinData)
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelCheckinsApiService.create] Check-in criado via API:', result);
    
    return result.data;
  }
};

// Hotel Consumption API Service
export const hotelConsumptionApiService = {
  async getAll(professionalId: string): Promise<(HotelConsumption & { item: HotelConsumptionItem, reservation: HotelReservation & { room: HotelRoom } })[]> {
    console.log('🏨 [hotelConsumptionApiService.getAll] Buscando consumo via API', { professionalId });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-consumption?professional_id=${professionalId}`, {
      headers
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelConsumptionApiService.getAll] Consumo recebido via API:', result);
    
    return result.data || [];
  },

  async create(consumptionData: Omit<HotelConsumption, 'id' | 'created_at' | 'updated_at'>): Promise<HotelConsumption> {
    console.log('🏨 [hotelConsumptionApiService.create] Criando consumo via API', { consumptionData });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-consumption`, {
      method: 'POST',
      headers,
      body: JSON.stringify(consumptionData)
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelConsumptionApiService.create] Consumo criado via API:', result);
    
    return result.data;
  }
};

// Hotel Consumption Items API Service
export const hotelConsumptionItemsApiService = {
  async getAll(): Promise<HotelConsumptionItem[]> {
    console.log('🏨 [hotelConsumptionItemsApiService.getAll] Buscando itens de consumo via API');
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-consumption/items`, {
      headers
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelConsumptionItemsApiService.getAll] Itens de consumo recebidos via API:', result);
    
    return result.data || [];
  }
};

// Hotel Dashboard API Service
export const hotelDashboardApiService = {
  async getDashboardData(professionalId: string, period: number = 30): Promise<any> {
    console.log('🏨 [hotelDashboardApiService.getDashboardData] Buscando dados do dashboard via API', { professionalId, period });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-dashboard?professional_id=${professionalId}&period=${period}`, {
      headers
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelDashboardApiService.getDashboardData] Dados do dashboard recebidos via API:', result);
    
    return result.data;
  },

  async getQuickStats(professionalId: string): Promise<any> {
    console.log('🏨 [hotelDashboardApiService.getQuickStats] Buscando estatísticas rápidas via API', { professionalId });
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hotel-dashboard/quick?professional_id=${professionalId}`, {
      headers
    });
    
    const result = await handleResponse(response);
    console.log('🏨 [hotelDashboardApiService.getQuickStats] Estatísticas rápidas recebidas via API:', result);
    
    return result.data;
   }
 };