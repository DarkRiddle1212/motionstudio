// Performance monitoring system for admin panel

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ComponentMetric {
  componentName: string;
  renderTime: number;
  mountTime?: number;
  updateCount: number;
  lastUpdate: number;
}

interface NetworkMetric {
  url: string;
  method: string;
  duration: number;
  status: number;
  size?: number;
  timestamp: number;
}

interface MemoryMetric {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics = new Map<string, ComponentMetric>();
  private networkMetrics: NetworkMetric[] = [];
  private memoryMetrics: MemoryMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled = true;
  private maxMetrics = 1000; // Limit stored metrics

  constructor() {
    this.initializeObservers();
    this.startMemoryMonitoring();
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Record a custom performance metric
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.trimMetrics();
  }

  // Record component performance
  recordComponentMetric(componentName: string, renderTime: number, isMount = false): void {
    if (!this.isEnabled) return;

    const existing = this.componentMetrics.get(componentName);
    const now = Date.now();

    if (existing) {
      existing.renderTime = renderTime;
      existing.updateCount++;
      existing.lastUpdate = now;
      if (isMount) {
        existing.mountTime = renderTime;
      }
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        mountTime: isMount ? renderTime : undefined,
        updateCount: 1,
        lastUpdate: now,
      });
    }
  }

  // Record network request performance
  recordNetworkMetric(url: string, method: string, duration: number, status: number, size?: number): void {
    if (!this.isEnabled) return;

    const metric: NetworkMetric = {
      url,
      method,
      duration,
      status,
      size,
      timestamp: Date.now(),
    };

    this.networkMetrics.push(metric);
    
    // Keep only recent network metrics
    if (this.networkMetrics.length > this.maxMetrics) {
      this.networkMetrics = this.networkMetrics.slice(-this.maxMetrics);
    }
  }

  // Get performance summary
  getSummary() {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;

    // Recent metrics
    const recentMetrics = this.metrics.filter(m => m.timestamp > last5Minutes);
    const recentNetworkMetrics = this.networkMetrics.filter(m => m.timestamp > last5Minutes);

    // Component performance
    const componentPerformance = Array.from(this.componentMetrics.values())
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 10); // Top 10 slowest components

    // Network performance
    const avgNetworkTime = recentNetworkMetrics.length > 0
      ? recentNetworkMetrics.reduce((sum, m) => sum + m.duration, 0) / recentNetworkMetrics.length
      : 0;

    const slowNetworkRequests = recentNetworkMetrics
      .filter(m => m.duration > 1000) // Slower than 1 second
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    // Memory usage
    const latestMemory = this.memoryMetrics[this.memoryMetrics.length - 1];

    // Core Web Vitals
    const coreWebVitals = this.getCoreWebVitals();

    return {
      timestamp: now,
      metrics: {
        total: this.metrics.length,
        recent: recentMetrics.length,
      },
      components: {
        tracked: this.componentMetrics.size,
        slowest: componentPerformance,
      },
      network: {
        totalRequests: this.networkMetrics.length,
        recentRequests: recentNetworkMetrics.length,
        averageTime: Math.round(avgNetworkTime),
        slowRequests: slowNetworkRequests,
      },
      memory: latestMemory,
      coreWebVitals,
    };
  }

  // Get Core Web Vitals
  private getCoreWebVitals() {
    const vitals: Record<string, number> = {};

    // Get LCP (Largest Contentful Paint)
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      vitals.lcp = lcpEntries[lcpEntries.length - 1].startTime;
    }

    // Get FID (First Input Delay) - approximated
    const fidEntries = performance.getEntriesByType('first-input');
    if (fidEntries.length > 0) {
      const fidEntry = fidEntries[0] as any;
      vitals.fid = fidEntry.processingStart - fidEntry.startTime;
    }

    // Get CLS (Cumulative Layout Shift) - approximated
    const clsEntries = performance.getEntriesByType('layout-shift');
    if (clsEntries.length > 0) {
      vitals.cls = clsEntries.reduce((sum: number, entry: any) => {
        if (!entry.hadRecentInput) {
          return sum + entry.value;
        }
        return sum;
      }, 0);
    }

    return vitals;
  }

  // Initialize performance observers
  private initializeObservers(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('page-load-time', navEntry.loadEventEnd - navEntry.fetchStart);
            this.recordMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
            this.recordMetric('first-paint', navEntry.responseEnd - navEntry.fetchStart);
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordNetworkMetric(
              resourceEntry.name,
              'GET', // Approximation
              resourceEntry.responseEnd - resourceEntry.fetchStart,
              200, // Approximation
              resourceEntry.transferSize
            );
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            this.recordMetric('long-task', entry.duration, {
              startTime: entry.startTime,
            });
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);

    } catch (error) {
      console.warn('Failed to initialize performance observers:', error);
    }
  }

  // Start memory monitoring
  private startMemoryMonitoring(): void {
    const recordMemory = () => {
      if (!this.isEnabled) return;

      const memory = (performance as any).memory;
      if (memory) {
        const metric: MemoryMetric = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now(),
        };

        this.memoryMetrics.push(metric);
        
        // Keep only recent memory metrics
        if (this.memoryMetrics.length > 100) {
          this.memoryMetrics = this.memoryMetrics.slice(-100);
        }
      }
    };

    // Record memory usage every 30 seconds
    setInterval(recordMemory, 30000);
    recordMemory(); // Initial recording
  }

  // Trim metrics to prevent memory leaks
  private trimMetrics(): void {
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      metrics: this.metrics,
      componentMetrics: Array.from(this.componentMetrics.values()),
      networkMetrics: this.networkMetrics,
      memoryMetrics: this.memoryMetrics,
      summary: this.getSummary(),
    };
  }

  // Clear all metrics
  clear(): void {
    this.metrics = [];
    this.componentMetrics.clear();
    this.networkMetrics = [];
    this.memoryMetrics = [];
  }

  // Cleanup observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  const recordRender = (isMount = false) => {
    const renderTime = performance.now() - startTime;
    performanceMonitor.recordComponentMetric(componentName, renderTime, isMount);
  };

  const recordCustomMetric = (name: string, value: number, metadata?: Record<string, any>) => {
    performanceMonitor.recordMetric(`${componentName}:${name}`, value, metadata);
  };

  return {
    recordRender,
    recordCustomMetric,
  };
};

