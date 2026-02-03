import axios, { InternalAxiosRequestConfig } from 'axios';

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
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
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
};

export const categoryService = {
  list: async (type?: 'income' | 'expense') => {
    const response = await api.get('/categories', { params: type ? { type } : {} });
    return response.data;
  },

  create: async (data: { name: string; color: string; type: 'income' | 'expense' }) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const transactionService = {
  list: async (params?: { month?: number; year?: number }) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  create: async (data: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    categoryId: string;
    date?: string;
    isFixed?: boolean;
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
      type?: 'income' | 'expense';
      categoryId?: string;
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
};

export default api;