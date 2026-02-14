import { useState } from 'react';
import { BankAccount } from '@/types';
import { CreditCard, Landmark, Smartphone, Briefcase, PiggyBank, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import EditBankAccountModal from './EditBankAccountModal';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { toast } from 'sonner';
import { toastApiError } from '@/utils/notifications';

interface BankAccountCardProps {
  account: BankAccount;
}

const TYPE_ICONS = {
  checking: Landmark,
  payment: Smartphone,
  salary: Briefcase,
  savings: PiggyBank,
};

const TYPE_LABELS = {
  checking: 'Conta Corrente',
  payment: 'Conta de Pagamento',
  salary: 'Conta Salário',
  savings: 'Conta Poupança',
};

export default function BankAccountCard({ account }: BankAccountCardProps) {
  const Icon = TYPE_ICONS[account.type] || Landmark;
  const isPrimary = account.isPrimary;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { deleteBankAccount } = useBankAccounts();

  const handleDelete = async () => {
    if (isPrimary) {
      toast.warning('A primeira conta cadastrada nao pode ser deletada.');
      return;
    }
    try {
      await deleteBankAccount.mutateAsync(account._id);
      setIsDeleteModalOpen(false);
    } catch (error: unknown) {
      toastApiError(error, 'Erro ao excluir conta.');
    }
  };

  return (
    <>
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-4 transition-colors relative overflow-visible group">
        <div
          className="absolute top-0 left-0 w-2 h-full rounded-l-md"
          style={{ backgroundColor: account.color }}
        />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-white"
              style={{ backgroundColor: account.color }}
            >
              <Icon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-[var(--color-text)]">{account.name}</h3>
                {isPrimary && (
                  <span className="text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-sm px-2 py-0.5">
                    Principal
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">{TYPE_LABELS[account.type]}</p>
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
              <div className="absolute right-0 mt-2 w-36 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md shadow-sm z-10 overflow-hidden">
                <button
                  onClick={() => {
                    setIsEditModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-bg-card)] transition-colors text-left"
                >
                  <Pencil size={16} />
                  Editar
                </button>
                {!isPrimary && (
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-danger)] cursor-pointer hover:bg-[var(--color-danger)]/10 transition-colors text-left"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Saldo atual</p>
          <p className="text-lg font-medium text-[var(--color-text)]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance)}
          </p>
        </div>
      </div>

      <EditBankAccountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        account={account}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Conta"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            Tem certeza que deseja excluir a conta <strong>{account.name}</strong>?
            <br />
            <span className="text-sm text-[var(--color-text-muted)] block mt-2">
              A exclusao so e permitida se nao houver transacoes vinculadas a esta conta.
            </span>
          </p>

          <div className="flex gap-3 mt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              onClick={handleDelete}
              variant="danger"
            >
              {deleteBankAccount.isPending ? 'Excluindo...' : 'Sim, Excluir'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
