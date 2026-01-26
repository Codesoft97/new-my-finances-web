import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const categoryService = {
  list: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (data: { name: string; color: string }) => {
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
  }) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  getSummary: async (params?: { month?: number; year?: number }) => {
    const response = await api.get('/transactions/summary', { params });
    return response.data;
  },
};

export default api;