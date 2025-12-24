import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../../../hooks/useAuth';

// Mock the useAuth hook
const mockLogin = vi.fn();
const mockUseAuth = {
  login: mockLogin,
  user: null,
  token: null,
  loading: false,
  signup: vi.fn(),
  logout: vi.fn(),
  verifyEmail: vi.fn(),
  isAuthenticated: false,
};

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { state: null };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.state = null;
  });

  it('renders login form correctly', () => {
    renderLogin();
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue your motion design journey')).toBeInTheDocument();
    
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderLogin();
    
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits form with valid credentials', async () => {
    mockLogin.mockResolvedValueOnce({});
    renderLogin();
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('john@example.com', 'password123');
    });
  });

  it('navigates to dashboard after successful login', async () => {
    mockLogin.mockResolvedValueOnce({});
    renderLogin();
    
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('navigates to intended page after login when redirected', async () => {
    mockLocation.state = { from: { pathname: '/courses' } };
    mockLogin.mockResolvedValueOnce({});
    renderLogin();
    
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/courses', { replace: true });
    });
  });

  it('handles login errors', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));
    renderLogin();
    
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
    
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('clears field errors when user starts typing', async () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText('Email Address');
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    
    // Trigger validation error
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    
    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderLogin();
    
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    fireEvent.submit(form!);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('has links to signup and forgot password', () => {
    renderLogin();
    
    const signupLink = screen.getByRole('link', { name: /sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');
    
    const forgotPasswordLink = screen.getByRole('link', { name: /forgot your password/i });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });
});