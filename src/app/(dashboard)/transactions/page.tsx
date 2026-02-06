'use client';

import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Pencil, Trash2, PieChart } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import MonthSelector from '@/components/ui/MonthSelector';
import TransactionModal from '@/components/transactions/TransactionModal';
import { Transaction } from '@/types';
import {
  useTransactions,
  useTransactionSummary,
  useDeleteTransaction
} from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useBankAccounts } from '@/hooks/useBankAccounts';

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
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // React Query hooks
  const { data: transactionsData } = useTransactions(selectedMonth, selectedYear, selectedType, selectedCategoryId);
  const { data: summaryData } = useTransactionSummary(selectedMonth, selectedYear);
  const { data: categoriesData } = useCategories();
  const { bankAccounts, isLoading: accountsLoading } = useBankAccounts();

  const deleteMutation = useDeleteTransaction();

  const transactions = transactionsData?.transactions ?? [];
  const summary = summaryData?.summary ?? { income: 0, expense: 0, balance: 0 };
  const categories = categoriesData?.categories ?? [];

  // Calculate total balance from bank accounts
  const totalBalance = bankAccounts?.reduce((acc, account) => acc + account.balance, 0) ?? 0;

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
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


  const loading = deleteMutation.isPending;

  return (
    <div className="p-4 md:p-8">
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
            ${totalBalance < 0
              ? 'from-[var(--color-danger)] to-[var(--color-danger-dark)] shadow-[var(--color-danger)]/20 hover:shadow-[var(--color-danger)]/30'
              : 'from-[var(--color-primary)] to-[var(--color-primary-dark)] shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30'
            }
          `}>
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <DollarSign size={120} />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="min-w-0">
                <p className={`text-sm font-medium mb-1 ${totalBalance < 0 ? 'text-red-50/80' : 'text-blue-50/80'}`}>Saldo Total (Contas)</p>
                <h3 className="text-3xl font-bold text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(totalBalance)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Header */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="lg:w-1/3">
            <MonthSelector
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={(month, year) => {
                setSelectedMonth(month);
                setSelectedYear(year);
              }}
              className="h-full"
            />
          </div>

          {/* Filters */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setSelectedCategoryId(''); // Reset category when type changes
              }}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 shadow-sm appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 1rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
              <option value="investment">Aportes</option>
            </select>

            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={selectedType === 'investment'}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 shadow-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 1rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">Todas as categorias</option>
              {categories
                .filter(c => !selectedType || selectedType === 'investment' || c.type === selectedType)
                .map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

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
                  <div className="flex items-center justify-between flex-wrap gap-4">
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
      <TransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        transactionToEdit={editingTransaction}
      />

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
                  disabled={loading}
                >
                  Excluir apenas esta
                </Button>
                <Button
                  onClick={() => handleDelete('all')}
                  fullWidth
                  disabled={loading}
                  className="!bg-red-600 hover:!bg-red-700"
                >
                  {loading ? 'Excluindo...' : 'Excluir esta e futuras'}
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
                disabled={loading}
                className="!bg-red-600 hover:!bg-red-700"
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
