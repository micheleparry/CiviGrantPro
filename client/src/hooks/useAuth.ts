import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: 1, // Only retry once
    staleTime: Infinity, // Keep data fresh indefinitely
    gcTime: Infinity, // Never remove from cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
    // Custom query function that handles 401 errors gracefully
    queryFn: async () => {
      const response = await fetch("/api/auth/user");
      if (response.status === 401) {
        // Expected for logged-out users - return null instead of throwing
        return null;
      }
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}