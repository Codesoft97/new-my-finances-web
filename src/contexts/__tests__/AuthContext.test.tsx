import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '@/services/api';

// Mock the API service
jest.mock('@/services/api', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
    getFamily: jest.fn(),
  },
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Test component to access auth context
function TestComponent() {
  const { user, loading, login, register, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => register('Test', 'test@test.com', 'password')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Wrapper with QueryClientProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe('AuthContext', () => {
  const mockUser = { id: '1', name: 'Test User', email: 'test@test.com' };
  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset environment variable mock
    process.env.NEXT_PUBLIC_ENABLE_SECURE_AUTH = 'false';
  });

  it('renders children correctly', () => {
    render(
      <TestWrapper>
        <div>Child content</div>
      </TestWrapper>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('starts with no user when localStorage is empty', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('loads user from localStorage on mount when secure auth is disabled', async () => {
    (localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'token') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.name);
    });
  });

  it('handles successful login', async () => {
    const user = userEvent.setup();
    (authService.login as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles failed login', async () => {
    const user = userEvent.setup();
    (authService.login as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByText('Login'));

    // Login should fail but not crash
    expect(authService.login).toHaveBeenCalled();
  });

  it('handles successful registration', async () => {
    const user = userEvent.setup();
    (authService.register as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    await user.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles logout and calls logout API', async () => {
    const user = userEvent.setup();
    (localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'token') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });
    (authService.logout as jest.Mock).mockResolvedValueOnce({});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.name);
    });

    await user.click(screen.getByText('Logout'));

    expect(authService.logout).toHaveBeenCalled();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
