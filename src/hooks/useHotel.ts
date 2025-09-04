import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useProfessional, useAwaitProfessional } from './useProfessional';
import {
  hotelRoomsApiService,
  hotelReservationsApiService,
  hotelCheckinsApiService,
  hotelConsumptionApiService
} from '../services/hotelApiService';
import {
  hotelConsumptionItemsService,
  hotelDashboardService
} from '../services/hotelService';
import type { Database } from '../lib/supabase';

type HotelRoom = Database['public']['Tables']['hotel_rooms']['Row'];
type HotelRoomInsert = Database['public']['Tables']['hotel_rooms']['Insert'];
type HotelRoomUpdate = Database['public']['Tables']['hotel_rooms']['Update'];

type HotelReservation = Database['public']['Tables']['hotel_reservations']['Row'];
type HotelReservationInsert = Database['public']['Tables']['hotel_reservations']['Insert'];
type HotelReservationUpdate = Database['public']['Tables']['hotel_reservations']['Update'];

type HotelCheckin = Database['public']['Tables']['hotel_checkins']['Row'];
type HotelCheckinInsert = Database['public']['Tables']['hotel_checkins']['Insert'];
type HotelCheckinUpdate = Database['public']['Tables']['hotel_checkins']['Update'];

type HotelConsumption = Database['public']['Tables']['hotel_consumption']['Row'];
type HotelConsumptionInsert = Database['public']['Tables']['hotel_consumption']['Insert'];

type HotelConsumptionItem = Database['public']['Tables']['hotel_consumption_items']['Row'];

