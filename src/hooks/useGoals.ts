import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/api';
import { Goal } from '@/types';

// Query Keys
export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
};

interface CreateGoalData {
  description: string;
  totalAmount: number;
  targetDate: string;
  initialAmount?: number;
  color: string;
}

interface GoalsData {
  goals: Goal[];
}

// Query: Get all goals
export function useGoals(options?: { enabled?: boolean }) {
  return useQuery<GoalsData>({
    queryKey: goalKeys.lists(),
    queryFn: goalService.list,
    enabled: options?.enabled ?? true,
  });
}

// Mutation: Create goal
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalData) => goalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

// Mutation: Update goal
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGoalData> }) =>
      goalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

// Mutation: Delete goal
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}
