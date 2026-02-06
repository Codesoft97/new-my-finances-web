export interface User {
  id: string;
  name: string;
  email: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
}

export interface Family {
  id: string;
  name: string;
  memberCount: number;
  plan?: 'free' | 'premium';
  subscriptionStatus?: 'active' | 'none' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired';
  planInterval?: 'monthly' | 'annual';
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  trialEndsAt?: string | null;
  members?: FamilyMember[];
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  _id: string; // Mongoose default
  id?: string;  // API response variant
  description: string;
  totalAmount: number;
  valorAportado: number;
  valorRestante: number;
  aporteMensalNecessario: number;
  targetDate: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  _id: string;
  name: string;
  type: 'checking' | 'payment' | 'salary' | 'savings';
  color: string;
  balance: number;
  familyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  categoryId?: Category; // Make optional for investment type
  goalId?: Goal; // Add optional goal reference
  bankAccountId?: BankAccount;
  userId: string;
  date: string;
  isFixed: boolean;
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
  family: Family | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerFamily: (familyName: string, name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  addMember: (name: string, email: string, password?: string, sendEmailLink?: boolean) => Promise<{ success: boolean; message?: string; setupUrl?: string }>;
  logout: () => void;
  refreshFamily: () => Promise<void>;
}
