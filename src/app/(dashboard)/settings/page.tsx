'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Settings, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import FirstAccessTutorialModal from '@/components/tutorial/FirstAccessTutorialModal';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { family, user, refreshFamily } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    refreshFamily();
  }, [refreshFamily]);

  const members = family?.members ?? [];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Settings size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-[var(--color-text)]">Configurações</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Gerencie dados da familia e acesso rapido ao tutorial.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4">
          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <div className="flex items-center gap-2 mb-3 text-[var(--color-text)]">
              <Users size={18} className="text-[var(--color-primary)]" />
              <h2 className="font-semibold">Familia</h2>
            </div>

            {!family ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                Carregando informacoes da familia...
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Nome da familia</p>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{family.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Membros</p>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {family.memberCount}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Lista de membros</p>
                  <div className="mt-2 space-y-2">
                    {members.length === 0 ? (
                      <p className="text-sm text-[var(--color-text-secondary)]">Nenhum membro adicional.</p>
                    ) : (
                      members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2 text-[var(--color-text)]">
                            <div className="w-7 h-7 rounded-sm bg-[var(--color-success)] text-white flex items-center justify-center text-xs font-semibold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{member.name}</span>
                          </div>
                          {member.id === user?.id && (
                            <span className="text-xs text-[var(--color-primary)]">(voce)</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <div className="flex items-center gap-2 mb-3 text-[var(--color-text)]">
              <BookOpen size={18} className="text-[var(--color-primary)]" />
              <h2 className="font-semibold">Tutorial de primeiro acesso</h2>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Reveja o passo a passo sempre que precisar. Novas etapas aparecerao aqui no futuro.
            </p>
            <Button onClick={() => setShowTutorial(true)}>
              Rever tutorial
            </Button>
          </div>
        </section>
      </div>

      <FirstAccessTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onFinish={() => setShowTutorial(false)}
        allowSkip={false}
      />
    </div>
  );
}
