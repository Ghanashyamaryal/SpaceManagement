import { useFetch as useBaseFetch } from "./useFetch";

interface FetchOptions {
  path: string;
  queryKey?: string;
  enabled?: boolean;
}

export function useFetch<T = any>({ path }: FetchOptions) {
  const { data, loading, error, refetch } = useBaseFetch<T>(path);
  return { 
    data, 
    isLoading: loading, 
    error,
    refetch
  };
}
