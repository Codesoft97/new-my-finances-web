'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isPremiumFamily } from '@/utils/billing';

interface PremiumPlanCardProps {
  variant?: 'sidebar' | 'settings';
  isSidebarExpanded?: boolean;
}

export default function PremiumPlanCard({
  variant = 'sidebar',
  isSidebarExpanded = true,
}: PremiumPlanCardProps) {
  const { family } = useAuth();
  const isPremium = isPremiumFamily(family);
  const [isExpanded, setIsExpanded] = useState(variant === 'settings');

  if (variant === 'sidebar' && !isSidebarExpanded) {
    return (
      <Link
        href="/premium"
        className="w-full flex items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 transition-colors"
        title="Plano Premium"
      >
        <Crown size={18} className={isPremium ? 'text-[var(--color-success)]' : 'text-[var(--color-action)]'} />
      </Link>
    );
  }

  const showDetails = variant === 'settings' ? true : isExpanded;

  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
      <div
        className={`flex items-center justify-between ${variant === 'settings' ? '' : 'cursor-pointer'}`}
        onClick={() => {
          if (variant === 'settings') return;
          setIsExpanded((prev) => !prev);
        }}
      >
        <div className="flex items-center gap-2 text-[var(--color-text)]">
          <Crown size={18} className={isPremium ? 'text-[var(--color-success)]' : 'text-[var(--color-action)]'} />
          <span className="font-semibold">Plano Premium</span>
        </div>
        {variant === 'settings' ? null : (
          isExpanded ? (
            <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />
          ) : (
            <ChevronRight size={16} className="text-[var(--color-text-secondary)]" />
          )
        )}
      </div>

      {showDetails && (
        <div className="mt-2">
          <p className="text-xs text-[var(--color-text-muted)]">
            {isPremium
              ? 'Aproveite recursos exclusivos para sua familia.'
              : 'Desbloqueie Objetivos e recursos exclusivos.'}
          </p>
          <Link
            href="/premium"
            className={`mt-3 inline-flex items-center justify-center w-full px-3 py-2 rounded-md font-semibold transition-colors
              ${isPremium
                ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20'
                : 'bg-[var(--color-action)] text-white hover:bg-[var(--color-action-dark)]'}
            `}
          >
            {isPremium ? 'Ver detalhes' : 'Ver planos'}
          </Link>
        </div>
      )}
    </div>
  );
}
