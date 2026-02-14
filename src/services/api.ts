import axios, { InternalAxiosRequestConfig } from 'axios';
import { toastApiError, wasApiErrorToastShown } from '@/utils/notifications';

// Check if secure auth is enabled (httpOnly cookies + CSRF)
const isSecureAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_SECURE_AUTH === 'true';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: isSecureAuthEnabled, // Send cookies when secure auth is enabled
});

// Cache for CSRF token
let csrfToken: string | null = null;

// Function to get CSRF token
const getCsrfToken = async (): Promise<string | null> => {
  if (!isSecureAuthEnabled) return null;

  if (csrfToken) return csrfToken;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/csrf-token`,
      { withCredentials: true }
    );
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

// Clear CSRF token (call on logout)
export const clearCsrfToken = () => {
  csrfToken = null;
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      if (isSecureAuthEnabled) {
        // Add CSRF token for mutating requests
        const method = config.method?.toLowerCase();
        if (['post', 'put', 'delete', 'patch'].includes(method || '')) {
          const token = await getCsrfToken();
          if (token) {
            config.headers['X-CSRF-Token'] = token;
          }
        }
      } else {
        // Fallback: use Bearer token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const method = error.config?.method?.toLowerCase();
      const isMutatingRequest = ['post', 'put', 'delete', 'patch'].includes(method || '');

      if (isMutatingRequest && !wasApiErrorToastShown(error)) {
        toastApiError(error, 'Nao foi possivel concluir a operacao. Tente novamente.');
      }

      if (error.response?.status === 401) {
        // Clear auth state
        if (!isSecureAuthEnabled) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('family');
        }
        clearCsrfToken();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    clearCsrfToken();
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  registerFamily: async (data: { familyName: string; name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register-family', data);
    return response.data;
  },

  addMember: async (data: { name: string; email: string; password?: string; sendEmailLink?: boolean }) => {
    const response = await api.post('/auth/add-member', data);
    return response.data;
  },

  setupPassword: async (data: { token: string; password: string }) => {
    const response = await api.post('/auth/setup-password', data);
    return response.data;
  },

  getFamily: async () => {
    const response = await api.get('/auth/family');
    return response.data;
  },

  loginWithGoogle: async (idToken: string) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },
};

export const billingService = {
  checkout: async (plan: 'monthly' | 'annual') => {
    const response = await api.post('/billing/checkout', { plan });
    return response.data;
  },

  portal: async () => {
    const response = await api.post('/billing/portal');
    return response.data;
  },
};

export const categoryService = {
  list: async (type?: 'income' | 'expense' | 'investment') => {
    const response = await api.get('/categories', { params: type ? { type } : {} });
    return response.data;
  },

  create: async (data: { name: string; color: string; type: 'income' | 'expense' | 'investment'; essential: boolean }) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const spendingLimitService = {
  list: async () => {
    const response = await api.get('/spending-limits');
    return response.data;
  },

  create: async (data: { amount: number; categoryId: string; startDate: string; endDate: string }) => {
    const response = await api.post('/spending-limits', data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      amount?: number;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await api.put(`/spending-limits/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/spending-limits/${id}`);
    return response.data;
  },
};

export const goalService = {
  list: async () => {
    const response = await api.get('/goals');
    return response.data;
  },

  create: async (data: {
    description: string;
    totalAmount: number;
    targetDate: string;
    initialAmount?: number;
    color: string;
  }) => {
    const response = await api.post('/goals', data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      description?: string;
      totalAmount?: number;
      targetDate?: string;
      initialAmount?: number;
      color?: string;
    }
  ) => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },

  delete: async (id: string, cascade: boolean = false) => {
    await api.delete(`/goals/${id}`, { params: { cascade } });
  },
};

export const bankAccountService = {
  list: async () => {
    const response = await api.get('/bank-accounts');
    return response.data;
  },
  create: async (data: { name: string; type: string; color: string; initialBalance: number }) => {
    const response = await api.post('/bank-accounts', data);
    return response.data;
  },
  update: async (id: string, data: { name: string; color: string }) => {
    const response = await api.put(`/bank-accounts/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/bank-accounts/${id}`);
    return response.data;
  },
};



export const transactionService = {
  list: async (params?: { month?: number; year?: number; type?: string; categoryId?: string }) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  create: async (data: {
    description: string;
    amount: number;
    type: 'income' | 'expense' | 'investment';
    categoryId?: string;
    goalId?: string;
    bankAccountId?: string;
    date?: string;
    isFixed?: boolean;
    isEffective?: boolean;
  }) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  getSummary: async (params?: { month?: number; year?: number }) => {
    const response = await api.get('/transactions/summary', { params });
    return response.data;
  },

  update: async (
    id: string,
    data: {
      description?: string;
      amount?: number;
      type?: 'income' | 'expense' | 'investment';
      categoryId?: string;
      goalId?: string;
      bankAccountId?: string;
      date?: string;
    }
  ) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string, deleteMode: 'single' | 'all' = 'single') => {
    const response = await api.delete(`/transactions/${id}`, {
      params: { deleteMode },
    });
    return response.data;
  },

  effectivate: async (data: { id: string } | { effectivations: { id: string }[] }) => {
    const response = await api.post('/transactions/effectivate', data);
    return response.data;
  },
};

export const creditCardService = {
  list: async (params?: { month?: number; year?: number }) => {
    const response = await api.get('/credit-cards', { params });
    return response.data;
  },

  create: async (data: {
    name: string;
    limit: number;
    currentInvoiceAmount?: number;
    brand: string;
    closingDay: number;
    dueDay: number;
    color: string;
    bankAccountId: string;
  }) => {
    const response = await api.post('/credit-cards', data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      limit?: number;
      brand?: string;
      closingDay?: number;
      dueDay?: number;
      color?: string;
      bankAccountId?: string;
    }
  ) => {
    const response = await api.put(`/credit-cards/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/credit-cards/${id}`);
    return response.data;
  },

  createTransaction: async (
    cardId: string,
    data: {
      description: string;
      amount: number;
      categoryId: string;
      type: 'single' | 'installment' | 'fixed';
      installments?: number;
      date?: string;
    }
  ) => {
    const response = await api.post(`/credit-cards/${cardId}/transactions`, data);
    return response.data;
  },

  deleteTransaction: async (cardId: string, transactionId: string, deleteMode?: 'all') => {
    const response = await api.delete(`/credit-cards/${cardId}/transactions/${transactionId}`, {
      params: deleteMode ? { deleteMode } : {},
    });
    return response.data;
  },

  payInvoice: async (cardId: string, month: number, year: number) => {
    const response = await api.post(`/credit-cards/${cardId}/invoices/pay`, { month, year });
    return response.data;
  },
};

export default api;
