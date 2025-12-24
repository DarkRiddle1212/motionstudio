import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../Common';
import { motion, AnimatePresence } from 'framer-motion';

interface InstructorLayoutProps {
  children: React.ReactNode;
}

const InstructorLayout: React.FC<InstructorLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sidebarLinks = [
    { to: '/instructor/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/instructor/courses', label: 'My Courses', icon: '📚' },
    { to: '/instructor/courses/new', label: 'Create Course', icon: '➕' },
    { to: '/instructor/assignments', label: 'Assignments', icon: '📝' },
    { to: '/instructor/submissions', label: 'Submissions', icon: '📋' },
    { to: '/instructor/students', label: 'Students', icon: '👥' },
  ];

  const isActiveLink = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-brand-primary-bg flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : '-100%',
        }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-brand-secondary-bg border-r border-brand-accent border-opacity-20 lg:relative lg:translate-x-0 lg:z-auto"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-brand-accent border-opacity-20">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center">
                <span className="text-white font-serif font-bold text-sm">M</span>
              </div>
              <span className="font-serif font-bold text-lg text-brand-primary-text">
                Motion Studio
              </span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-brand-primary-text hover:text-brand-accent"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-brand-accent border-opacity-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-primary-text truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email
                  }
                </p>
                <p className="text-xs text-brand-secondary-text capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActiveLink(link.to)
                    ? 'bg-brand-accent text-white'
                    : 'text-brand-primary-text hover:bg-brand-primary-bg hover:text-brand-accent'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-brand-accent border-opacity-20 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-brand-primary-text hover:bg-brand-primary-bg hover:text-brand-accent transition-colors"
            >
              <span className="text-lg">👤</span>
              <span>Student View</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-brand-primary-text hover:bg-brand-primary-bg hover:text-brand-accent transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-brand-secondary-bg border-b border-brand-accent border-opacity-20 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-brand-primary-text hover:text-brand-accent hover:bg-brand-primary-bg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-serif font-semibold text-brand-primary-text">
              Instructor Portal
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;