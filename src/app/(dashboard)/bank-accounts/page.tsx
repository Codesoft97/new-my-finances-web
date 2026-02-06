
'use client';

import { useState } from 'react';
import { Plus, Landmark } from 'lucide-react';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import CreateBankAccountModal from '@/components/bank-accounts/CreateBankAccountModal';
import BankAccountCard from '@/components/bank-accounts/BankAccountCard';

export default function BankAccountsPage() {
  const { bankAccounts, isLoading } = useBankAccounts();
  const [iscreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Maximum of 2 accounts per family
  const canAddAccount = (bankAccounts?.length || 0) < 2;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Contas Bancárias</h1>
            <p className="text-[var(--color-text-secondary)]">Gerencie suas contas e saldos</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!canAddAccount}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canAddAccount ? 'Limite de 2 contas atingido' : 'Criar nova conta'}
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nova Conta</span>
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-[var(--color-bg-elevated)] animate-pulse" />
            ))}
          </div>
        ) : bankAccounts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-card)] text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
              <Landmark size={32} className="text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">Nenhuma conta cadastrada</h3>
            <p className="text-[var(--color-text-secondary)] max-w-sm mb-6">
              Cadastre suas contas bancárias para controlar seu saldo e vincular transações.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] cursor-pointer transition-colors shadow-lg shadow-primary/20"
            >
              <Plus size={20} />
              Cadastrar Primeira Conta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {bankAccounts?.map((account) => (
              <BankAccountCard key={account._id} account={account} />
            ))}
          </div>
        )}

        <CreateBankAccountModal
          isOpen={iscreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
}
