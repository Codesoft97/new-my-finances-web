'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/api';
import { User, Family, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Check if secure auth is enabled
const isSecureAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_SECURE_AUTH === 'true';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isSecureAuthEnabled) {
      // Verify session via API call
      checkAuth();
    } else {
      // Fallback: load from localStorage
      loadUserFromStorage();
    }
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

  const checkAuth = async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user);
      if (data.family) {
        setFamily(data.family);
      }
    } catch (error) {
      // No valid session
      setUser(null);
      setFamily(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshFamily = useCallback(async () => {
    try {
      if (!isSecureAuthEnabled) {
        const token = localStorage.getItem('token');
        if (!token) return;
      }

      const data = await authService.getFamily();
      if (data.family) {
        setFamily(data.family);
        if (!isSecureAuthEnabled) {
          localStorage.setItem('family', JSON.stringify(data.family));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar família:', error);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });

      if (!isSecureAuthEnabled) {
        // Fallback: store in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.family) {
          localStorage.setItem('family', JSON.stringify(data.family));
        }
      }

      setUser(data.user);
      if (data.family) {
        setFamily(data.family);
      }

      router.push('/');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login'
      };
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      const data = await authService.loginWithGoogle(idToken);

      if (!isSecureAuthEnabled) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.family) {
          localStorage.setItem('family', JSON.stringify(data.family));
        }
      }

      setUser(data.user);
      if (data.family) {
        setFamily(data.family);
      }

      router.push('/');
      return { success: true };
    } catch (error: any) {
      const code = error.response?.data?.code;
      let message = error.response?.data?.message || 'Erro ao fazer login com Google';

      if (code === 'EMAIL_EXISTS_LOCAL') {
        message = 'Este email já está cadastrado com senha. Por favor, faça login com email e senha.';
      }

      return {
        success: false,
        message
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await authService.register({ name, email, password });

      if (!isSecureAuthEnabled) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.family) {
          localStorage.setItem('family', JSON.stringify(data.family));
        }
      }

      setUser(data.user);
      if (data.family) {
        setFamily(data.family);
      }

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

      if (!isSecureAuthEnabled) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.family) {
          localStorage.setItem('family', JSON.stringify(data.family));
        }
      }

      setUser(data.user);
      if (data.family) {
        setFamily(data.family);
      }

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

      // Refresh family to get updated member list
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

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }

    // Clear React Query cache for security (prevent data leakage)
    queryClient.clear();

    if (!isSecureAuthEnabled) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('family');
    }

    setUser(null);
    setFamily(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, family, loading, login, loginWithGoogle, register, registerFamily, addMember, logout, refreshFamily }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
