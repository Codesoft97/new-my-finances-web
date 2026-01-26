export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: Category;
  userId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}