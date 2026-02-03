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
  Sun,
  Moon
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeProvider';
import AddMemberModal from '@/components/family/AddMemberModal';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const pathname = usePathname();
  const { user, family, logout, refreshFamily } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    // Refresh family data on mount to get latest members
    refreshFamily();
  }, []);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: TrendingUp, label: 'Transações', href: '/transactions' },
    { icon: FolderOpen, label: 'Categorias', href: '/categories' },
  ];

  const isActive = (href: string) => pathname === href;

  const canAddMember = family && family.memberCount < 2;

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 h-screen transition-all duration-300 z-50
          bg-[var(--color-bg-card)] border-r border-[var(--color-border)]
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            {isExpanded && (
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="DuoFinance" width={40} height={40} className="rounded-xl" />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                  DuoFinance
                </h1>
              </div>
            )}
            {!isExpanded && (
              <div className="w-full flex justify-center">
                <Image src="/logo.svg" alt="DuoFinance" width={40} height={40} className="rounded-xl" />
              </div>
            )}
          </div>

          {/* Family Info */}
          {family && (
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
              <div className={`flex items-center gap-3 ${!isExpanded && 'justify-center'}`}>
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                  <Users className="text-[var(--color-primary-dark)]" size={20} />
                </div>
                {isExpanded && (
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--color-text)] truncate">{family.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {family.memberCount} membro{family.memberCount > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Members */}
              {isExpanded && family.members && family.members.length > 0 && (
                <div className="mt-3 space-y-2">
                  {family.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-success)] flex items-center justify-center text-white text-xs font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[var(--color-text-secondary)] truncate">{member.name}</span>
                      {member.id === user?.id && (
                        <span className="text-xs text-[var(--color-primary)]">(você)</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Member Button */}
              {isExpanded && canAddMember && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-[var(--color-primary)] bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  <UserPlus size={16} />
                  <span>Adicionar membro</span>
                </button>
              )}
            </div>
          )}

          {/* User Info */}
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className={`flex items-center gap-3 ${!isExpanded && 'justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-[var(--color-action)] flex items-center justify-center text-white font-bold">
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
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                        ${active
                          ? 'bg-[var(--color-primary)] text-white shadow-md'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)]'
                        }
                        ${!isExpanded && 'justify-center'}
                      `}
                    >
                      <Icon size={20} />
                      {isExpanded && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Theme Toggle & Logout */}
          <div className="p-4 border-t border-[var(--color-border)] space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl w-full
                text-[var(--color-text-secondary)] cursor-pointer hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)] transition-all
                ${!isExpanded && 'justify-center'}
              `}
            >
              {resolvedTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              {isExpanded && <span className="font-medium">{resolvedTheme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>}
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl w-full
                text-[var(--color-danger)] cursor-pointer hover:bg-[var(--color-danger-light)]/20 transition-all
                ${!isExpanded && 'justify-center'}
              `}
            >
              <LogOut size={20} />
              {isExpanded && <span className="font-medium">Sair</span>}
            </button>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-3 top-20 bg-[var(--color-bg-card)] border-2 border-[var(--color-border)] cursor-pointer rounded-full p-1 hover:bg-[var(--color-bg-elevated)] transition-all"
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
      <div className={`${isExpanded ? 'w-64' : 'w-20'} transition-all duration-300`} />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onMemberAdded={refreshFamily}
      />
    </>
  );
}