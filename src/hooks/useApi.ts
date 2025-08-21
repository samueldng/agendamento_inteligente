import { useState, useEffect } from 'react';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ApiOptions {
  immediate?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useApi<T>(
  endpoint: string,
  options: ApiOptions = { immediate: true }
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [endpoint, options.immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Hook específico para estatísticas do dashboard
export function useDashboardStats() {
  const appointments = useApi<any>('/appointments/stats');
  const clients = useApi<any>('/clients/recent');
  const todayAppointments = useApi<any>('/appointments/today');
  
  return {
    appointments,
    clients,
    todayAppointments,
    refetchAll: () => {
      appointments.refetch();
      clients.refetch();
      todayAppointments.refetch();
    }
  };
}

// Tipos para as estatísticas
export interface AppointmentStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
  revenue: number;
}

export interface TodayAppointment {
  id: string;
  client_name: string;
  service_name: string;
  professional_name: string;
  scheduled_time: string;
  status: string;
}

export interface RecentClient {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  appointments_count: number;
}