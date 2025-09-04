import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAsyncOperationOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export function useAsyncOperation<T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operação realizada com sucesso!',
    errorMessage = 'Erro ao realizar operação'
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await operation();
      setData(result);
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      setError(errorMsg);
      
      if (showErrorToast) {
        toast.error(errorMsg);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [showSuccessToast, showErrorToast, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

// Hook específico para operações de formulário
export function useFormSubmission<T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> & {
  isSubmitting: boolean;
  submitForm: (operation: () => Promise<T>) => Promise<T | null>;
} {
  const asyncOp = useAsyncOperation<T>({
    showSuccessToast: true,
    showErrorToast: true,
    ...options
  });

  return {
    ...asyncOp,
    isSubmitting: asyncOp.loading,
    submitForm: asyncOp.execute
  };
}

// Hook para operações de fetch/carregamento de dados
export function useDataFetching<T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> & {
  isFetching: boolean;
  fetchData: (operation: () => Promise<T>) => Promise<T | null>;
  refetch: (operation: () => Promise<T>) => Promise<T | null>;
} {
  const asyncOp = useAsyncOperation<T>({
    showSuccessToast: false,
    showErrorToast: true,
    errorMessage: 'Erro ao carregar dados',
    ...options
  });

  return {
    ...asyncOp,
    isFetching: asyncOp.loading,
    fetchData: asyncOp.execute,
    refetch: asyncOp.execute
  };
}

// Hook para operações de delete
export function useDeleteOperation<T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> & {
  isDeleting: boolean;
  deleteItem: (operation: () => Promise<T>) => Promise<T | null>;
} {
  const asyncOp = useAsyncOperation<T>({
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Item excluído com sucesso!',
    errorMessage: 'Erro ao excluir item',
    ...options
  });

  return {
    ...asyncOp,
    isDeleting: asyncOp.loading,
    deleteItem: asyncOp.execute
  };
}