// Network request interceptor for automatic performance tracking
export const createPerformanceInterceptor = () => {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const startTime = performance.now();
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    try {
      const response = await originalFetch(input, init);
      const duration = performance.now() - startTime;
      
      performanceMonitor.recordNetworkMetric(
        url,
        method,
        duration,
        response.status,
        parseInt(response.headers.get('content-length') || '0')
      );

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.recordNetworkMetric(url, method, duration, 0);
      throw error;
    }
  };

  return () => {
    window.fetch = originalFetch;
  };
};

// Performance budget checker
export const checkPerformanceBudget = () => {
  const summary = performanceMonitor.getSummary();
  const issues: string[] = [];

  // Check component render times
  summary.components.slowest.forEach(component => {
    if (component.renderTime > 16) { // 60fps budget
      issues.push(`Component ${component.componentName} renders slowly: ${component.renderTime.toFixed(2)}ms`);
    }
  });

  // Check network performance
  if (summary.network.averageTime > 2000) {
    issues.push(`Average network request time is high: ${summary.network.averageTime}ms`);
  }

  // Check memory usage
  if (summary.memory) {
    const memoryUsagePercent = (summary.memory.usedJSHeapSize / summary.memory.jsHeapSizeLimit) * 100;
    if (memoryUsagePercent > 80) {
      issues.push(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`);
    }
  }

  // Check Core Web Vitals
  if (summary.coreWebVitals.lcp && summary.coreWebVitals.lcp > 2500) {
    issues.push(`LCP is poor: ${summary.coreWebVitals.lcp.toFixed(0)}ms`);
  }

  if (summary.coreWebVitals.fid && summary.coreWebVitals.fid > 100) {
    issues.push(`FID is poor: ${summary.coreWebVitals.fid.toFixed(0)}ms`);
  }

  if (summary.coreWebVitals.cls && summary.coreWebVitals.cls > 0.1) {
    issues.push(`CLS is poor: ${summary.coreWebVitals.cls.toFixed(3)}`);
  }

  return {
    passed: issues.length === 0,
    issues,
    summary,
  };
};

export default performanceMonitor;