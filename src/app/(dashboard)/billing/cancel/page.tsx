'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md p-6 text-center">
        <div className="w-16 h-16 rounded-md bg-[var(--color-danger)]/10 flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-[var(--color-danger)]" />
        </div>
        <h1 className="text-xl font-medium text-[var(--color-text)] mb-1">Checkout cancelado</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Você cancelou o checkout. Se quiser, pode tentar novamente quando estiver pronto.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push('/premium')}>Ver planos Premium</Button>
          <Button onClick={() => router.push('/')} variant="outline">
            Voltar ao dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
