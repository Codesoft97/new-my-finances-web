'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FolderOpen,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  Target,
  Crown,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Landmark
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeProvider';
import AddMemberModal from '@/components/family/AddMemberModal';
import { isPremiumFamily } from '@/utils/billing';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isFamilyExpanded, setIsFamilyExpanded] = useState(false);
  const [isPremiumExpanded, setIsPremiumExpanded] = useState(false);
  const pathname = usePathname();
  const { user, family, logout, refreshFamily } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isPremium = isPremiumFamily(family);

  useEffect(() => {
    // Refresh family data on mount to get latest members
    refreshFamily();
  }, [refreshFamily]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: TrendingUp, label: 'Transações', href: '/transactions' },
    { icon: FolderOpen, label: 'Categorias', href: '/categories' },
    { icon: Landmark, label: 'Contas', href: '/bank-accounts' },
    ...(isPremium ? [{ icon: Target, label: 'Objetivos', href: '/goals' }] : []),
  ];

  const isActive = (href: string) => pathname === href;

  const canAddMember = family && family.memberCount < 2;

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-[var(--color-bg-card)] rounded-md shadow-sm md:hidden border border-[var(--color-border)] text-[var(--color-text)]"
      >
        <Menu size={24} />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen transition-all duration-300 z-50
          bg-[var(--color-bg-card)] border-r border-[var(--color-border)]
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            {isExpanded && (
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="DuoFinance" width={40} height={40} className="rounded-md" />
                <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                  DuoFinance
                </h1>
              </div>
            )}
            {!isExpanded && (
              <div className="w-full flex justify-center">
                <Image src="/logo.svg" alt="DuoFinance" width={40} height={40} className="rounded-md" />
              </div>
            )}

            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-[var(--color-text-secondary)]"
            >
              <X size={24} />
            </button>
          </div>

          {/* Family Info */}
          {family && (
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
              <div
                className={`flex items-center gap-3 ${!isExpanded && 'justify-center'} ${isExpanded ? 'cursor-pointer' : ''}`}
                onClick={() => isExpanded && setIsFamilyExpanded(!isFamilyExpanded)}
              >
                <div className="w-10 h-10 rounded-md bg-[var(--color-primary-light)] flex items-center justify-center">
                  <Users className="text-[var(--color-primary-dark)]" size={20} />
                </div>
                {isExpanded && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--color-text)] truncate">{family.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {family.memberCount} membro{family.memberCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    {isFamilyExpanded ? (
                      <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />
                    ) : (
                      <ChevronRight size={16} className="text-[var(--color-text-secondary)]" />
                    )}
                  </>
                )}
              </div>

              {/* Members */}
              {isExpanded && isFamilyExpanded && family.members && family.members.length > 0 && (
                <div className="mt-3 space-y-2">
                  {family.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-sm bg-[var(--color-success)] flex items-center justify-center text-white text-xs font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[var(--color-text-secondary)] truncate">{member.name}</span>
                      {member.id === user?.id && (
                        <span className="text-xs text-[var(--color-primary)]">(você)</span>
                      )}
                    </div>
                  ))}

                  {/* Add Member Button - Only show when expanded */}
                  {canAddMember && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddMember(true);
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-[var(--color-primary)] bg-[var(--color-bg-card)] rounded-md border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors cursor-pointer"
                    >
                      <UserPlus size={16} />
                      <span>Adicionar membro</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Info */}
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className={`flex items-center gap-3 ${!isExpanded && 'justify-center'}`}>
              <div className="w-10 h-10 rounded-md bg-[var(--color-action)] flex items-center justify-center text-white font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--color-text)] truncate">{user?.name}</p>
                  <p className="text-sm text-[var(--color-text-muted)] truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium
                        ${active
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)]'
                        }
                        ${!isExpanded && 'justify-center px-2'}
                      `}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {isExpanded && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Premium CTA */}
          <div className="p-4 border-b border-[var(--color-border)]">
            {isExpanded ? (
              <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setIsPremiumExpanded(!isPremiumExpanded)}
                >
                  <div className="flex items-center gap-2 text-[var(--color-text)]">
                    <Crown size={18} className={isPremium ? 'text-[var(--color-success)]' : 'text-[var(--color-action)]'} />
                    <span className="font-semibold">Plano Premium</span>
                  </div>
                  {isPremiumExpanded ? (
                    <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />
                  ) : (
                    <ChevronRight size={16} className="text-[var(--color-text-secondary)]" />
                  )}
                </div>

                {isPremiumExpanded && (
                  <div className="mt-2">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {isPremium
                        ? 'Aproveite recursos exclusivos para sua família.'
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
            ) : (
              <Link
                href="/premium"
                className="w-full flex items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 transition-colors"
                title="Plano Premium"
              >
                <Crown size={18} className={isPremium ? 'text-[var(--color-success)]' : 'text-[var(--color-action)]'} />
              </Link>
            )}
          </div>

          {/* Theme Toggle & Logout */}
          <div className="p-4 border-t border-[var(--color-border)] space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md w-full
                text-[var(--color-text-secondary)] cursor-pointer hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] transition-colors
                ${!isExpanded && 'justify-center px-2'}
              `}
            >
              {resolvedTheme === 'light' ?
                <Moon size={20} className="flex-shrink-0" /> :
                <Sun size={20} className="flex-shrink-0" />
              }
              {isExpanded && <span className="font-medium">{resolvedTheme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>}
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md w-full
                text-[var(--color-danger)] cursor-pointer hover:bg-[var(--color-danger-light)]/20 transition-colors
                ${!isExpanded && 'justify-center px-2'}
              `}
            >
              <LogOut size={20} className="flex-shrink-0" />
              {isExpanded && <span className="font-medium">Sair</span>}
            </button>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden md:block absolute -right-3 top-14 bg-[var(--color-bg-card)] border border-[var(--color-border)] cursor-pointer rounded-md p-1.5 hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            {isExpanded ? (
              <ChevronLeft size={20} className="text-[var(--color-text-secondary)]" />
            ) : (
              <ChevronRight size={20} className="text-[var(--color-text-secondary)]" />
            )}
          </button>
        </div>
      </aside>

      {/* Spacer */}
      {/* Spacer for Desktop only */}
      <div className={`hidden md:block ${isExpanded ? 'w-64' : 'w-20'} transition-all duration-300`} />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onMemberAdded={refreshFamily}
      />
    </>
  );
}
