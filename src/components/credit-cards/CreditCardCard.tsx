'use client';

import { useState } from 'react';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  CreditCard as CreditCardIcon,
  Banknote,
} from 'lucide-react';
import { CreditCard, CreditCardTransaction } from '@/types';
import { useCreditCards } from '@/hooks/useCreditCards';
import CreditCardModal from './CreditCardModal';
import CreditCardTransactionModal from './CreditCardTransactionModal';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { toastApiError } from '@/utils/notifications';

interface CreditCardCardProps {
  card: CreditCard;
}

const BRAND_LABELS: Record<string, string> = {
  mastercard: 'Mastercard',
  visa: 'Visa',
  elo: 'Elo',
  outro: 'Outro',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function CreditCardCard({ card }: CreditCardCardProps) {
  const { deleteCreditCard, deleteCardTransaction, payInvoice } = useCreditCards();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ tx: CreditCardTransaction; mode?: 'all' } | null>(null);

  const invoice = card.invoice;
  const usedPercent = card.limit > 0 ? ((card.limit - card.availableLimit) / card.limit) * 100 : 0;

  const handleDeleteCard = async () => {
    try {
      await deleteCreditCard.mutateAsync(card._id);
      setIsDeleteOpen(false);
    } catch (error: unknown) {
      toastApiError(error, 'Erro ao excluir cartao.');
    }
  };

  const handleDeleteTx = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCardTransaction.mutateAsync({
        cardId: card._id,
        transactionId: deleteTarget.tx._id,
        deleteMode: deleteTarget.mode,
      });
      setDeleteTarget(null);
    } catch (error: unknown) {
      toastApiError(error, 'Erro ao excluir transacao.');
    }
  };

  const handlePayInvoice = async () => {
    try {
      await payInvoice.mutateAsync({
        cardId: card._id,
        month: invoice.month,
        year: invoice.year,
      });
      setIsPayOpen(false);
    } catch (error: unknown) {
      toastApiError(error, 'Erro ao pagar fatura.');
    }
  };

  const getInstallmentLabel = (tx: CreditCardTransaction) => {
    if (tx.type === 'installment') return `${tx.currentInstallment}/${tx.installments}`;
    if (tx.type === 'fixed') return 'Fixo';
    return 'À vista';
  };

  return (
    <>
      <div 
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-4 overflow-hidden border-l-2"
        style={{ borderLeftColor: card.color }}
      >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-white"
                style={{ backgroundColor: card.color }}
              >
                <CreditCardIcon size={20} />
              </div>
              <div>
                <h3 className="text-base font-medium text-[var(--color-text)]">{card.name}</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">{BRAND_LABELS[card.brand]}</p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                className="p-2 -mr-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-bg-elevated)] rounded-md transition-colors"
              >
                <MoreVertical size={20} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md shadow-sm z-10 overflow-hidden">
                  <button
                    onClick={() => { setIsEditOpen(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-bg-card)] transition-colors text-left"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => { setIsDeleteOpen(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-danger)] cursor-pointer hover:bg-[var(--color-danger)]/10 transition-colors text-left"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Limit bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[var(--color-text-secondary)]">Limite disponível</span>
              <span className="font-medium text-[var(--color-text)]">{formatCurrency(card.availableLimit)}</span>
            </div>
            <div className="w-full h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(usedPercent, 100)}%`,
                  backgroundColor: usedPercent > 90 ? 'var(--color-danger)' : usedPercent > 70 ? 'var(--color-warning)' : card.color,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1 text-[var(--color-text-muted)]">
              <span>Usado: {formatCurrency(card.limit - card.availableLimit)}</span>
              <span>Limite: {formatCurrency(card.limit)}</span>
            </div>
          </div>

          {/* Invoice summary */}
          <div className="mt-4 p-3 bg-[var(--color-bg-elevated)] rounded-md border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">
                  Fatura {invoice.month.toString().padStart(2, '0')}/{invoice.year}
                </p>
                <p className="text-lg font-medium text-[var(--color-text)]">{formatCurrency(invoice.totalAmount)}</p>
              </div>
              <div className="flex items-center gap-2">
                {invoice.isPaid ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-1 rounded-md">
                    <CheckCircle size={12} />
                    Paga
                  </span>
                ) : invoice.totalAmount > 0 ? (
                  <span className="text-xs font-medium text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-2 py-1 rounded-md">
                    Aberta
                  </span>
                ) : (
                  <span className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-card)] px-2 py-1 rounded-md">
                    Sem fatura
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-[var(--color-text-muted)]">
              <span>Fecha dia {card.closingDay}</span>
              <span>•</span>
              <span>Vence dia {card.dueDay}</span>
              {card.bankAccountId && (
                <>
                  <span>•</span>
                  <span className="truncate">{card.bankAccountId.name}</span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setIsTransactionOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--color-primary)] border border-[var(--color-primary)]/30 rounded-md hover:bg-[var(--color-primary)]/10 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Nova Despesa
            </button>
            {!invoice.isPaid && invoice.totalAmount > 0 && (
              <button
                onClick={() => setIsPayOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--color-success)] border border-[var(--color-success)]/30 rounded-md hover:bg-[var(--color-success)]/10 transition-colors cursor-pointer"
              >
                <Banknote size={14} />
                Pagar Fatura
              </button>
            )}
          </div>

          {/* Toggle transactions list */}
          {invoice.transactions && invoice.transactions.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full mt-3 flex items-center justify-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer py-1"
            >
              {isExpanded ? (
                <>Ocultar transações <ChevronUp size={14} /></>
              ) : (
                <>{invoice.transactions.length} transaç{invoice.transactions.length === 1 ? 'ão' : 'ões'} <ChevronDown size={14} /></>
              )}
            </button>
          )}

          {/* Transactions list */}
          {isExpanded && invoice.transactions && (
            <div className="mt-2 space-y-1">
              {invoice.transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-[var(--color-bg-elevated)] transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {tx.categoryId && (
                      <div
                        className="w-2 h-2 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: tx.categoryId.color }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--color-text)] truncate">{tx.description}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                        {tx.categoryId && <span>{tx.categoryId.name}</span>}
                        <span>•</span>
                        <span>{getInstallmentLabel(tx)}</span>
                        <span>•</span>
                        <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-danger)] whitespace-nowrap">
                      - {formatCurrency(tx.installmentAmount)}
                    </span>
                    {!invoice.isPaid && (
                      <button
                        onClick={() => setDeleteTarget({ tx })}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-all cursor-pointer rounded-md hover:bg-[var(--color-danger)]/10"
                        title="Excluir transação"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Edit Modal */}
      <CreditCardModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} cardToEdit={card} />

      {/* Transaction Modal */}
      <CreditCardTransactionModal isOpen={isTransactionOpen} onClose={() => setIsTransactionOpen(false)} card={card} />

      {/* Delete Card Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Excluir Cartão" size="sm">
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            Tem certeza que deseja excluir o cartão <strong>{card.name}</strong>?
            <br />
            <span className="text-sm text-[var(--color-text-muted)] block mt-2">
              Todas as transações deste cartão serão excluídas.
            </span>
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" fullWidth onClick={handleDeleteCard}>
              {deleteCreditCard.isPending ? 'Excluindo...' : 'Sim, Excluir'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Transaction Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir Transação"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-[var(--color-text-secondary)]">
              Excluir <strong>{deleteTarget.tx.description}</strong>?
            </p>

            {(deleteTarget.tx.type === 'installment' || deleteTarget.tx.type === 'fixed') && (
              <div className="bg-[var(--color-bg-elevated)] rounded-md border border-[var(--color-border)] p-3 space-y-2">
                <p className="text-xs text-[var(--color-text-muted)]">
                  Esta transação faz parte de um grupo ({deleteTarget.tx.type === 'installment' ? 'parcelamento' : 'fixa'}).
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    fullWidth
                    onClick={() => { setDeleteTarget({ tx: deleteTarget.tx, mode: undefined }); handleDeleteTx(); }}
                  >
                    Apenas esta
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    fullWidth
                    onClick={() => { setDeleteTarget({ tx: deleteTarget.tx, mode: 'all' }); handleDeleteTx(); }}
                  >
                    Todas do grupo
                  </Button>
                </div>
              </div>
            )}

            {deleteTarget.tx.type === 'single' && (
              <div className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>
                  Cancelar
                </Button>
                <Button variant="danger" fullWidth onClick={handleDeleteTx}>
                  {deleteCardTransaction.isPending ? 'Excluindo...' : 'Sim, Excluir'}
                </Button>
              </div>
            )}

            {(deleteTarget.tx.type === 'installment' || deleteTarget.tx.type === 'fixed') && (
              <Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
            )}
          </div>
        )}
      </Modal>

      {/* Pay Invoice Modal */}
      <Modal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} title="Pagar Fatura" size="sm">
        <div className="space-y-4">
          <div className="bg-[var(--color-bg-elevated)] rounded-md border border-[var(--color-border)] p-4 text-center">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Valor da fatura</p>
            <p className="text-2xl font-medium text-[var(--color-text)]">{formatCurrency(invoice.totalAmount)}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2">
              Será debitado da conta <strong>{card.bankAccountId?.name}</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setIsPayOpen(false)}>
              Cancelar
            </Button>
            <Button fullWidth onClick={handlePayInvoice}>
              {payInvoice.isPending ? 'Pagando...' : 'Confirmar Pagamento'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
