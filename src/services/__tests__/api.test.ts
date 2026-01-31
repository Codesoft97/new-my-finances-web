import axios from 'axios';
import { authService, categoryService, transactionService } from '../api';

// Mock axios
jest.mock('axios', () => {
  const mockAxios: Record<string, unknown> = {
    create: jest.fn(() => mockAxios),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return mockAxios;
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authService', () => {
    describe('register', () => {
      it('sends POST request with registration data', async () => {
        const userData = { name: 'John', email: 'john@test.com', password: '123456' };
        const response = { data: { user: userData, token: 'token123' } };
        mockedAxios.post.mockResolvedValueOnce(response);

        const result = await authService.register(userData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', userData);
        expect(result).toEqual(response.data);
      });
    });

    describe('login', () => {
      it('sends POST request with credentials', async () => {
        const credentials = { email: 'john@test.com', password: '123456' };
        const response = { data: { user: { name: 'John' }, token: 'token123' } };
        mockedAxios.post.mockResolvedValueOnce(response);

        const result = await authService.login(credentials);

        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', credentials);
        expect(result).toEqual(response.data);
      });
    });

    describe('getMe', () => {
      it('sends GET request to fetch current user', async () => {
        const response = { data: { user: { name: 'John', email: 'john@test.com' } } };
        mockedAxios.get.mockResolvedValueOnce(response);

        const result = await authService.getMe();

        expect(mockedAxios.get).toHaveBeenCalledWith('/auth/me');
        expect(result).toEqual(response.data);
      });
    });

    describe('registerFamily', () => {
      it('sends POST request with family and user data', async () => {
        const familyData = { familyName: 'Família Silva', name: 'João', email: 'joao@test.com', password: '123456' };
        const response = { data: { user: { name: 'João' }, family: { name: 'Família Silva' }, token: 'token123' } };
        mockedAxios.post.mockResolvedValueOnce(response);

        const result = await authService.registerFamily(familyData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register-family', familyData);
        expect(result).toEqual(response.data);
      });
    });

    describe('addMember', () => {
      it('sends POST request with member data and password', async () => {
        const memberData = { name: 'Maria', email: 'maria@test.com', password: '123456' };
        const response = { data: { user: { name: 'Maria' }, message: 'Membro adicionado' } };
        mockedAxios.post.mockResolvedValueOnce(response);

        const result = await authService.addMember(memberData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/add-member', memberData);
        expect(result).toEqual(response.data);
      });

      it('sends POST request with sendEmailLink option', async () => {
        const memberData = { name: 'Maria', email: 'maria@test.com', sendEmailLink: true };
        const response = { data: { user: { name: 'Maria' }, setupUrl: 'http://localhost/setup?token=abc' } };
        mockedAxios.post.mockResolvedValueOnce(response);

        const result = await authService.addMember(memberData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/add-member', memberData);
        expect(result).toEqual(response.data);
      });
    });

    describe('setupPassword', () => {
      it('sends POST request with token and password', async () => {
        const setupData = { token: 'abc123', password: 'newpassword' };
        const response = { data: { message: 'Senha configurada' } };
        mockedAxios.post.mockResolvedValueOnce(response);

        const result = await authService.setupPassword(setupData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/setup-password', setupData);
        expect(result).toEqual(response.data);
      });
    });

    describe('getFamily', () => {
      it('sends GET request to fetch family data', async () => {
        const response = { data: { family: { id: '1', name: 'Família Silva', memberCount: 2, members: [] } } };
        mockedAxios.get.mockResolvedValueOnce(response);

        const result = await authService.getFamily();

        expect(mockedAxios.get).toHaveBeenCalledWith('/auth/family');
        expect(result).toEqual(response.data);
      });
    });
  });

  describe('categoryService', () => {
    describe('list', () => {
      it('sends GET request to fetch categories', async () => {
        const response = { data: { categories: [{ _id: '1', name: 'Food', color: '#ff0000' }] } };
        mockedAxios.get.mockResolvedValueOnce(response);

        const result = await categoryService.list();

        expect(mockedAxios.get).toHaveBeenCalledWith('/categories', { params: {} });
        expect(result).toEqual(response.data);
      });
    });

    describe('create', () => {
      it('sends POST request with category data', async () => {
        const categoryData = { name: 'Transport', color: '#00ff00', type: 'expense' as const };
        const response = { data: { category: { ...categoryData, _id: '2' } } };
        mockedAxios.post.mockResolvedValueOnce(response);

        const result = await categoryService.create(categoryData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/categories', categoryData);
        expect(result).toEqual(response.data);
      });
    });

    describe('delete', () => {
      it('sends DELETE request with category id', async () => {
        const response = { data: { message: 'Category deleted' } };
        mockedAxios.delete.mockResolvedValueOnce(response);

        const result = await categoryService.delete('123');

        expect(mockedAxios.delete).toHaveBeenCalledWith('/categories/123');
        expect(result).toEqual(response.data);
      });
    });
  });

  describe('transactionService', () => {
    describe('list', () => {
      it('sends GET request with optional params', async () => {
        const response = { data: { transactions: [] } };
        mockedAxios.get.mockResolvedValueOnce(response);

        const result = await transactionService.list({ month: 1, year: 2026 });

        expect(mockedAxios.get).toHaveBeenCalledWith('/transactions', { params: { month: 1, year: 2026 } });
        expect(result).toEqual(response.data);
      });

      it('sends GET request without params', async () => {
        const response = { data: { transactions: [] } };
        mockedAxios.get.mockResolvedValueOnce(response);

        const result = await transactionService.list();

        expect(mockedAxios.get).toHaveBeenCalledWith('/transactions', { params: undefined });
        expect(result).toEqual(response.data);
      });
    });

    describe('create', () => {
      it('sends POST request with transaction data', async () => {
        const transactionData = {
          description: 'Salary',
          amount: 5000,
          type: 'income' as const,
          categoryId: 'cat123',
        };
        const response = { data: { transaction: { _id: 'trans123', ...transactionData } } };
        mockedAxios.post.mockResolvedValueOnce(response);

        const result = await transactionService.create(transactionData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/transactions', transactionData);
        expect(result).toEqual(response.data);
      });

      it('sends POST request with isFixed flag', async () => {
        const transactionData = {
          description: 'Rent',
          amount: 1500,
          type: 'expense' as const,
          categoryId: 'cat456',
          isFixed: true,
        };
        const response = { data: { transaction: { _id: 'trans456', ...transactionData } } };
        mockedAxios.post.mockResolvedValueOnce(response);

        const result = await transactionService.create(transactionData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/transactions', transactionData);
        expect(result).toEqual(response.data);
      });
    });

    describe('getSummary', () => {
      it('sends GET request with params', async () => {
        const response = { data: { summary: { income: 5000, expense: 2000, balance: 3000 } } };
        mockedAxios.get.mockResolvedValueOnce(response);

        const result = await transactionService.getSummary({ month: 1, year: 2026 });

        expect(mockedAxios.get).toHaveBeenCalledWith('/transactions/summary', { params: { month: 1, year: 2026 } });
        expect(result).toEqual(response.data);
      });
    });

    describe('update', () => {
      it('sends PUT request with transaction id and data', async () => {
        const updateData = { description: 'Updated Salary', amount: 5500 };
        const response = { data: { transaction: { _id: 'trans123', ...updateData } } };
        mockedAxios.put.mockResolvedValueOnce(response);

        const result = await transactionService.update('trans123', updateData);

        expect(mockedAxios.put).toHaveBeenCalledWith('/transactions/trans123', updateData);
        expect(result).toEqual(response.data);
      });
    });

    describe('delete', () => {
      it('sends DELETE request with single mode by default', async () => {
        const response = { data: { message: 'Transaction deleted', deletedCount: 1 } };
        mockedAxios.delete.mockResolvedValueOnce(response);

        const result = await transactionService.delete('trans123');

        expect(mockedAxios.delete).toHaveBeenCalledWith('/transactions/trans123', { params: { deleteMode: 'single' } });
        expect(result).toEqual(response.data);
      });

      it('sends DELETE request with all mode for fixed expenses', async () => {
        const response = { data: { message: '5 transactions deleted', deletedCount: 5 } };
        mockedAxios.delete.mockResolvedValueOnce(response);

        const result = await transactionService.delete('trans123', 'all');

        expect(mockedAxios.delete).toHaveBeenCalledWith('/transactions/trans123', { params: { deleteMode: 'all' } });
        expect(result).toEqual(response.data);
      });
    });
  });
});
