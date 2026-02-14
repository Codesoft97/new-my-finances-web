'use client';

import { useEffect, useMemo, useState } from 'react';
import { Crown, CheckCircle, CalendarClock, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { billingService } from '@/services/api';
import { formatPlanInterval, isPremiumFamily } from '@/utils/billing';

type PlanId = 'monthly' | 'annual';

const PRICING: Record<PlanId, { title: string; price: string; period: string; highlight?: string; description: string }> = {
  monthly: {
    title: 'Mensal',
    price: 'R$ 9,99',
    period: '/mês',
    description: 'Pagamento recorrente mensal, cancele quando quiser.',
  },
  annual: {
    title: 'Anual',
    price: 'R$ 95,88',
    period: '/ano',
    highlight: 'Melhor custo-benefício',
    description: 'Pagamento único anual com economia no período.',
  },
};

const FEATURES = [
  'Criação de objetivos financeiros',
  'Acompanhamento do progresso das metas',
  'Limites de gastos por categoria',
];

export default function PremiumPage() {
  const { family, refreshFamily } = useAuth();
  const isPremium = isPremiumFamily(family);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshFamily();
  }, [refreshFamily]);

  const statusLabel = useMemo(() => {
    if (!family) return 'Carregando...';
    return isPremium ? 'Premium ativo' : 'Plano gratuito';
  }, [family, isPremium]);

  const currentPeriodEnd = family?.currentPeriodEnd ? new Date(family.currentPeriodEnd).toLocaleDateString('pt-BR') : null;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingService.checkout(selectedPlan);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError('Não foi possível iniciar o checkout.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Falha ao iniciar o checkout. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingService.portal();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError('Não foi possível abrir o portal de cobrança.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Falha ao abrir o portal. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[var(--color-action)]/10 flex items-center justify-center">
              <Crown className="text-[var(--color-action)]" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-medium text-[var(--color-text)]">Plano Premium</h1>
              <p className="text-[var(--color-text-secondary)]">
                Assinatura por família com recursos avançados para metas financeiras.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {!isPremium && (
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['monthly', 'annual'] as PlanId[]).map((planId) => {
                const plan = PRICING[planId];
                const selected = selectedPlan === planId;

                return (
                  <button
                    key={planId}
                    type="button"
                    onClick={() => setSelectedPlan(planId)}
                    className={`text-left rounded-md border p-4 transition-colors cursor-pointer focus:outline-none
                      ${selected ? 'border-[var(--color-action)] bg-[var(--color-action)]/5' : 'border-[var(--color-border)] bg-[var(--color-bg-card)]'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-[var(--color-text)]">{plan.title}</h2>
                      {plan.highlight && (
                        <span className="text-xs font-semibold text-[var(--color-action)] bg-[var(--color-action)]/10 px-2 py-1 rounded-sm">
                          {plan.highlight}
                        </span>
                      )}
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-2xl font-medium text-[var(--color-text)]">{plan.price}</span>
                      <span className="text-sm text-[var(--color-text-secondary)]">{plan.period}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">{plan.description}</p>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
                      <CheckCircle size={16} />
                      {selected ? 'Selecionado' : 'Selecionar plano'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-3">
            <div className="flex items-center gap-2 text-[var(--color-text)]">
              <CreditCard size={18} />
              <h3 className="font-semibold">Status da assinatura</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[var(--color-text-secondary)]">Plano atual</p>
              <p className="text-lg font-semibold text-[var(--color-text)]">{statusLabel}</p>
            </div>
            {isPremium && (
              <div className="space-y-1">
                <p className="text-sm text-[var(--color-text-secondary)]">Ciclo</p>
                <p className="text-sm text-[var(--color-text)] capitalize">{formatPlanInterval(family?.planInterval)}</p>
              </div>
            )}
            {currentPeriodEnd && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <CalendarClock size={16} />
                {family?.cancelAtPeriodEnd ? (
                  <span>Termina em {currentPeriodEnd}</span>
                ) : (
                  <span>Renova em {currentPeriodEnd}</span>
                )}
              </div>
            )}
            {error && (
              <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 p-3 rounded-lg border border-[var(--color-danger)]/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              {isPremium ? (
                <Button onClick={handlePortal} fullWidth disabled={loading}>
                  {loading ? 'Abrindo portal...' : 'Gerenciar assinatura'}
                </Button>
              ) : (
                <Button onClick={handleCheckout} fullWidth disabled={loading}>
                  {loading ? 'Redirecionando...' : 'Finalizar compra'}
                </Button>
              )}
            </div>
            {!isPremium && (
              <p className="text-xs text-[var(--color-text-muted)]">
                Ao continuar, você será redirecionado para o checkout seguro da Stripe.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
          {isPremium ? (
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">O que você liberou</h3>
          ) : (
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">O que você libera</h3>
          )}
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <CheckCircle size={18} className="text-[var(--color-success)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
