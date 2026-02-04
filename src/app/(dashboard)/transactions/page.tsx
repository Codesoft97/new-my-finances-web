'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Pencil, Trash2, ChevronLeft, ChevronRight, PieChart, Target } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CurrencyInput from '@/components/ui/CurrencyInput';
import Modal from '@/components/ui/Modal';
import MonthSelector from '@/components/ui/MonthSelector';
import { Transaction } from '@/types';
import {
  useTransactions,
  useTransactionSummary,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction
} from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useGoals } from '@/hooks/useGoals';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // React Query hooks
  const { data: transactionsData } = useTransactions(selectedMonth, selectedYear);
  const { data: summaryData } = useTransactionSummary(selectedMonth, selectedYear);
  const { data: categoriesData } = useCategories();
  const { data: goalsData } = useGoals();
  const goals = goalsData?.goals ?? [];

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const transactions = transactionsData?.transactions ?? [];
  const summary = summaryData?.summary ?? { income: 0, expense: 0, balance: 0 };
  const categories = categoriesData?.categories ?? [];

  // Get today's date in YYYY-MM-DD format for the date input
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  interface TransactionFormData {
    description: string;
    amount: string;
    type: 'income' | 'expense' | 'investment';
    categoryId: string;
    goalId: string;
    isFixed: boolean;
    date: string;
  }

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: {
      description: '',
      amount: '',
      type: 'expense',
      categoryId: '',
      goalId: '',
      isFixed: false,
      date: getTodayDate()
    }
  });

  const transactionType = watch('type');

  // Filter categories based on transaction type
  const filteredCategories = transactionType === 'investment'
    ? []
    : categories.filter(c => c.type === transactionType);

  // Clear category selection when transaction type changes (except when editing or initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!editingTransaction) {
      setValue('categoryId', '');
      setValue('goalId', '');
    }
  }, [transactionType, setValue, editingTransaction]);

  const onSubmit = async (data: any) => {
    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({
          id: editingTransaction._id,
          data: {
            description: data.description,
            amount: parseFloat(data.amount),
            type: data.type,
            categoryId: data.categoryId,
            goalId: (data.type === 'investment' && data.goalId) ? data.goalId : undefined,
            date: data.date
          }
        });
      } else {
        await createMutation.mutateAsync({
          description: data.description,
          amount: parseFloat(data.amount),
          type: data.type,
          categoryId: data.type === 'investment' ? undefined : data.categoryId,
          goalId: (data.type === 'investment' && data.goalId) ? data.goalId : undefined,
          isFixed: data.isFixed,
          date: data.date
        });
      }
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar transação');
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setValue('description', transaction.description);
    setValue('amount', transaction.amount.toString());
    setValue('type', transaction.type);
    setValue('categoryId', transaction.categoryId?._id || '');
    setValue('goalId', transaction.goalId?._id || '');
    setValue('isFixed', transaction.isFixed);
    setValue('date', transaction.date.split('T')[0]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    reset();
  };

  const openDeleteModal = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (deleteMode: 'single' | 'all') => {
    if (!deletingTransaction) return;

    try {
      await deleteMutation.mutateAsync({
        id: deletingTransaction._id,
        deleteMode
      });
      setIsDeleteModalOpen(false);
      setDeletingTransaction(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao deletar transação');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const loading = createMutation.isPending || updateMutation.isPending;
  const deleteLoading = deleteMutation.isPending;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            Transações
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Controle suas receitas e despesas
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Income Card */}
          <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border-light)] relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Entradas</p>
                <h3 className="text-2xl font-bold text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(summary.income)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)] group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border-light)] relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Saídas</p>
                <h3 className="text-2xl font-bold text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(summary.expense)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-danger)]/10 flex items-center justify-center text-[var(--color-danger)] group-hover:scale-110 transition-transform duration-300">
                <TrendingDown size={24} />
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className={`
            bg-gradient-to-br rounded-2xl p-6 shadow-lg relative overflow-hidden text-white group hover:shadow-xl transition-all
            ${summary.balance < 0
              ? 'from-[var(--color-danger)] to-[var(--color-danger-dark)] shadow-[var(--color-danger)]/20 hover:shadow-[var(--color-danger)]/30'
              : 'from-[var(--color-primary)] to-[var(--color-primary-dark)] shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30'
            }
          `}>
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <DollarSign size={120} />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="min-w-0">
                <p className={`text-sm font-medium mb-1 ${summary.balance < 0 ? 'text-red-50/80' : 'text-blue-50/80'}`}>Saldo Total</p>
                <h3 className="text-3xl font-bold text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(summary.balance)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Month Filter */}
        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={(month, year) => {
            setSelectedMonth(month);
            setSelectedYear(year);
          }}
        />

        {/* Transactions List */}
        <div className="bg-[var(--color-bg-card)] rounded-xl shadow-md overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-muted)] mb-4">Nenhuma transação encontrada</p>
              <Button onClick={() => setIsModalOpen(true)} variant="outline">
                Criar primeira transação
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="p-4 hover:bg-[var(--color-bg-elevated)] transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: transaction.categoryId?.color || transaction.goalId?.color || '#6B7280' }}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="text-white" size={20} />
                        ) : transaction.type === 'expense' ? (
                          <TrendingDown className="text-white" size={20} />
                        ) : (
                          <PieChart className="text-white" size={20} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[var(--color-text)]">{transaction.description}</h3>
                          {transaction.isFixed && (
                            <span className="text-xs bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-2 py-0.5 rounded-full font-medium">
                              Fixa
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {transaction.type === 'investment'
                            ? (transaction.goalId?.description || 'Sem objetivo')
                            : (transaction.categoryId?.name || 'Sem categoria')}
                          • {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`text-xl font-bold ${transaction.type === 'income'
                        ? 'text-green-600'
                        : transaction.type === 'expense'
                          ? 'text-red-600'
                          : 'text-[var(--color-primary)]'
                        }`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(transaction)}
                          className="p-2 rounded-lg hover:bg-[var(--color-primary-light)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(transaction)}
                          className="p-2 rounded-lg hover:bg-[var(--color-danger-light)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
                          title="Deletar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[var(--color-action)] text-white rounded-full shadow-2xl hover:bg-[var(--color-action-dark)] transition-all hover:scale-110 cursor-pointer flex items-center justify-center z-50"
      >
        <Plus size={32} />
      </button>

      {/* Create/Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Descrição"
            placeholder="Ex: Compra no supermercado"
            error={errors.description?.message as string}
            {...register('description', {
              required: 'Descrição é obrigatória',
              maxLength: { value: 200, message: 'Máximo 200 caracteres' }
            })}
          />

          <Controller
            name="amount"
            control={control}
            rules={{
              required: 'Valor é obrigatório',
              validate: (value) => parseFloat(value) > 0 || 'Valor deve ser maior que zero'
            }}
            render={({ field: { onChange, value } }) => (
              <CurrencyInput
                label="Valor"
                value={value}
                onChange={onChange}
                error={errors.amount?.message as string}
                placeholder="0,00"
              />
            )}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Data
            </label>
            <input
              type="date"
              {...register('date', { required: 'Data é obrigatória' })}
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-border)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-medium cursor-pointer"
            />
            {errors.date && (
              <p className="mt-2 text-sm text-[var(--color-danger)]">{errors.date.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-3 gap-4">
              <label className={`
                flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${transactionType === 'income'
                  ? 'border-[var(--color-success)] bg-[var(--color-success)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                }
              `}>
                <input type="radio" value="income" {...register('type')} className="sr-only" />
                <TrendingUp size={20} className={transactionType === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'} />
                <span className={transactionType === 'income' ? 'text-[var(--color-success)] font-medium' : 'text-[var(--color-text-secondary)]'}>
                  Receita
                </span>
              </label>

              <label className={`
                flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${transactionType === 'expense'
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                }
              `}>
                <input type="radio" value="expense" {...register('type')} className="sr-only" />
                <TrendingDown size={20} className={transactionType === 'expense' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'} />
                <span className={transactionType === 'expense' ? 'text-[var(--color-danger)] font-medium' : 'text-[var(--color-text-secondary)]'}>
                  Despesa
                </span>
              </label>

              <label className={`
                flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${transactionType === 'investment'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                }
              `}>
                <input type="radio" value="investment" {...register('type')} className="sr-only" />
                <PieChart size={20} className={transactionType === 'investment' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
                <span className={transactionType === 'investment' ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}>
                  Aporte
                </span>
              </label>
            </div>
          </div>

          <div>
            {transactionType !== 'investment' && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Categoria
                </label>
                <select
                  {...register('categoryId', { required: 'Categoria é obrigatória' })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-border)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-medium appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Selecione uma categoria</option>
                  {filteredCategories.length === 0 ? (
                    <option value="" disabled>
                      {transactionType === 'income'
                        ? 'Nenhuma categoria de receita'
                        : transactionType === 'expense'
                          ? 'Nenhuma categoria de despesa'
                          : 'Nenhuma categoria de aporte'}
                    </option>
                  ) : (
                    filteredCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.categoryId && (
                  <p className="mt-2 text-sm text-[var(--color-danger)]">{errors.categoryId.message as string}</p>
                )}
              </div>
            )}

            {transactionType === 'investment' && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Objetivo
                </label>
                <select
                  {...register('goalId', { required: 'Objetivo é obrigatório' })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-border)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-[var(--color-bg-card)] text-[var(--color-text)] font-medium appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Selecione um objetivo</option>
                  {!goals || goals.length === 0 ? (
                    <option value="" disabled>Nenhum objetivo cadastrado</option>
                  ) : (
                    goals.map((goal) => (
                      <option key={goal.id || goal._id} value={goal.id || goal._id}>
                        {goal.description}
                      </option>
                    ))
                  )}
                </select>
                {errors.goalId && (
                  <p className="mt-2 text-sm text-[var(--color-danger)]">{errors.goalId.message as string}</p>
                )}
              </div>
            )}

            {/* Previous block replacement end */}
          </div>

          {/* Fixed Transaction Checkbox - Only show when creating AND not investment */}
          {!editingTransaction && transactionType !== 'investment' && (
            <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border)]">
              <input
                type="checkbox"
                id="isFixed"
                {...register('isFixed')}
                className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] cursor-pointer"
              />
              <label htmlFor="isFixed" className="cursor-pointer">
                <span className="font-medium text-[var(--color-text)]">
                  {transactionType === 'income' ? 'Receita Fixa' : 'Despesa Fixa'}
                </span>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {transactionType === 'income'
                    ? 'Esta receita será repetida automaticamente todos os meses'
                    : 'Esta despesa será repetida automaticamente todos os meses'}
                </p>
              </label>
            </div>
          )}

          {/* Info for fixed transactions in edit mode */}
          {editingTransaction && editingTransaction.isFixed && (
            <div className="p-4 bg-[var(--color-primary)]/10 rounded-lg border border-[var(--color-primary)]/30">
              <p className="text-sm text-[var(--color-text)]">
                <strong>Nota:</strong> Esta é uma {editingTransaction.type === 'income' ? 'receita' : 'despesa'} fixa. A alteração afetará apenas esta ocorrência.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTransaction(null);
        }}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir a transação <strong>&quot;{deletingTransaction?.description}&quot;</strong>?
          </p>

          {deletingTransaction?.isFixed ? (
            <>
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                Esta é uma despesa fixa. Você pode excluir apenas esta ocorrência ou todas as futuras.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleDelete('single')}
                  variant="secondary"
                  fullWidth
                  disabled={deleteLoading}
                >
                  Excluir apenas esta
                </Button>
                <Button
                  onClick={() => handleDelete('all')}
                  fullWidth
                  disabled={deleteLoading}
                  className="!bg-red-600 hover:!bg-red-700"
                >
                  {deleteLoading ? 'Excluindo...' : 'Excluir esta e futuras'}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingTransaction(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleDelete('single')}
                fullWidth
                disabled={deleteLoading}
                className="!bg-red-600 hover:!bg-red-700"
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}