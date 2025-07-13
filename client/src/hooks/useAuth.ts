import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always refetch to get fresh auth state
    gcTime: 0, // Don't cache the response (TanStack Query v5)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5000, // Refetch every 5 seconds to catch auth changes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}