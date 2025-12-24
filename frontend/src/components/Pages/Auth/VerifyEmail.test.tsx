import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import VerifyEmail from './VerifyEmail';
import { AuthProvider } from '../../../hooks/useAuth';

// Mock the useAuth hook
const mockVerifyEmail = vi.fn();
const mockUseAuth = {
  verifyEmail: mockVerifyEmail,
  user: null,
  token: null,
  loading: false,
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
};

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

const renderVerifyEmail = (token?: string) => {
  if (token) {
    mockSearchParams = new URLSearchParams({ token });
  } else {
    mockSearchParams = new URLSearchParams();
  }
  
  return render(
    <BrowserRouter>
      <AuthProvider>
        <VerifyEmail />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('VerifyEmail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it('shows loading state initially', () => {
    mockVerifyEmail.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderVerifyEmail('valid-token');
    
    expect(screen.getByText('Verifying Your Email')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we verify your email address...')).toBeInTheDocument();
  });

  it('shows error when no token is provided', async () => {
    renderVerifyEmail(); // No token
    
    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid verification link. Please check your email for the correct link.')).toBeInTheDocument();
    });
    
    expect(mockVerifyEmail).not.toHaveBeenCalled();
  });

  it('calls verifyEmail with token from URL', async () => {
    mockVerifyEmail.mockResolvedValueOnce({});
    renderVerifyEmail('test-token-123');
    
    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith('test-token-123');
    });
  });

  it('shows success state after successful verification', async () => {
    mockVerifyEmail.mockResolvedValueOnce({});
    renderVerifyEmail('valid-token');
    
    await waitFor(() => {
      expect(screen.getByText('Email Verified!')).toBeInTheDocument();
      expect(screen.getByText('Your email has been successfully verified! You can now sign in to your account.')).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /sign in now/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
  });

  it('shows error state when verification fails', async () => {
    mockVerifyEmail.mockRejectedValueOnce(new Error('Invalid or expired verification token'));
    renderVerifyEmail('invalid-token');
    
    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid or expired verification token')).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /sign up again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try to sign in/i })).toBeInTheDocument();
  });

  it('navigates to login page when Sign In Now button is clicked', async () => {
    mockVerifyEmail.mockResolvedValueOnce({});
    renderVerifyEmail('valid-token');
    
    await waitFor(() => {
      expect(screen.getByText('Email Verified!')).toBeInTheDocument();
    });
    
    const signInButton = screen.getByRole('button', { name: /sign in now/i });
    signInButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to home page when Go to Home button is clicked', async () => {
    mockVerifyEmail.mockResolvedValueOnce({});
    renderVerifyEmail('valid-token');
    
    await waitFor(() => {
      expect(screen.getByText('Email Verified!')).toBeInTheDocument();
    });
    
    const homeButton = screen.getByRole('button', { name: /go to home/i });
    homeButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to signup when Sign Up Again button is clicked', async () => {
    mockVerifyEmail.mockRejectedValueOnce(new Error('Token expired'));
    renderVerifyEmail('expired-token');
    
    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });
    
    const signUpButton = screen.getByRole('button', { name: /sign up again/i });
    signUpButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('navigates to login when Try to Sign In button is clicked', async () => {
    mockVerifyEmail.mockRejectedValueOnce(new Error('Token expired'));
    renderVerifyEmail('expired-token');
    
    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });
    
    const loginButton = screen.getByRole('button', { name: /try to sign in/i });
    loginButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles generic verification errors', async () => {
    mockVerifyEmail.mockRejectedValueOnce(new Error());
    renderVerifyEmail('some-token');
    
    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Verification failed. The link may be expired or invalid.')).toBeInTheDocument();
    });
  });
});