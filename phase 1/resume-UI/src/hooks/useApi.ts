import { useState, useCallback } from "react";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiResponse<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseApiResponse<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await apiFunction(...args);
        setState({ data: response, loading: false, error: null });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error
              : new Error("An unknown error occurred"),
        }));
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}
