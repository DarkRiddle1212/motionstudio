import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../Common';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect with progress indicator
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    setIsScrolled(scrollTop > 20);
    setScrollProgress(Math.min(progress, 100));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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

  // Animation variants for mobile drawer
  const drawerVariants = {
    closed: {
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
  };

  // Animation variants for mobile menu items
  const menuItemVariants = {
    closed: { opacity: 0, x: 20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 + i * 0.05,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  // Animation variants for backdrop
  const backdropVariants = {
    closed: { 
      opacity: 0,
      transition: { duration: 0.2 },
    },
    open: { 
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-accent via-brand-accent-light to-brand-accent z-[60] origin-left"
        style={{ scaleX: scrollProgress / 100 }}
        initial={{ scaleX: 0 }}
        data-testid="scroll-progress"
      />
      
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-smooth ${
          isScrolled 
            ? 'glass shadow-lg py-2' 
            : 'bg-gray-900/90 backdrop-blur-sm py-4 border-b border-gray-700'
        }`}
        data-testid="navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group relative z-10"
              data-testid="logo-link"
            >
              <motion.div 
                className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-button group-hover:shadow-glow transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-brand-primary-bg font-serif font-bold text-lg lg:text-xl">M</span>
              </motion.div>
              <span className="font-serif font-bold text-xl lg:text-2xl text-white group-hover:text-indigo-400 transition-colors duration-300">
                Motion Studio
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="desktop-nav-links hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-4 py-2 font-medium text-body-sm transition-all duration-300 group"
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                >
                  <span className={`relative z-10 transition-colors duration-300 ${
                    isActiveLink(link.to)
                      ? 'text-indigo-400'
                      : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {link.label}
                  </span>
                  {/* Active indicator with smooth transition */}
                  <motion.span
                    className="absolute bottom-0 left-1/2 h-[2px] bg-brand-accent rounded-full"
                    initial={false}
                    animate={{
                      width: isActiveLink(link.to) ? '60%' : '0%',
                      x: '-50%',
                      opacity: isActiveLink(link.to) ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  />
                  {/* Hover background */}
                  <span className="absolute inset-0 bg-brand-accent/0 group-hover:bg-brand-accent/5 rounded-lg transition-colors duration-300" />
                </Link>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="desktop-auth-buttons hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-gray-300 hover:text-white transition-colors duration-300 text-body-sm font-medium"
                    data-testid="dashboard-link"
                  >
                    Dashboard
                  </Link>
                  <span className="text-gray-400 text-body-sm">
                    {user?.firstName || user?.email}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300 text-body-sm font-medium"
                    data-testid="login-link"
                  >
                    Login
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-gradient-accent text-brand-primary-bg hover:shadow-glow transition-all duration-300"
                      data-testid="signup-button"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg text-white hover:text-indigo-400 hover:bg-indigo-400/10 transition-all duration-300 relative z-[60]"
              data-testid="mobile-menu-button"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <motion.span
                  className="w-5 h-0.5 bg-current rounded-full"
                  animate={{
                    rotate: isMobileMenuOpen ? 45 : 0,
                    y: isMobileMenuOpen ? 2 : -3,
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-current rounded-full"
                  animate={{
                    opacity: isMobileMenuOpen ? 0 : 1,
                    scaleX: isMobileMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-current rounded-full"
                  animate={{
                    rotate: isMobileMenuOpen ? -45 : 0,
                    y: isMobileMenuOpen ? -2 : 3,
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden"
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="mobile-menu-backdrop"
            />
            
            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-brand-primary-bg border-l border-white/5 z-[56] md:hidden overflow-y-auto"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              data-testid="mobile-menu"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <span className="font-serif font-bold text-xl text-brand-primary-text">
                  Menu
                </span>
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-brand-secondary-text hover:text-brand-primary-text hover:bg-brand-accent/10 transition-all duration-300"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-2">
                {/* Mobile Navigation Links */}
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    custom={index}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between py-3 px-4 rounded-xl font-medium transition-all duration-300 group ${
                        isActiveLink(link.to)
                          ? 'bg-brand-accent/10 text-brand-accent'
                          : 'text-brand-secondary-text hover:bg-white/5 hover:text-brand-primary-text'
                      }`}
                      data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
                    >
                      <span>{link.label}</span>
                      {isActiveLink(link.to) && (
                        <motion.span
                          className="w-2 h-2 rounded-full bg-brand-accent"
                          layoutId="activeIndicator"
                        />
                      )}
                      {!isActiveLink(link.to) && (
                        <svg 
                          className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  </motion.div>
                ))}

                {/* Divider */}
                <div className="my-6 border-t border-white/5" />

                {/* Mobile Auth Section */}
                <motion.div
                  custom={navLinks.length}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                >
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-3 px-4 rounded-xl text-brand-secondary-text hover:bg-white/5 hover:text-brand-primary-text transition-all duration-300"
                        data-testid="mobile-dashboard-link"
                      >
                        <span className="font-medium">Dashboard</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <div className="py-3 px-4 text-sm text-brand-muted-text">
                        Signed in as <span className="text-brand-secondary-text">{user?.firstName || user?.email}</span>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-3 px-4 rounded-xl text-left text-brand-secondary-text hover:bg-white/5 hover:text-brand-primary-text transition-all duration-300 font-medium"
                        data-testid="mobile-logout-button"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-3 px-4 rounded-xl text-brand-secondary-text hover:bg-white/5 hover:text-brand-primary-text transition-all duration-300 font-medium"
                        data-testid="mobile-login-link"
                      >
                        <span>Login</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-3 px-4 rounded-xl bg-gradient-accent text-brand-primary-bg text-center font-medium hover:shadow-glow transition-all duration-300"
                        data-testid="mobile-signup-link"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Drawer Footer */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/5 bg-brand-primary-bg"
                custom={navLinks.length + 1}
                variants={menuItemVariants}
                initial="closed"
                animate="open"
              >
                <p className="text-xs text-brand-muted-text text-center">
                  © 2024 Motion Studio. All rights reserved.
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
