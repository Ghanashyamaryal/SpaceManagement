import { useFetch } from "./useFetch";

interface DataTableOptions {
  path: string;
  queryKey?: string;
  defaultOrder?: string;
}

export function useDataTable({ path }: DataTableOptions) {
  // Using the existing useFetch hook which takes a URL string
  const { data, loading, error } = useFetch<any>(path);
  
  const refetch = () => {
    // Since our useFetch doesn't support manual refetch yet, 
    // we use a full page reload or we could trigger a state change if needed.
    window.location.reload();
  };

  return {
    data,
    isLoading: loading,
    error,
    refetch
  };
}
