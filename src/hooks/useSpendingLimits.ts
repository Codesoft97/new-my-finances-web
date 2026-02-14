import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { spendingLimitService } from '@/services/api';
import { SpendingLimit } from '@/types';

export const spendingLimitKeys = {
  all: ['spending-limits'] as const,
  lists: () => [...spendingLimitKeys.all, 'list'] as const,
};

interface SpendingLimitsData {
  spendingLimits: SpendingLimit[];
}

interface CreateSpendingLimitData {
  amount: number;
  categoryId: string;
  startDate: string;
  endDate: string;
}

interface UpdateSpendingLimitData {
  amount?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export function useSpendingLimits(options?: { enabled?: boolean }) {
  return useQuery<SpendingLimitsData>({
    queryKey: spendingLimitKeys.lists(),
    queryFn: spendingLimitService.list,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateSpendingLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSpendingLimitData) => spendingLimitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spendingLimitKeys.lists() });
    },
  });
}

export function useUpdateSpendingLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSpendingLimitData }) =>
      spendingLimitService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spendingLimitKeys.lists() });
    },
  });
}

export function useDeleteSpendingLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => spendingLimitService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spendingLimitKeys.lists() });
    },
  });
}
