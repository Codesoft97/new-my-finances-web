
import { bankAccountService } from '../api';
import api from '../api';

// Mock axios
jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      defaults: { headers: { common: {} } },
    })),
  };
});

describe('bankAccountService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list bank accounts', async () => {
    const mockAccounts = [
      { _id: '1', name: 'Nubank', balance: 100 },
      { _id: '2', name: 'Inter', balance: 200 },
    ];
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockAccounts });

    const result = await bankAccountService.list();

    expect(api.get).toHaveBeenCalledWith('/bank-accounts');
    expect(result).toEqual(mockAccounts);
  });

  it('should create a bank account', async () => {
    const newAccount = {
      name: 'Nubank',
      type: 'checking',
      color: '#820AD1',
      initialBalance: 0,
    };
    const createdAccount = { ...newAccount, _id: '123' };
    (api.post as jest.Mock).mockResolvedValueOnce({ data: createdAccount });

    const result = await bankAccountService.create(newAccount);

    expect(api.post).toHaveBeenCalledWith('/bank-accounts', newAccount);
    expect(result).toEqual(createdAccount);
  });
});
