'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function BillingSuccessPage() {
  const { refreshFamily } = useAuth();
  const router = useRouter();

  useEffect(() => {
    refreshFamily();
  }, [refreshFamily]);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-[var(--color-success)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Assinatura confirmada</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Tudo certo! Seu Plano Premium está ativo. Estamos atualizando suas permissões agora.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push('/goals')}>Ir para Objetivos</Button>
          <Button onClick={() => router.push('/premium')} variant="outline">
            Ver detalhes do plano
          </Button>
        </div>
      </div>
    </div>
  );
}
