import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '@/services/api';

// Mock the API service
jest.mock('@/services/api', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
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

describe('AuthContext', () => {
  const mockUser = { id: '1', name: 'Test User', email: 'test@test.com' };
  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders children correctly', () => {
    render(
      <AuthProvider>
        <div>Child content</div>
      </AuthProvider>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('starts with no user when localStorage is empty', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('loads user from localStorage on mount', async () => {
    (localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'token') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
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
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
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
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
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
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
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

  it('handles logout', async () => {
    const user = userEvent.setup();
    (localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'token') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.name);
    });

    await user.click(screen.getByText('Logout'));

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
