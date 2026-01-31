'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import { User, Family, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const familyData = localStorage.getItem('family');

      if (token && userData) {
        setUser(JSON.parse(userData));
        if (familyData) {
          setFamily(JSON.parse(familyData));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshFamily = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await authService.getFamily();
      if (data.family) {
        setFamily(data.family);
        localStorage.setItem('family', JSON.stringify(data.family));
      }
    } catch (error) {
      console.error('Erro ao atualizar família:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.family) {
        localStorage.setItem('family', JSON.stringify(data.family));
        setFamily(data.family);
      }

      setUser(data.user);
      router.push('/');

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login'
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await authService.register({ name, email, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.family) {
        localStorage.setItem('family', JSON.stringify(data.family));
        setFamily(data.family);
      }

      setUser(data.user);
      router.push('/');

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar conta'
      };
    }
  };

  const registerFamily = async (familyName: string, name: string, email: string, password: string) => {
    try {
      const data = await authService.registerFamily({ familyName, name, email, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.family) {
        localStorage.setItem('family', JSON.stringify(data.family));
        setFamily(data.family);
      }

      setUser(data.user);
      router.push('/');

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar família'
      };
    }
  };

  const addMember = async (name: string, email: string, password?: string, sendEmailLink?: boolean) => {
    try {
      const data = await authService.addMember({ name, email, password, sendEmailLink });

      // Refresh family to get updated member list (don't let this fail the whole operation)
      try {
        await refreshFamily();
      } catch (refreshError) {
        console.error('Erro ao atualizar família após adicionar membro:', refreshError);
      }

      return {
        success: true,
        setupUrl: data.setupUrl
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao adicionar membro'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('family');
    setUser(null);
    setFamily(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, family, loading, login, register, registerFamily, addMember, logout, refreshFamily }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);