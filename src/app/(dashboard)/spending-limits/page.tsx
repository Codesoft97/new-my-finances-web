'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Crown, BadgeCheck, BadgeX, Wallet, MoreVertical } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CurrencyInput from '@/components/ui/CurrencyInput';
import SearchableSelect from '@/components/ui/SearchableSelect';
import MonthSelector from '@/components/ui/MonthSelector';
import { useCategories } from '@/hooks/useCategories';
import {
  useSpendingLimits,
  useCreateSpendingLimit,
  useUpdateSpendingLimit,
  useDeleteSpendingLimit
} from '@/hooks/useSpendingLimits';
import { useAuth } from '@/contexts/AuthContext';
import { isPremiumFamily } from '@/utils/billing';
import {
  buildMonthlySpendingLimitRange,
  SpendingLimitStartTiming,
  isSpendingLimitInPeriod,
} from '@/utils/spendingLimits';
import { toast } from 'sonner';
import { toastApiError } from '@/utils/notifications';
import { SpendingLimit } from '@/types';

interface SpendingLimitFormData {
  amount: string;
  categoryId: string;
  startDate: string;
  endDate: string;
}

type LimitDurationOption = 1 | 3 | 6 | 12;

const START_TIMING_OPTIONS: Array<{ value: SpendingLimitStartTiming; label: string; description: string }> = [
  { value: 'current-month', label: 'Neste mês', description: 'Inicia no mês atual' },
  { value: 'next-month', label: 'Proximo mês', description: 'Inicia no mês seguinte' },
];

const DURATION_OPTIONS: Array<{ value: LimitDurationOption; label: string }> = [
  { value: 1, label: '1 mês' },
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '1 ano' },
];

const DEFAULT_START_TIMING: SpendingLimitStartTiming = 'current-month';
const DEFAULT_DURATION_MONTHS: LimitDurationOption = 12;

