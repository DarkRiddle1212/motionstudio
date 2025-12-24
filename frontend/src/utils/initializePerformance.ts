// Initialize performance monitoring for the admin panel

import { performanceMonitor, createPerformanceInterceptor } from './performanceMonitor';
import { preloadCriticalComponents } from '../components/Admin/LazyDashboardComponents';

// Performance configuration
const PERFORMANCE_CONFIG = {
  enableMonitoring: process.env.NODE_ENV === 'development' || process.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  enableNetworkInterception: true,
  enableComponentPreloading: true,
  enableCacheWarming: true,
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  if (!PERFORMANCE_CONFIG.enableMonitoring) {
    console.log('Performance monitoring disabled');
    return;
  }

  console.log('Initializing performance monitoring...');

  // Enable performance monitoring
  performanceMonitor.setEnabled(true);

  // Set up network request interception
  if (PERFORMANCE_CONFIG.enableNetworkInterception) {
    const restoreOriginalFetch = createPerformanceInterceptor();
    
    // Store cleanup function for later use
    (window as any).__performanceCleanup = restoreOriginalFetch;
  }

  // Preload critical components
  if (PERFORMANCE_CONFIG.enableComponentPreloading) {
    // Delay preloading to avoid blocking initial render
    setTimeout(() => {
      preloadCriticalComponents();
    }, 2000);
  }

  // Warm up cache with common data
  if (PERFORMANCE_CONFIG.enableCacheWarming) {
    warmUpCache();
  }

  // Set up performance budget monitoring
  setUpPerformanceBudgetMonitoring();

  console.log('Performance monitoring initialized');
};

// Warm up cache with commonly accessed data
const warmUpCache = () => {
  // This would typically fetch and cache common admin data
  // For now, we'll just log that cache warming is enabled
  console.log('Cache warming enabled - will cache frequently accessed data');
};

// Set up performance budget monitoring
const setUpPerformanceBudgetMonitoring = () => {
  // Monitor performance budget every 30 seconds
  setInterval(() => {
    const budget = checkPerformanceBudget();
    if (!budget.passed && budget.issues.length > 0) {
      console.warn('Performance budget exceeded:', budget.issues);
      
      // In production, you might want to send this to an analytics service
      if (process.env.NODE_ENV === 'production') {
        // Example: sendToAnalytics('performance-budget-exceeded', budget);
      }
    }
  }, 30000);
};

// Check performance budget
const checkPerformanceBudget = () => {
  const summary = performanceMonitor.getSummary();
  const issues: string[] = [];

  // Check component render times
  if (summary.components && summary.components.slowest) {
    summary.components.slowest.forEach((component: any) => {
      if (component.renderTime > 16) { // 60fps budget
        issues.push(`Component ${component.componentName} renders slowly: ${component.renderTime.toFixed(2)}ms`);
      }
    });
  }

  // Check network performance
  if (summary.network && summary.network.averageTime > 2000) {
    issues.push(`Average network request time is high: ${summary.network.averageTime}ms`);
  }

  // Check memory usage
  if (summary.memory) {
    const memoryUsagePercent = (summary.memory.usedJSHeapSize / summary.memory.jsHeapSizeLimit) * 100;
    if (memoryUsagePercent > 80) {
      issues.push(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`);
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    summary,
  };
};

// Cleanup performance monitoring
export const cleanupPerformanceMonitoring = () => {
  if ((window as any).__performanceCleanup) {
    (window as any).__performanceCleanup();
    delete (window as any).__performanceCleanup;
  }
  
  performanceMonitor.disconnect();
  console.log('Performance monitoring cleaned up');
};

// Performance optimization recommendations
export const getPerformanceRecommendations = () => {
  const summary = performanceMonitor.getSummary();
  const recommendations: string[] = [];

  // Component performance recommendations
  if (summary.components && summary.components.slowest) {
    const slowComponents = summary.components.slowest.filter((c: any) => c.renderTime > 16);
    if (slowComponents.length > 0) {
      recommendations.push('Consider optimizing slow-rendering components with React.memo or useMemo');
    }
  }

  // Network performance recommendations
  if (summary.network && summary.network.averageTime > 1000) {
    recommendations.push('Consider implementing request caching or reducing payload sizes');
  }

  // Memory recommendations
  if (summary.memory) {
    const memoryUsagePercent = (summary.memory.usedJSHeapSize / summary.memory.jsHeapSizeLimit) * 100;
    if (memoryUsagePercent > 60) {
      recommendations.push('Consider implementing memory cleanup or reducing component state');
    }
  }

  return recommendations;
};

export default initializePerformanceMonitoring;