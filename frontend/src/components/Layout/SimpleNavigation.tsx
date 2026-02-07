import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Simplified Navigation without complex animations
 * For debugging the infinite loading issue
 */
const SimpleNavigation = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log('✅ SimpleNavigation rendering...', { isAuthenticated, user });

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/courses', label: 'Courses' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm py-4 border-b border-gray-700"
      data-testid="simple-navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3"
            data-testid="logo-link"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-serif font-bold text-lg lg:text-xl">M</span>
            </div>
            <span className="font-serif font-bold text-xl lg:text-2xl text-white">
              Motion Studio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 font-medium text-sm transition-colors duration-300 rounded-lg ${
                  isActiveLink(link.to)
                    ? 'text-indigo-400 bg-indigo-400/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
                  data-testid="dashboard-link"
                >
                  Dashboard
                </Link>
                <span className="text-gray-400 text-sm">
                  {user?.firstName || user?.email}
                </span>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
                  data-testid="login-link"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transition-all duration-300"
                  data-testid="signup-button"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavigation;
