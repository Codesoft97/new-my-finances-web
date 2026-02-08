'use client';

import { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Pencil, Trash2, PieChart, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TransactionsFilters from '@/components/transactions/TransactionsFilters';
import TransactionModal from '@/components/transactions/TransactionModal';
import { Transaction } from '@/types';
import SummaryCards from '@/components/summary/SummaryCards';
import {
  useTransactions,
  useTransactionSummary,
  useDeleteTransaction,
  useEffectivateTransactions
} from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useBankAccounts } from '@/hooks/useBankAccounts';

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);

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
  const effectivateMutation = useEffectivateTransactions();

  const transactions = transactionsData?.transactions ?? [];
  const summary = summaryData?.summary ?? { income: 0, expense: 0, balance: 0 };
  const categories = categoriesData?.categories ?? [];
  const totalInvestments = transactions
    .filter((transaction) => transaction.type === 'investment' && transaction.isEffective)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const pendingTransactionIds = transactions.filter((transaction) => !transaction.isEffective).map((transaction) => transaction._id);
  const allPendingSelected = pendingTransactionIds.length > 0
    && pendingTransactionIds.every((id) => selectedTransactionIds.includes(id));

  // Calculate total balance from bank accounts
  const totalBalance = bankAccounts?.reduce((acc, account) => acc + account.balance, 0) ?? 0;

  useEffect(() => {
    setSelectedTransactionIds((prev) => {
      const next = prev.filter((id) => pendingTransactionIds.includes(id));
      if (next.length === prev.length && next.every((id, index) => id === prev[index])) {
        return prev;
      }
      return next;
    });
  }, [pendingTransactionIds]);

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

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setSelectedCategoryId('');
  };

  const toggleTransactionSelection = (id: string) => {
    setSelectedTransactionIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPending = () => {
    setSelectedTransactionIds(allPendingSelected ? [] : pendingTransactionIds);
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

  const handleEffectivate = async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      const response = await effectivateMutation.mutateAsync(ids);
      setSelectedTransactionIds((prev) => prev.filter((id) => !ids.includes(id)));

      if (response?.skipped?.length || response?.notFound?.length) {
        const updatedCount = response.updated?.length ?? 0;
        const skippedCount = response.skipped?.length ?? 0;
        const notFoundCount = response.notFound?.length ?? 0;
        alert(`Efetivação concluída. ${updatedCount} atualizadas, ${skippedCount} já efetivas, ${notFoundCount} não encontradas.`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao efetivar transações');
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


  const deleteLoading = deleteMutation.isPending;
  const effectivateLoading = effectivateMutation.isPending;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-[var(--color-text)] mb-1">
            Transações
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Controle suas receitas e despesas
          </p>
        </div>

        <SummaryCards
          income={summary.income}
          expense={summary.expense}
          investments={totalInvestments}
          totalBalance={totalBalance}
          investmentsLabel="Guardado"
        />

        <TransactionsFilters
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          categories={categories}
          className="mb-4"
        />

        {pendingTransactionIds.length > 0 && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6 p-3 bg-[var(--color-bg-card)] rounded-md border border-[var(--color-border)]">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allPendingSelected}
                onChange={toggleSelectAllPending}
                className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] cursor-pointer"
              />
              <span className="text-sm font-medium text-[var(--color-text)]">
                Selecionar transações pendentes
              </span>
            </label>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedTransactionIds.length === 0 || effectivateLoading}
              onClick={() => handleEffectivate(selectedTransactionIds)}
            >
              {effectivateLoading
                ? 'Efetivando...'
                : `Efetivar selecionadas (${selectedTransactionIds.length})`}
            </Button>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-[var(--color-bg-card)] rounded-md border border-[var(--color-border)] overflow-hidden">
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
                <div key={transaction._id} className="p-3 hover:bg-[var(--color-bg-elevated)] transition-colors group">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedTransactionIds.includes(transaction._id)}
                        disabled={transaction.isEffective}
                        onChange={() => toggleTransactionSelection(transaction._id)}
                        className="w-5 h-5 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center"
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
                          <h3 className="text-base font-medium text-[var(--color-text)]">{transaction.description}</h3>
                          {transaction.isFixed && (
                            <span className="text-xs bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-2 py-0.5 rounded-sm font-medium">
                              Fixa
                            </span>
                          )}
                          {transaction.isEffective ? (
                            <span className="text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] px-2 py-0.5 rounded-sm font-medium">
                              Efetivada
                            </span>
                          ) : (
                            <span className="text-xs bg-[var(--color-warning)]/10 text-[var(--color-warning)] px-2 py-0.5 rounded-sm font-medium">
                              Pendente
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] flex flex-wrap items-center gap-2">
                          <span>
                            {transaction.type === 'investment'
                              ? (transaction.goalId?.description || 'Sem objetivo')
                              : (transaction.categoryId?.name || 'Sem categoria')}
                          </span>
                          {transaction.type === 'expense' && transaction.categoryId && (
                            <span
                              className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${transaction.categoryId.essential
                                ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                                : 'bg-[var(--color-warning)]/10 text-[var(--color-warning-dark)]'
                              }`}
                            >
                              {transaction.categoryId.essential ? 'Essencial' : 'Não essencial'}
                            </span>
                          )}
                          <span>• {formatDate(transaction.date)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`text-lg font-medium ${transaction.type === 'income'
                        ? 'text-[var(--color-success)]'
                        : transaction.type === 'expense'
                          ? 'text-[var(--color-danger)]'
                          : 'text-[var(--color-primary)]'
                        }`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!transaction.isEffective && (
                          <button
                            onClick={() => handleEffectivate([transaction._id])}
                            className="p-2 rounded-md hover:bg-[var(--color-success)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-success)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Efetivar"
                            disabled={effectivateLoading}
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(transaction)}
                          className="p-2 rounded-md hover:bg-[var(--color-primary-light)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(transaction)}
                          className="p-2 rounded-md hover:bg-[var(--color-danger-light)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
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
        className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--color-action)] text-white rounded-md shadow-md hover:bg-[var(--color-action-dark)] transition-all hover:scale-105 cursor-pointer flex items-center justify-center z-50"
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
          <p className="text-[var(--color-text-secondary)]">
            Tem certeza que deseja excluir a transação <strong>&quot;{deletingTransaction?.description}&quot;</strong>?
          </p>

          {deletingTransaction?.isFixed ? (
            <>
              <p className="text-sm text-[var(--color-warning)] bg-[var(--color-warning)]/10 p-3 rounded-md border border-[var(--color-warning)]/20">
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
                  variant="danger"
                  fullWidth
                  disabled={deleteLoading}
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
                variant="danger"
                fullWidth
                disabled={deleteLoading}
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
