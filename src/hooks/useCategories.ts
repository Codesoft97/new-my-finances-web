import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/api';
import { Category } from '@/types';

// Query keys for cache management
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (type?: 'income' | 'expense') => [...categoryKeys.lists(), { type }] as const,
};

interface CategoriesData {
  categories: Category[];
}

// Query: Get all categories or filtered by type
export function useCategories(type?: 'income' | 'expense') {
  return useQuery<CategoriesData>({
    queryKey: categoryKeys.list(type),
    queryFn: () => categoryService.list(type),
  });
}

interface CreateCategoryData {
  name: string;
  color: string;
  type: 'income' | 'expense';
}

// Mutation: Create category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoryService.create(data),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

// Mutation: Delete category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
