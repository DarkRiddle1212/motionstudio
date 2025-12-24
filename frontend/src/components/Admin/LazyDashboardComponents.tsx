import { lazy, Suspense, ComponentType } from 'react';
import { LoadingState } from '../Common';

// Lazy load admin components for better performance
export const LazyUserManagement = lazy(() => import('./UserManagement'));
export const LazyCourseManagement = lazy(() => import('./CourseManagement'));
export const LazyFinancialDashboard = lazy(() => import('./FinancialDashboard'));
export const LazyAnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
export const LazyScholarshipManagement = lazy(() => import('./ScholarshipManagement'));
export const LazyProjectManagement = lazy(() => import('./ProjectManagement'));
export const LazySystemSettings = lazy(() => import('./SystemSettings'));
export const LazySecurityMonitoring = lazy(() => import('./SecurityMonitoring'));

// Higher-order component for lazy loading with error boundary
interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

const LazyComponentWrapper = ({ 
  children, 
  fallback = <LoadingState message="Loading component..." size="md" className="py-8" />,
  errorFallback = (
    <div className="p-8 text-center">
      <div className="text-red-500 mb-2">
        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-gray-600">Failed to load component</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}: LazyComponentWrapperProps) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Wrapper function to create lazy components with consistent loading states
export function withLazyLoading<T extends ComponentType<any>>(
  LazyComponent: T,
  loadingMessage?: string
) {
  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <LazyComponentWrapper 
        fallback={<LoadingState message={loadingMessage || "Loading..."} size="md" className="py-8" />}
      >
        <LazyComponent {...props} />
      </LazyComponentWrapper>
    );
  };
}

// Pre-configured lazy components with appropriate loading messages
export const LazyUserManagementWithLoading = withLazyLoading(LazyUserManagement, "Loading user management...");
export const LazyCourseManagementWithLoading = withLazyLoading(LazyCourseManagement, "Loading course management...");
export const LazyFinancialDashboardWithLoading = withLazyLoading(LazyFinancialDashboard, "Loading financial dashboard...");
export const LazyAnalyticsDashboardWithLoading = withLazyLoading(LazyAnalyticsDashboard, "Loading analytics...");
export const LazyScholarshipManagementWithLoading = withLazyLoading(LazyScholarshipManagement, "Loading scholarship management...");
export const LazyProjectManagementWithLoading = withLazyLoading(LazyProjectManagement, "Loading project management...");
export const LazySystemSettingsWithLoading = withLazyLoading(LazySystemSettings, "Loading system settings...");
export const LazySecurityMonitoringWithLoading = withLazyLoading(LazySecurityMonitoring, "Loading security monitoring...");

// Preload function for critical components
export const preloadCriticalComponents = () => {
  // Preload the most commonly used components
  // Note: React.lazy components don't have a preload method by default
  // This is a placeholder for future implementation with webpack magic comments
  console.log('Preloading critical admin components...');
};

// Component preloader hook
export const useComponentPreloader = () => {
  const preloadComponent = (componentName: string) => {
    // Note: React.lazy components don't have a preload method by default
    // This would need to be implemented with webpack magic comments or dynamic imports
    console.log(`Preloading component: ${componentName}`);
  };

  return { preloadComponent };
};

export default LazyComponentWrapper;