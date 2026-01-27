'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { transactionService } from '@/services/api';
import { TransactionSummary } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<TransactionSummary>({ income: 0, expense: 0, balance: 0 });

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const currentDate = new Date();
      const data = await transactionService.getSummary({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      });
      setSummary(data.summary);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao seu painel financeiro
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-100 text-sm font-medium">Receitas</span>
              <TrendingUp size={24} />
            </div>
            <p className="text-3xl font-bold mb-1">{formatCurrency(summary.income)}</p>
            <p className="text-green-100 text-sm">Mês atual</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-red-100 text-sm font-medium">Despesas</span>
              <TrendingDown size={24} />
            </div>
            <p className="text-3xl font-bold mb-1">{formatCurrency(summary.expense)}</p>
            <p className="text-red-100 text-sm">Mês atual</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-100 text-sm font-medium">Saldo</span>
              <DollarSign size={24} />
            </div>
            <p className="text-3xl font-bold mb-1">{formatCurrency(summary.balance)}</p>
            <p className="text-blue-100 text-sm">Mês atual</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-purple-100 text-sm font-medium">Objetivos</span>
              <Target size={24} />
            </div>
            <p className="text-3xl font-bold mb-1">0</p>
            <p className="text-purple-100 text-sm">Em breve</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Sistema Completo!
            </h2>
            <p className="text-gray-600 mb-6">
              Seu aplicativo de finanças está pronto para uso
            </p>
            <ul className="text-left max-w-md mx-auto space-y-3 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Autenticação completa (Login/Registro)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Menu lateral expansível
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Gerenciamento de categorias
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Controle de transações (Receitas/Despesas)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Filtro por mês e ano
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Resumo financeiro em tempo real
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                TypeScript em todo o projeto
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}