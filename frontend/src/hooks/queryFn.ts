import { useFetch as useBaseFetch } from "./useFetch";

interface FetchOptions {
  path: string;
  queryKey?: string;
}

export function useFetch<T = any>({ path }: FetchOptions) {
  const { data, loading, error } = useBaseFetch<T>(path);
  return { 
    data, 
    isLoading: loading, 
    error 
  };
}
