import { useState } from "react";

interface MutationOptions {
  path?: string;
  method?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useMutation({ method = "POST", onSuccess, onError }: MutationOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async ({ path, data }: { path: string; data?: any }) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(path, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Mutation failed");
      }

      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}
