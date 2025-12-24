import { ReactNode, useState } from 'react';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FadeIn } from '../Animation';
import { ErrorBoundary, OfflineIndicator } from '../Common';
import { HelpProvider, HelpButton, TooltipRenderer, OnboardingFlow, HelpTooltip } from './HelpSystem';
import HelpMenu from './HelpSystem/HelpMenu';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  children?: NavigationItem[];
}

// Navigation Icons
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const CoursesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const FinanceIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AnalyticsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProjectsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SecurityIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const AdminLayout = ({ children, title, breadcrumbs = [] }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: DashboardIcon,
      href: '/admin',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: UsersIcon,
      href: '/admin/users',
    },
    {
      id: 'courses',
      label: 'Course Management',
      icon: CoursesIcon,
      href: '/admin/courses',
    },
    {
      id: 'finance',
      label: 'Financial Dashboard',
      icon: FinanceIcon,
      href: '/admin/finance',
    },
    {
      id: 'scholarships',
      label: 'Scholarships',
      icon: UsersIcon,
      href: '/admin/scholarships',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: AnalyticsIcon,
      href: '/admin/analytics',
    },
    {
      id: 'projects',
      label: 'Project Portfolio',
      icon: ProjectsIcon,
      href: '/admin/projects',
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: SettingsIcon,
      href: '/admin/settings',
    },
    {
      id: 'security',
      label: 'Security & Audit',
      icon: SecurityIcon,
      href: '/admin/security',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-brand-primary-bg">
      <OfflineIndicator />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-brand-primary-bg bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-secondary-bg shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-brand-accent border-opacity-20">
          <div className="flex items-center min-w-0">
            <div className="w-8 h-8 bg-gradient-to-r from-brand-accent to-brand-accent-light rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-brand-primary-text truncate">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-brand-secondary-text hover:text-brand-primary-text hover:bg-brand-tertiary-bg flex-shrink-0"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-6 px-3 pb-20 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActiveRoute(item.href)
                    ? 'bg-brand-accent bg-opacity-20 text-brand-accent border-r-2 border-brand-accent'
                    : 'text-brand-secondary-text hover:bg-brand-tertiary-bg hover:text-brand-primary-text'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActiveRoute(item.href) ? 'text-brand-accent' : 'text-brand-muted-text group-hover:text-brand-secondary-text'
                }`} />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-brand-error bg-opacity-20 text-brand-error text-xs px-2 py-1 rounded-full flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-brand-accent border-opacity-20 bg-brand-secondary-bg">
          <div className="flex items-center min-w-0">
            <div className="w-8 h-8 bg-brand-accent bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-brand-accent text-sm font-medium">
                {user?.firstName?.[0] || user?.email?.[0] || 'A'}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-primary-text truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
              </p>
              <p className="text-xs text-brand-secondary-text capitalize truncate">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-1 text-brand-secondary-text hover:text-brand-primary-text hover:bg-brand-tertiary-bg rounded-md flex-shrink-0"
              title="Logout"
              aria-label="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-10 bg-brand-secondary-bg shadow-sm border-b border-brand-accent border-opacity-20">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-brand-secondary-text hover:text-brand-primary-text hover:bg-brand-tertiary-bg mr-2 flex-shrink-0"
                aria-label="Open sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-brand-primary-text truncate">{title}</h1>
                {breadcrumbs.length > 0 && (
                  <nav className="flex mt-1 overflow-x-auto" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm text-brand-secondary-text whitespace-nowrap">
                      {breadcrumbs.map((crumb, index) => (
                        <li key={index} className="flex items-center flex-shrink-0">
                          {index > 0 && (
                            <svg className="w-4 h-4 mx-2 text-brand-muted-text flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {crumb.href ? (
                            <Link to={crumb.href} className="hover:text-brand-primary-text truncate">
                              {crumb.label}
                            </Link>
                          ) : (
                            <span className="text-brand-primary-text truncate">{crumb.label}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Notifications */}
              <button className="p-2 text-brand-secondary-text hover:text-brand-primary-text hover:bg-brand-tertiary-bg rounded-md" aria-label="Notifications">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.12 3.12M7.05 5.84l3.12 3.12M4.03 8.86l3.12 3.12M1.01 11.88l3.12 3.12" />
                </svg>
              </button>
              
              {/* Mobile user menu - only show on small screens */}
              <div className="lg:hidden">
                <button className="p-2 text-brand-secondary-text hover:text-brand-primary-text hover:bg-brand-tertiary-bg rounded-md" aria-label="User menu">
                  <div className="w-6 h-6 bg-brand-accent bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-brand-accent text-xs font-medium">
                      {user?.firstName?.[0] || user?.email?.[0] || 'A'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <ErrorBoundary
            showDetails={process.env.NODE_ENV === 'development'}
            onError={(error, errorInfo) => {
              console.error('Admin panel error:', error, errorInfo);
              // Here you could send error reports to your error tracking service
            }}
          >
            <FadeIn>
              {children}
            </FadeIn>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;