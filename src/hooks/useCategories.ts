import { useState, useEffect } from 'react';
import { BusinessCategory, CategoryStats } from '../../api/types';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function useCategories(): ApiResponse<BusinessCategory[]> {
  const [data, setData] = useState<BusinessCategory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

export function useCategoryById(id: string | null): ApiResponse<BusinessCategory> {
  const [data, setData] = useState<BusinessCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

export function useCategoryStats(): ApiResponse<CategoryStats[]> {
  const [data, setData] = useState<CategoryStats[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Função utilitária para criar profissional
export async function createProfessional(professionalData: any) {
  const response = await fetch(`${API_BASE_URL}/professionals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(professionalData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar profissional');
  }

  return response.json();
}

// Função utilitária para atualizar profissional
export async function updateProfessional(id: string, professionalData: any) {
  const response = await fetch(`${API_BASE_URL}/professionals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(professionalData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar profissional');
  }

  return response.json();
}

// Função utilitária para buscar profissionais
export async function fetchProfessionals(categoryId?: string) {
  const url = categoryId 
    ? `${API_BASE_URL}/professionals?category_id=${categoryId}`
    : `${API_BASE_URL}/professionals`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Função utilitária para deletar profissional
export async function deleteProfessional(id: string) {
  const response = await fetch(`${API_BASE_URL}/professionals/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao deletar profissional');
  }

  return response.json();
}