interface NormalizedSpendingLimit {
  id: string;
  seriesId: string | null;
  amount: number;
  spentAmount: number;
  periodYear?: number;
  periodMonth?: number;
  category: {
    id: string;
    name: string;
    color: string;
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const toInputDate = (value: string) => {
  if (!value) return '';
  return value.split('T')[0];
};

const getDefaultDateRange = () => {
  return buildMonthlySpendingLimitRange(DEFAULT_START_TIMING, DEFAULT_DURATION_MONTHS);
};

const getDefaultFormValues = (): SpendingLimitFormData => {
  const { startDate, endDate } = getDefaultDateRange();

  return {
    amount: '',
    categoryId: '',
    startDate,
    endDate,
  };
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (value: string) => {
  const [year, month, day] = toInputDate(value).split('-');
  if (!year || !month || !day) return '-';
  return `${day}/${month}/${year}`;
};

const MONTH_LABELS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formatPeriodLabel = (periodMonth?: number, periodYear?: number) => {
  if (!periodMonth || !periodYear || periodMonth < 1 || periodMonth > 12) return null;
  return `${MONTH_LABELS_SHORT[periodMonth - 1]}/${periodYear}`;
};

const calculateLimitProgress = (spentAmount: number, amount: number) => {
  if (amount <= 0) {
    return {
      percentage: 0,
      width: 0,
      isOverLimit: false,
    };
  }

  const rawPercentage = (spentAmount / amount) * 100;
  const percentage = Number.isFinite(rawPercentage) ? Math.max(rawPercentage, 0) : 0;

  return {
    percentage,
    width: Math.min(percentage, 100),
    isOverLimit: percentage > 100,
  };
};

const normalizeSpendingLimit = (limit: SpendingLimit, fallbackId: string): NormalizedSpendingLimit | null => {
  const id = limit.id || limit._id || fallbackId;
  const seriesId = typeof limit.seriesId === 'string' || limit.seriesId === null ? limit.seriesId : null;
  const categoryFromCategoryId =
    typeof limit.categoryId === 'object' && limit.categoryId !== null ? limit.categoryId : undefined;
  const category = limit.category || categoryFromCategoryId;

  if (!category) return null;

  const categoryId = category.id || category._id || (typeof limit.categoryId === 'string' ? limit.categoryId : '');

  return {
    id,
    seriesId,
    amount: limit.amount,
    spentAmount: typeof limit.spentAmount === 'number' ? limit.spentAmount : 0,
    periodYear: typeof limit.periodYear === 'number' ? limit.periodYear : undefined,
    periodMonth: typeof limit.periodMonth === 'number' ? limit.periodMonth : undefined,
    category: {
      id: categoryId,
      name: category.name || 'Categoria',
      color: category.color || '#6B7280',
    },
    startDate: limit.startDate,
    endDate: limit.endDate,
    isActive: Boolean(limit.isActive),
  };
};

export default function SpendingLimitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<NormalizedSpendingLimit | null>(null);
  const [startTiming, setStartTiming] = useState<SpendingLimitStartTiming>(DEFAULT_START_TIMING);
  const [durationMonths, setDurationMonths] = useState<LimitDurationOption>(DEFAULT_DURATION_MONTHS);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLimit, setDeletingLimit] = useState<NormalizedSpendingLimit | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const router = useRouter();
  const { family, loading: authLoading, refreshFamily } = useAuth();
  const isPremium = isPremiumFamily(family);

  const { data: spendingLimitsData, isLoading, error } = useSpendingLimits({ enabled: isPremium });
  const { data: categoriesData } = useCategories('expense');
  const createMutation = useCreateSpendingLimit();
  const updateMutation = useUpdateSpendingLimit();
  const deleteMutation = useDeleteSpendingLimit();

  const isForbidden = (error as { response?: { status?: number } } | null)?.response?.status === 403;
  const showPaywall = !isPremium || isForbidden;
  const expenseCategories = categoriesData?.categories ?? [];

  useEffect(() => {
    refreshFamily();
  }, [refreshFamily]);

  const spendingLimits = useMemo(() => {
    const rawLimits = spendingLimitsData?.spendingLimits ?? [];
    const normalizedLimits = rawLimits
      .map((limit, index) => normalizeSpendingLimit(limit, `spending-limit-${index}`))
      .filter((limit): limit is NormalizedSpendingLimit => limit !== null);

    return normalizedLimits.sort((a, b) => {
      const yearDiff = (b.periodYear ?? 0) - (a.periodYear ?? 0);
      if (yearDiff !== 0) return yearDiff;

      const monthDiff = (b.periodMonth ?? 0) - (a.periodMonth ?? 0);
      if (monthDiff !== 0) return monthDiff;

      return toInputDate(b.startDate).localeCompare(toInputDate(a.startDate));
    });
  }, [spendingLimitsData?.spendingLimits]);

  const spendingLimitsForSelectedMonth = useMemo(
    () => spendingLimits.filter((limit) => isSpendingLimitInPeriod(limit, selectedMonth, selectedYear)),
    [spendingLimits, selectedMonth, selectedYear]
  );

  const selectedPeriodLabel = formatPeriodLabel(selectedMonth, selectedYear) ?? `${selectedMonth}/${selectedYear}`;

  const categoryOptions = expenseCategories.map((category) => ({
    id: category._id,
    label: category.name,
    color: category.color,
  }));

  const { handleSubmit, control, reset, formState: { errors } } = useForm<SpendingLimitFormData>({
    defaultValues: getDefaultFormValues(),
  });
  const selectedCreateRange = useMemo(
    () => buildMonthlySpendingLimitRange(startTiming, durationMonths),
    [startTiming, durationMonths]
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLimit(null);
    setStartTiming(DEFAULT_START_TIMING);
    setDurationMonths(DEFAULT_DURATION_MONTHS);
    reset(getDefaultFormValues());
  };

  const openCreateModal = () => {
    setEditingLimit(null);
    setStartTiming(DEFAULT_START_TIMING);
    setDurationMonths(DEFAULT_DURATION_MONTHS);
    reset(getDefaultFormValues());
    setIsModalOpen(true);
  };

  const handleEdit = (limit: NormalizedSpendingLimit) => {
    setEditingLimit(limit);
    reset({
      amount: String(limit.amount),
      categoryId: limit.category.id,
      startDate: toInputDate(limit.startDate),
      endDate: toInputDate(limit.endDate),
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: SpendingLimitFormData) => {
    const parsedAmount = parseFloat(formData.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.warning('Valor do limite deve ser maior que zero.');
      return;
    }

    try {
      if (editingLimit) {
        await updateMutation.mutateAsync({
          id: editingLimit.id,
          data: {
            amount: parsedAmount,
          },
        });
      } else {
        const payload = {
          amount: parsedAmount,
          categoryId: formData.categoryId,
          startDate: selectedCreateRange.startDate,
          endDate: selectedCreateRange.endDate,
        };

        const createResponse = await createMutation.mutateAsync(payload) as {
          totalCreated?: number;
          spendingLimits?: unknown[];
        };

        const totalCreated = typeof createResponse.totalCreated === 'number'
          ? createResponse.totalCreated
          : Array.isArray(createResponse.spendingLimits)
            ? createResponse.spendingLimits.length
            : 1;

        if (totalCreated > 1) {
          toast.success(`${totalCreated} limites mensais foram criados para o periodo informado.`);
        }
      }

      closeModal();
    } catch (mutationError: unknown) {
      toastApiError(mutationError, 'Erro ao salvar limite de gasto.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingLimit) return;

    try {
      await deleteMutation.mutateAsync(deletingLimit.id);
      setIsDeleteModalOpen(false);
      setDeletingLimit(null);
    } catch (mutationError: unknown) {
      toastApiError(mutationError, 'Erro ao excluir limite de gasto.');
    }
  };

  const formLoading = createMutation.isPending || updateMutation.isPending;
  const deleteLoading = deleteMutation.isPending;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-medium text-[var(--color-text)] mb-1">
              Limites de gastos
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Defina um teto por categoria para controlar despesas
            </p>
          </div>
          {showPaywall ? (
            <Button onClick={() => router.push('/premium')} className="flex items-center gap-2">
              <Crown size={20} />
              Assinar Premium
            </Button>
          ) : (
            <Button
              onClick={openCreateModal}
              className="flex items-center gap-2"
              disabled={expenseCategories.length === 0}
            >
              <Plus size={20} />
              Novo limite
            </Button>
          )}
        </div>

        {!authLoading && !showPaywall && !isLoading && spendingLimits.length > 0 && (
          <div className="mb-6 bg-[var(--color-bg-card)] rounded-md border border-[var(--color-border)] p-3">
            <MonthSelector
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={(month, year) => {
                setSelectedMonth(month);
                setSelectedYear(year);
              }}
            />
          </div>
        )}

        {authLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : showPaywall ? (
          <div className="text-center py-10 bg-[var(--color-bg-card)] rounded-md border border-[var(--color-border)]">
            <div className="w-16 h-16 bg-[var(--color-action)]/10 rounded-md flex items-center justify-center mx-auto mb-4">
              <Crown size={32} className="text-[var(--color-action)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">
              Limites de gastos sao do Plano Premium
            </h3>
            <p className="text-[var(--color-text-muted)] max-w-lg mx-auto mb-6">
              Defina um limite mensal por categoria e acompanhe facilmente quando o período estiver ativo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/premium')} className="flex items-center gap-2">
                <Crown size={18} />
                Ver planos Premium
              </Button>
              <Button onClick={() => router.push('/transactions')} variant="outline">
                Continuar sem limites
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : spendingLimits.length === 0 ? (
          <div className="text-center py-10 bg-[var(--color-bg-card)] rounded-md border border-[var(--color-border)]">
            <div className="w-16 h-16 bg-[var(--color-bg-elevated)] rounded-md flex items-center justify-center mx-auto mb-4">
              <Wallet size={32} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-base font-medium text-[var(--color-text)] mb-2">
              Nenhum limite cadastrado
            </h3>
            <p className="text-[var(--color-text-muted)] max-w-md mx-auto mb-6">
              Crie limites por categoria para monitorar os gastos dentro do periodo desejado.
            </p>
            {expenseCategories.length === 0 ? (
              <p className="text-sm text-[var(--color-warning)]">
                Crie ao menos uma categoria de despesa antes de cadastrar limites.
              </p>
            ) : (
              <Button onClick={openCreateModal} variant="outline">
                Criar primeiro limite
              </Button>
              )}
          </div>
        ) : spendingLimitsForSelectedMonth.length === 0 ? (
          <div className="text-center py-10 bg-[var(--color-bg-card)] rounded-md border border-[var(--color-border)]">
            <div className="w-16 h-16 bg-[var(--color-bg-elevated)] rounded-md flex items-center justify-center mx-auto mb-4">
              <Wallet size={32} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-base font-medium text-[var(--color-text)] mb-2">
              Nenhum limite em {selectedPeriodLabel}
            </h3>
            <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
              Navegue entre os meses para visualizar os limites cadastrados em outros periodos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spendingLimitsForSelectedMonth.map((limit) => {
              const progress = calculateLimitProgress(limit.spentAmount, limit.amount);
              const remainingAmount = limit.amount - limit.spentAmount;
              const periodLabel = formatPeriodLabel(limit.periodMonth, limit.periodYear);

              return (
                <div
                  key={limit.id}
                  className="bg-[var(--color-bg-card)] rounded-md p-4 border border-[var(--color-border)] border-l-2"
                  style={{ borderLeftColor: limit.category.color }}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: limit.category.color }}
                      >
                        <Wallet size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-[var(--color-text)]">{limit.category.name}</h3>
                        {periodLabel ? (
                          <>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              Competencia: {periodLabel}
                            </p>
                            <p className="text-[10px] text-[var(--color-text-muted)]">
                              Serie: {formatDate(limit.startDate)} ate {formatDate(limit.endDate)}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {formatDate(limit.startDate)} ate {formatDate(limit.endDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === limit.id ? null : limit.id)}
                          onBlur={() => setTimeout(() => setMenuOpenId(null), 200)}
                          className="p-2 -mr-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-bg-elevated)] rounded-md transition-colors"
                        >
                          <MoreVertical size={20} />
                        </button>

                        {menuOpenId === limit.id && (
                          <div className="absolute right-0 mt-2 w-36 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md shadow-sm z-10 overflow-hidden">
                            <button
                              onClick={() => {
                                handleEdit(limit);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-bg-card)] transition-colors text-left"
                            >
                              <Pencil size={16} />
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setDeletingLimit(limit);
                                setIsDeleteModalOpen(true);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-danger)] cursor-pointer hover:bg-[var(--color-danger)]/10 transition-colors text-left"
                            >
                              <Trash2 size={16} />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-2xl font-medium text-[var(--color-text)] mb-3">
                    {formatCurrency(limit.amount)}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--color-text-secondary)]">Progresso do limite</span>
                      <span className={`font-medium ${progress.isOverLimit ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)]'}`}>
                        {progress.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[var(--color-bg-elevated)] rounded-sm h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-sm transition-all duration-500"
                        style={{
                          width: `${progress.width}%`,
                          backgroundColor: progress.isOverLimit ? 'var(--color-danger)' : limit.category.color
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Ja gasto</p>
                      <p className="font-medium text-[var(--color-danger)]">{formatCurrency(limit.spentAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--color-text-muted)]">Restante</p>
                      <p className={`font-medium ${remainingAmount < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                        {formatCurrency(remainingAmount)}
                      </p>
                    </div>
                  </div>

                  {progress.isOverLimit && (
                    <div className="mt-2 text-xs text-center bg-[var(--color-danger)]/10 py-1 rounded px-2 text-[var(--color-danger)]">
                      Ultrapassado em <strong>{formatCurrency(limit.spentAmount - limit.amount)}</strong>
                    </div>
                  )}

                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-sm px-2 py-1 ${limit.isActive
                        ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                        : 'bg-[var(--color-text-muted)]/15 text-[var(--color-text-secondary)]'
                        }`}
                    >
                      {limit.isActive ? <BadgeCheck size={14} /> : <BadgeX size={14} />}
                      {limit.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingLimit ? 'Editar limite de gasto' : 'Novo limite de gasto'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="amount"
              control={control}
            rules={{
              required: 'Valor do limite é obrigatorio',
              validate: (value) => parseFloat(value || '0') > 0 || 'Valor deve ser maior que zero',
            }}
              render={({ field: { onChange, value } }) => (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-[var(--color-text)]">
                    Valor do limite
                  </label>
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-sm px-2 py-1">
                    Mensal
                  </span>
                </div>
                <CurrencyInput
                  value={value}
                  onChange={onChange}
                  error={errors.amount?.message}
                  placeholder="0,00"
                />
              </div>
            )}
          />

          {!editingLimit && (
            <Controller
              name="categoryId"
              control={control}
            rules={{ required: 'Categoria de despesa é obrigatória' }}
            render={({ field: { onChange, value } }) => (
                <SearchableSelect
                  label="Categoria de despesa"
                  options={categoryOptions}
                  value={value}
                  onChange={onChange}
                  placeholder="Selecione a categoria"
                  error={errors.categoryId?.message}
                />
            )}
            />
          )}

          {!editingLimit ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)] mb-2">
                  Quando deseja iniciar este limite mensal?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {START_TIMING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStartTiming(option.value)}
                      className={`text-left p-3 rounded-md border transition-colors cursor-pointer ${
                        startTiming === option.value
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                          : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                      }`}
                    >
                      <p className={`text-sm font-medium ${
                        startTiming === option.value
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-text)]'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--color-text)] mb-2">
                  Por quanto tempo deseja manter o limite ativo?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDurationMonths(option.value)}
                      className={`p-3 rounded-md border text-sm font-medium transition-colors cursor-pointer ${
                        durationMonths === option.value
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-border-hover)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Periodo gerado automaticamente para envio:
                </p>
                <p className="text-sm font-medium text-[var(--color-text)] mt-1">
                  {formatDate(selectedCreateRange.startDate)} até {formatDate(selectedCreateRange.endDate)}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Ser{durationMonths === 1 ? 'a criado' : 'ão criados'} {durationMonths} limite{durationMonths > 1 ? 's' : ''} {durationMonths > 1 ? 'mensais' : 'mensal'}.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] space-y-1.5">
              <p className="text-xs text-[var(--color-text-secondary)]">
                Na edicao, apenas o valor mensal pode ser alterado.
              </p>
              <p className="text-sm text-[var(--color-text)]">
                Categoria: <strong>{editingLimit.category.name}</strong>
              </p>
              <p className="text-sm text-[var(--color-text)]">
                Periodo da serie: <strong>{formatDate(editingLimit.startDate)} ate {formatDate(editingLimit.endDate)}</strong>
              </p>
            </div>
          )}

          {editingLimit && (
            <div className="p-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
              <p className="text-sm font-medium text-[var(--color-text)] mb-1">Status atual</p>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-sm px-2 py-1 ${editingLimit.isActive
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  : 'bg-[var(--color-text-muted)]/15 text-[var(--color-text-secondary)]'
                  }`}
              >
                {editingLimit.isActive ? <BadgeCheck size={14} /> : <BadgeX size={14} />}
                {editingLimit.isActive ? 'Ativo' : 'Inativo'}
              </span>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Este status e calculado automaticamente com base no intervalo de datas.
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                As alteracoes de valor sao aplicadas a toda a serie mensal do periodo.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth disabled={formLoading}>
              {formLoading ? 'Salvando...' : (editingLimit ? 'Salvar alteracoes' : 'Criar limite')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingLimit(null);
        }}
        title="Excluir limite em todo o periodo"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            Tem certeza que deseja excluir este limite da categoria <strong className="text-[var(--color-text)]">{deletingLimit?.category.name}</strong> em todo o periodo?
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Todos os meses da serie serao removidos e esta acao nao pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingLimit(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              fullWidth
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