// Hook for managing hotel rooms
export function useHotelRooms() {
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { professionalId, loading: professionalLoading, error: professionalError } = useProfessional();

  const fetchRooms = async () => {
    if (!professionalId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await hotelRoomsApiService.getAll(professionalId);
      setRooms(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar quartos';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomData: Omit<HotelRoom, 'id' | 'created_at' | 'updated_at'>) => {
    if (!professionalId) {
      toast.error('Professional ID não encontrado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const roomDataWithProfessional = {
        ...roomData,
        professional_id: professionalId,
        is_active: true
      };
      
      const newRoom = await hotelRoomsApiService.create(roomDataWithProfessional);
      
      setRooms(prev => [...prev, newRoom]);
      toast.success('Quarto criado com sucesso!');
      return newRoom;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar quarto';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRoom = async (id: string, updates: HotelRoomUpdate) => {
    try {
      setLoading(true);
      const updatedRoom = await hotelRoomsApiService.update(id, updates);
      setRooms(prev => prev.map(room => room.id === id ? updatedRoom : room));
      toast.success('Quarto atualizado com sucesso!');
      return updatedRoom;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar quarto';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      setLoading(true);
      await hotelRoomsApiService.delete(id);
      setRooms(prev => prev.filter(room => room.id !== id));
      toast.success('Quarto excluído com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir quarto';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRooms = async (checkIn: string, checkOut: string, roomType?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await hotelRoomsApiService.getAvailable(checkIn, checkOut, roomType);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar quartos disponíveis';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (professionalId) {
      fetchRooms();
    }
  }, [professionalId]);

  return {
    rooms,
    loading: loading || professionalLoading,
    error: error || professionalError,
    professionalId,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    getAvailableRooms,
    refreshRooms: fetchRooms,
  };
}

// Hook for managing hotel reservations
export function useHotelReservations() {
  const [reservations, setReservations] = useState<(HotelReservation & { hotel_rooms: HotelRoom })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { professionalId, loading: professionalLoading, error: professionalError } = useProfessional();

  const fetchReservations = async () => {
    if (!professionalId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await hotelReservationsApiService.getAll(professionalId);
      setReservations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar reservas';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservationData: HotelReservationInsert) => {
    try {
      setLoading(true);
      const newReservation = await hotelReservationsApiService.create(reservationData);
      await fetchReservations(); // Refresh to get room data
      toast.success('Reserva criada com sucesso!');
      return newReservation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar reserva';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReservation = async (id: string, updates: HotelReservationUpdate) => {
    try {
      setLoading(true);
      const updatedReservation = await hotelReservationsApiService.update(id, updates);
      await fetchReservations(); // Refresh to get updated data
      toast.success('Reserva atualizada com sucesso!');
      return updatedReservation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar reserva';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      setLoading(true);
      await hotelReservationsService.cancel(id);
      await fetchReservations(); // Refresh to get updated data
      toast.success('Reserva cancelada com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar reserva';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (professionalId) {
      fetchReservations();
    }
  }, [professionalId]);

  return {
    reservations,
    loading: loading || professionalLoading,
    error: error || professionalError,
    professionalId,
    fetchReservations,
    createReservation,
    updateReservation,
    cancelReservation,
  };
}

// Hook for managing hotel check-ins
export function useHotelCheckins() {
  const [checkins, setCheckins] = useState<(HotelCheckin & { hotel_reservations: HotelReservation & { hotel_rooms: HotelRoom } })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { professionalId, loading: professionalLoading, error: professionalError } = useProfessional();

  const fetchCheckins = async () => {
    if (!professionalId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await hotelCheckinsApiService.getAll(professionalId);
      setCheckins(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar check-ins';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createCheckin = async (checkinData: HotelCheckinInsert) => {
    try {
      setLoading(true);
      const newCheckin = await hotelCheckinsApiService.create(checkinData);
      await fetchCheckins(); // Refresh to get full data
      toast.success('Check-in realizado com sucesso!');
      return newCheckin;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar check-in';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCheckin = async (id: string, updates: HotelCheckinUpdate) => {
    try {
      setLoading(true);
      const updatedCheckin = await hotelCheckinsService.update(id, updates);
      await fetchCheckins(); // Refresh to get updated data
      toast.success('Check-in atualizado com sucesso!');
      return updatedCheckin;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar check-in';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processCheckout = async (id: string, checkoutData: { actual_check_out?: string; final_amount?: number; notes?: string }) => {
    try {
      setLoading(true);
      await hotelCheckinsService.performCheckout(id, checkoutData);
      await fetchCheckins(); // Refresh to get updated data
      toast.success('Check-out realizado com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar check-out';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (professionalId) {
      fetchCheckins();
    }
  }, [professionalId]);

  return {
    checkins,
    loading: loading || professionalLoading,
    error: error || professionalError,
    professionalId,
    fetchCheckins,
    createCheckin,
    updateCheckin,
    processCheckout,
  };
}

// Hook for managing hotel consumption
export function useHotelConsumption() {
  const [consumption, setConsumption] = useState<(HotelConsumption & { 
    hotel_reservations: HotelReservation & { hotel_rooms: HotelRoom } 
  })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { professionalId, loading: professionalLoading, error: professionalError } = useProfessional();

  const fetchConsumption = async () => {
    if (!professionalId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await hotelConsumptionApiService.getAll(professionalId);
      setConsumption(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar consumo';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createConsumption = async (consumptionData: HotelConsumptionInsert) => {
    try {
      setLoading(true);
      const newConsumption = await hotelConsumptionApiService.create(consumptionData);
      await fetchConsumption(); // Refresh to get full data
      toast.success('Consumo registrado com sucesso!');
      return newConsumption;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar consumo';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConsumption = async (id: string, updates: Partial<HotelConsumptionInsert>) => {
    try {
      setLoading(true);
      const updatedConsumption = await hotelConsumptionService.update(id, updates);
      await fetchConsumption(); // Refresh to get updated data
      toast.success('Consumo atualizado com sucesso!');
      return updatedConsumption;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar consumo';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteConsumption = async (id: string) => {
    try {
      setLoading(true);
      await hotelConsumptionService.delete(id);
      setConsumption(prev => prev.filter(item => item.id !== id));
      toast.success('Consumo excluído com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir consumo';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getConsumptionByReservation = async (reservationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await hotelConsumptionService.getByReservation(reservationId);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar consumo da reserva';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = async (reservationId: string): Promise<number> => {
    try {
      const consumptionData = await hotelConsumptionService.getByReservation(reservationId);
      return consumptionData.reduce((total, item) => total + (item.total_price || 0), 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao calcular total do consumo';
      toast.error(message);
      return 0;
    }
  };

  useEffect(() => {
    if (professionalId) {
      fetchConsumption();
    }
  }, [professionalId]);

  return {
    consumption,
    loading: loading || professionalLoading,
    error: error || professionalError,
    professionalId,
    fetchConsumption,
    createConsumption,
    updateConsumption,
    deleteConsumption,
    getConsumptionByReservation,
    getTotalAmount,
  };
}

// Hook for managing hotel consumption items (menu items)
export function useHotelConsumptionItems() {
  const [items, setItems] = useState<HotelConsumptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { professionalId, loading: professionalLoading, error: professionalError } = useProfessional();

  const fetchItems = async () => {
    if (!professionalId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await hotelConsumptionItemsService.getAll(professionalId);
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar itens de consumo';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (professionalId) {
      fetchItems();
    }
  }, [professionalId]);

  return {
    items,
    loading: loading || professionalLoading,
    error: error || professionalError,
    professionalId,
    fetchItems,
  };
}

// Hook for dashboard data
export function useHotelDashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
    todayCheckins: 0,
    todayCheckouts: 0,
    totalRevenue: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { professionalId, loading: professionalLoading, error: professionalError } = useProfessional();

  const fetchStats = async () => {
    if (!professionalId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await hotelDashboardService.getDashboardData(professionalId);
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (professionalId) {
      fetchStats();
      // Refresh stats every 5 minutes
      const interval = setInterval(fetchStats, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [professionalId]);

  const getDashboardData = async (days: number = 30) => {
    // Aguardar o professionalId ser carregado
    let currentProfessionalId = professionalId;
    if (!currentProfessionalId) {
      console.log('⏳ Aguardando professionalId ser carregado...');
      try {
        currentProfessionalId = await useAwaitProfessional();
      } catch (error) {
        console.error('Erro ao obter professionalId:', error);
        throw new Error('Professional ID não encontrado');
      }
    }
    
    if (!currentProfessionalId) {
      throw new Error('Professional ID não encontrado');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      const data = await hotelDashboardService.getDashboardData(
        currentProfessionalId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      // Mapear dados para o formato esperado pelo Dashboard
      const mappedData = {
        totalRooms: data.available_rooms + (data.active_guests > 0 ? Math.ceil(data.active_guests / 2) : 0),
        availableRooms: data.available_rooms,
        occupiedRooms: data.active_guests > 0 ? Math.ceil(data.active_guests / 2) : 0,
        checkedInGuests: data.active_guests,
        occupancyRate: data.occupancy_rate,
        monthlyRevenue: data.period_revenue,
        recentReservations: data.recent_reservations || [],
        recentCheckins: data.recent_checkins || [],
        recentConsumption: data.recent_consumption || []
      };
      
      setStats({
        totalRooms: mappedData.totalRooms,
        occupiedRooms: mappedData.occupiedRooms,
        availableRooms: mappedData.availableRooms,
        maintenanceRooms: 0,
        todayCheckins: mappedData.recentCheckins.length,
        todayCheckouts: 0,
        totalRevenue: mappedData.monthlyRevenue,
        occupancyRate: mappedData.occupancyRate,
      });
      
      return mappedData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading: loading || professionalLoading,
    error: error || professionalError,
    professionalId,
    fetchStats,
    getDashboardData,
  };
}