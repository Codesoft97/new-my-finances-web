import { useQueryClient } from '@tanstack/react-query';

// Hook to clear all React Query cache - use on logout for security
export function useClearCache() {
  const queryClient = useQueryClient();

  const clearAllCache = () => {
    queryClient.clear();
  };

  return { clearAllCache };
}
