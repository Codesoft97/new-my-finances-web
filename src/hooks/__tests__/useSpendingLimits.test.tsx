import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  spendingLimitKeys,
  useCreateSpendingLimit,
  useDeleteSpendingLimit,
  useSpendingLimits,
  useUpdateSpendingLimit
} from '../useSpendingLimits';
import { spendingLimitService } from '@/services/api';

jest.mock('@/services/api', () => ({
  spendingLimitService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedSpendingLimitService = spendingLimitService as jest.Mocked<typeof spendingLimitService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
};

describe('useSpendingLimits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches spending limits list', async () => {
    const response = {
      spendingLimits: [
        {
          id: 'limit-1',
          seriesId: 'series-1',
          amount: 500,
          spentAmount: 180,
          periodYear: 2026,
          periodMonth: 2,
          category: { id: 'cat-1', name: 'Alimentacao', color: '#ef4444' },
          startDate: '2026-02-01T00:00:00.000Z',
          endDate: '2026-02-28T00:00:00.000Z',
          isActive: true,
        },
      ],
    };
    mockedSpendingLimitService.list.mockResolvedValueOnce(response as never);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSpendingLimits(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedSpendingLimitService.list).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(response);
  });

  it('creates a spending limit and invalidates list cache', async () => {
    const payload = {
      amount: 700,
      categoryId: 'cat-2',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    };
    mockedSpendingLimitService.create.mockResolvedValueOnce({ spendingLimit: { _id: 'limit-2', ...payload } } as never);

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateSpendingLimit(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(mockedSpendingLimitService.create).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: spendingLimitKeys.lists() });
  });

  it('updates a spending limit and invalidates list cache', async () => {
    const updateData = { amount: 800, endDate: '2026-04-30' };
    mockedSpendingLimitService.update.mockResolvedValueOnce({ _id: 'limit-3', ...updateData } as never);

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateSpendingLimit(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'limit-3', data: updateData });
    });

    expect(mockedSpendingLimitService.update).toHaveBeenCalledWith('limit-3', updateData);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: spendingLimitKeys.lists() });
  });

  it('deletes a spending limit and invalidates list cache', async () => {
    mockedSpendingLimitService.delete.mockResolvedValueOnce({ message: 'ok' } as never);

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteSpendingLimit(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('limit-4');
    });

    expect(mockedSpendingLimitService.delete).toHaveBeenCalledWith('limit-4');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: spendingLimitKeys.lists() });
  });
});
