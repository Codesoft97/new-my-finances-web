'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FolderOpen, 
  TrendingUp, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: TrendingUp, label: 'Transações', href: '/transactions' },
    { icon: FolderOpen, label: 'Categorias', href: '/categories' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 z-50
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            {isExpanded && (
              <div className="flex items-center gap-2">
                <Wallet className="text-primary-600" size={28} />
                <h1 className="font-bold text-lg text-gray-900">
                  Minhas Finanças
                </h1>
              </div>
            )}
            {!isExpanded && (
              <div className="w-full flex justify-center">
                <Wallet className="text-primary-600" size={28} />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className={`flex items-center gap-3 ${!isExpanded && 'justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
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
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${active 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${!isExpanded && 'justify-center'}
                      `}
                    >
                      <Icon size={20} />
                      {isExpanded && <span className="font-medium">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg w-full
                text-red-600 hover:bg-red-50 transition-all
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
            className="absolute -right-3 top-20 bg-white border-2 border-gray-200 rounded-full p-1 hover:bg-gray-50 transition-all"
          >
            {isExpanded ? (
              <ChevronLeft size={20} className="text-gray-600" />
            ) : (
              <ChevronRight size={20} className="text-gray-600" />
            )}
          </button>
        </div>
      </aside>

      {/* Spacer */}
      <div className={`${isExpanded ? 'w-64' : 'w-20'} transition-all duration-300`} />
    </>
  );
}