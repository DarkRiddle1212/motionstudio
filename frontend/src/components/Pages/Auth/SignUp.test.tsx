import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SignUp from './SignUp';
import { AuthProvider } from '../../../hooks/useAuth';

// Mock the useAuth hook
const mockSignup = vi.fn();
const mockUseAuth = {
  signup: mockSignup,
  user: null,
  token: null,
  loading: false,
  login: vi.fn(),
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
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderSignUp = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('SignUp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders signup form correctly', () => {
    renderSignUp();
    
    expect(screen.getByText('Join Motion Design Studio')).toBeInTheDocument();
    expect(screen.getByText('Create your account to start learning motion design')).toBeInTheDocument();
    
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderSignUp();
    
    const form = screen.getByRole('button', { name: /create account/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
    
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    renderSignUp();
    
    const emailInput = screen.getByLabelText('Email Address');
    const form = screen.getByRole('button', { name: /create account/i }).closest('form');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'ValidPass123' } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
    
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('validates password strength', async () => {
    renderSignUp();
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const form = screen.getByRole('button', { name: /create account/i }).closest('form');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Test short password
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
    
    // Test password without uppercase, lowercase, and numbers
    fireEvent.change(passwordInput, { target: { value: 'lowercase' } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one uppercase letter, one lowercase letter, and one number')).toBeInTheDocument();
    });
    
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    mockSignup.mockResolvedValueOnce({ message: 'Success' });
    renderSignUp();
    
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'ValidPass123' } });
    
    const form = screen.getByRole('button', { name: /create account/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('john@example.com', 'ValidPass123', 'John', 'Doe');
    });
  });

  it('shows success message after successful signup', async () => {
    mockSignup.mockResolvedValueOnce({ message: 'Success' });
    renderSignUp();
    
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'ValidPass123' } });
    
    const form = screen.getByRole('button', { name: /create account/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      expect(screen.getByText(/We've sent a verification link to/)).toBeInTheDocument();
    });
  });

  it('handles signup errors', async () => {
    mockSignup.mockRejectedValueOnce(new Error('Email already registered'));
    renderSignUp();
    
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'ValidPass123' } });
    
    const form = screen.getByRole('button', { name: /create account/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('clears field errors when user starts typing', async () => {
    renderSignUp();
    
    const emailInput = screen.getByLabelText('Email Address');
    const form = screen.getByRole('button', { name: /create account/i }).closest('form');
    
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
    mockSignup.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderSignUp();
    
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'ValidPass123' } });
    
    const form = screen.getByRole('button', { name: /create account/i }).closest('form');
    fireEvent.submit(form!);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('has link to login page', () => {
    renderSignUp();
    
    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});