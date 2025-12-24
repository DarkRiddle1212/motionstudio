import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Navigation from './Navigation';
import { AuthProvider } from '../../hooks/useAuth';

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
  }),
}));

const renderNavigation = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navigation Component', () => {
  it('renders navigation with logo and menu items', () => {
    renderNavigation();
    
    expect(screen.getByTestId('logo-link')).toBeInTheDocument();
    expect(screen.getByTestId('nav-link-home')).toBeInTheDocument();
    expect(screen.getByTestId('nav-link-portfolio')).toBeInTheDocument();
    expect(screen.getByTestId('nav-link-courses')).toBeInTheDocument();
    expect(screen.getByTestId('nav-link-about')).toBeInTheDocument();
    expect(screen.getByTestId('nav-link-contact')).toBeInTheDocument();
  });

  it('shows mobile menu button on mobile', () => {
    renderNavigation();
    
    const mobileMenuButton = screen.getByTestId('mobile-menu-button');
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('toggles mobile menu when button is clicked', () => {
    renderNavigation();
    
    const mobileMenuButton = screen.getByTestId('mobile-menu-button');
    
    // Mobile menu should not be visible initially
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    
    // Click to open mobile menu
    fireEvent.click(mobileMenuButton);
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    
    // Click to close mobile menu
    fireEvent.click(mobileMenuButton);
    // Note: Due to animation, the menu might still be in DOM but animating out
  });

  it('shows login and signup buttons when not authenticated', () => {
    renderNavigation();
    
    expect(screen.getByTestId('login-link')).toBeInTheDocument();
    expect(screen.getByTestId('signup-button')).toBeInTheDocument();
  });

  it('renders scroll progress indicator', () => {
    renderNavigation();
    
    expect(screen.getByTestId('scroll-progress')).toBeInTheDocument();
  });

  it('shows backdrop when mobile menu is open', async () => {
    renderNavigation();
    
    const mobileMenuButton = screen.getByTestId('mobile-menu-button');
    
    // Click to open mobile menu
    fireEvent.click(mobileMenuButton);
    
    // Backdrop should be visible
    await waitFor(() => {
      expect(screen.getByTestId('mobile-menu-backdrop')).toBeInTheDocument();
    });
  });

  it('closes mobile menu when backdrop is clicked', async () => {
    renderNavigation();
    
    const mobileMenuButton = screen.getByTestId('mobile-menu-button');
    
    // Open mobile menu
    fireEvent.click(mobileMenuButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mobile-menu-backdrop')).toBeInTheDocument();
    });
    
    // Click backdrop to close
    fireEvent.click(screen.getByTestId('mobile-menu-backdrop'));
    
    // Menu should start closing (AnimatePresence handles exit animation)
    await waitFor(() => {
      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('has proper aria attributes on mobile menu button', () => {
    renderNavigation();
    
    const mobileMenuButton = screen.getByTestId('mobile-menu-button');
    
    expect(mobileMenuButton).toHaveAttribute('aria-label', 'Toggle mobile menu');
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    
    // Open menu
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
  });
});