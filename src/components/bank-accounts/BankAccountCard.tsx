import { useState } from 'react';
import { BankAccount } from '@/types';
import { CreditCard, Landmark, Smartphone, Briefcase, PiggyBank, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import EditBankAccountModal from './EditBankAccountModal';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useBankAccounts } from '@/hooks/useBankAccounts';

interface BankAccountCardProps {
  account: BankAccount;
}

const TYPE_ICONS = {
  checking: CreditCard,
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { deleteBankAccount } = useBankAccounts();

  const handleDelete = async () => {
    try {
      await deleteBankAccount.mutateAsync(account._id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      alert('Erro ao excluir conta.');
    }
  };

  return (
    <>
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-visible group">
        <div
          className="absolute top-0 left-0 w-2 h-full rounded-l-2xl"
          style={{ backgroundColor: account.color }}
        />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: account.color }}
            >
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">{account.name}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{TYPE_LABELS[account.type]}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
              className="p-2 -mr-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-bg-elevated)] rounded-full transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl shadow-lg z-10 overflow-hidden">
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
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-[var(--color-text-muted)] mb-1">Saldo atual</p>
          <p className="text-2xl font-bold text-[var(--color-text)]">
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
            <span className="text-sm text-amber-600 block mt-2">
              Todas as transações vinculadas a esta conta serão excluidas junto.
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
              className="!bg-red-600 hover:!bg-red-700 text-white"
            >
              {deleteBankAccount.isPending ? 'Excluindo...' : 'Sim, Excluir'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
