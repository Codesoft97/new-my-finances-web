'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Receipt, Tags, Users, Wallet } from 'lucide-react';
import TutorialModal, { TutorialStep } from '@/components/tutorial/TutorialModal';
import Button from '@/components/ui/Button';
import CreateBankAccountModal from '@/components/bank-accounts/CreateBankAccountModal';
import AddMemberModal from '@/components/family/AddMemberModal';
import { useAuth } from '@/contexts/AuthContext';

interface FirstAccessTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
  allowSkip?: boolean;
}

export default function FirstAccessTutorialModal({
  isOpen,
  onClose,
  onFinish,
  allowSkip = true,
}: FirstAccessTutorialModalProps) {
  const router = useRouter();
  const { family, refreshFamily } = useAuth();
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const canAddMember = family ? family.memberCount < 2 : false;

  const handleComplete = () => {
    if (onFinish) {
      onFinish();
      return;
    }
    onClose();
  };

  const handleOpenPremium = () => {
    handleComplete();
    router.push('/premium');
  };

  const steps: TutorialStep[] = [
    {
      id: 'accounts',
      title: 'Cadastre sua primeira conta',
      description: 'As contas organizam seus saldos e são obrigatórias para registrar transacoes.',
      bullets: [
        'A primeira conta cadastrada vira a conta principal e nao pode ser excluida.',
        'Ao cadastrar uma transação, você precisa selecionar uma conta.',
        'Você pode editar e cadastrar novas contas a qualquer momento.',
      ],
      icon: Wallet,
      content: (
        <div className="space-y-2">
          <Button onClick={() => setIsCreateAccountOpen(true)} fullWidth>
            Cadastrar conta agora
          </Button>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Se preferir, avance para criar depois na tela de contas.
          </p>
        </div>
      ),
    },
    {
      id: 'categories',
      title: 'Categorias prontas e personalizaveis',
      description: 'Ja deixamos categorias cadastradas para você ganhar tempo.',
      bullets: [
        'Você pode criar suas próprias categorias sempre que quiser.',
        'Tambem pode excluir categorias que não usa.',
        'As categorias Renda e Outros nao podem ser excluidas.',
      ],
      icon: Tags,
    },
    {
      id: 'transactions',
      title: 'Crie suas transações',
      description: 'Registre entradas e saídas para manter seu controle financeiro em dia.',
      bullets: [
        'Crie receitas e despesas diretamente em Transações.',
        'Escolha a categoria e a conta antes de salvar.',
        'A opção de objetivos (aportes) fica disponível no plano Premium.',
      ],
      icon: Receipt,
    },
    {
      id: 'family',
      title: 'Adicione membros da família',
      description: 'Convide quem está ao seu lado para planejar, acompanhar e decidir juntos..',
      bullets: [
        'Organizem categorias e receitas de forma compartilhada.',
        'Registrem despesas fixas ou eventuais, na hora ou depois.',
        'Gerenciem contas juntos, com total transparência.',
        'Todas as ações ficam sincronizadas entre os membros.',
      ],
      icon: Users,
      content: (
        <div className="space-y-2">
          {canAddMember ? (
            <>
              <Button onClick={() => setIsAddMemberOpen(true)} fullWidth>
                Adicionar membro agora
              </Button>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Se preferir, avance e convide depois pela area de familia.
              </p>
            </>
          ) : (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 text-xs text-[var(--color-text-secondary)]">
              Limite de 2 membros por familia atingido.
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'premium',
      title: 'Plano Premium',
      description: 'Desbloqueie recursos avancados para acompanhar metas financeiras.',
      bullets: [
        'Criação de objetivos financeiros.',
        'Acompanhamento do progresso das metas.',
        'Aportes vinculados a objetivos.',
        'Plano compartilhado entre os membros da família.',
      ],
      icon: Crown,
      content: (
        <div className="space-y-3">
          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 text-sm text-[var(--color-text-secondary)]">
            Você pode ativar o Premium quando estiver pronto. Toda a família aproveita os recursos.
          </div>
          <Button onClick={handleOpenPremium} fullWidth>
            Ver planos Premium
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <TutorialModal
        isOpen={isOpen}
        onClose={onClose}
        onFinish={handleComplete}
        onSkip={handleComplete}
        steps={steps}
        title="Tutorial de primeiro acesso"
        allowSkip={allowSkip}
      />
      {isCreateAccountOpen && (
        <CreateBankAccountModal
          isOpen={isCreateAccountOpen}
          onClose={() => setIsCreateAccountOpen(false)}
          modalZIndexClass="z-[120]"
        />
      )}
      {isAddMemberOpen && (
        <AddMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          onMemberAdded={refreshFamily}
          modalZIndexClass="z-[120]"
        />
      )}
    </>
  );
}
