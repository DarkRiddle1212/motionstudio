import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AdminProtectedRoute from '../AdminProtectedRoute';

// Simple mock for useAuth
const mockUseAuth = vi.fn();

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AdminProtectedRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockClear();
  });

  it('should render children when user is admin', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'admin@test.com',
        role: 'admin',
        emailVerified: true,
      },
      loading: false,
      isAuthenticated: true,
    });

    renderWithRouter(
      <AdminProtectedRoute>
        <div>Admin Content</div>
      </AdminProtectedRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should show access denied when user is not admin', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'student@test.com',
        role: 'student',
        emailVerified: true,
      },
      loading: false,
      isAuthenticated: true,
    });

    renderWithRouter(
      <AdminProtectedRoute>
        <div>Admin Content</div>
      </AdminProtectedRoute>
    );

    expect(screen.getByText('Admin Access Required')).toBeInTheDocument();
    expect(screen.getByText(/You don't have administrator privileges/)).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should show loading when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
    });

    renderWithRouter(
      <AdminProtectedRoute>
        <div>Admin Content</div>
      </AdminProtectedRoute>
    );

    expect(screen.getByText('Verifying admin access...')).toBeInTheDocument();
  });
});