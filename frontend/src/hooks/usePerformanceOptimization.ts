import { useEffect, useCallback, useMemo, useRef } from 'react';
import { performanceMonitor, usePerformanceMonitor } from '../utils/performanceMonitor';
import { useAdminCache } from '../utils/adminCache';

// Hook for component performance optimization
export const usePerformanceOptimization = (componentName: string) => {
  const { recordRender, recordCustomMetric } = usePerformanceMonitor(componentName);
  const cache = useAdminCache();
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(performance.now());

  useEffect(() => {
    // Record mount time
    const mountTime = performance.now() - mountTimeRef.current;
    recordRender(true);
    recordCustomMetric('mount-time', mountTime);

    return () => {
      // Record unmount
      recordCustomMetric('unmount', performance.now() - mountTimeRef.current);
    };
  }, [recordRender, recordCustomMetric]);

  useEffect(() => {
    // Record render on every update
    renderCountRef.current++;
    if (renderCountRef.current > 1) {
      recordRender(false);
    }
  });

  // Memoized cache operations
  const memoizedCache = useMemo(() => ({
    get: cache.get,
    set: cache.set,
    has: cache.has,
    invalidate: cache.invalidate,
  }), [cache]);

  // Performance-aware data fetching
  const performantFetch = useCallback(async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const startTime = performance.now();
    
    // Check cache first
    const cached = memoizedCache.get<T>(key);
    if (cached) {
      recordCustomMetric('cache-hit', performance.now() - startTime);
      return cached;
    }

    // Fetch data
    try {
      const data = await fetchFn();
      const fetchTime = performance.now() - startTime;
      
      // Cache the result
      memoizedCache.set(key, data, ttl);
      
      recordCustomMetric('fetch-time', fetchTime);
      recordCustomMetric('cache-miss', fetchTime);
      
      return data;
    } catch (error) {
      recordCustomMetric('fetch-error', performance.now() - startTime);
      throw error;
    }
  }, [memoizedCache, recordCustomMetric]);

  // Debounced function creator for performance
  const createDebouncedCallback = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const startTime = performance.now();
        callback(...args);
        recordCustomMetric('debounced-action', performance.now() - startTime);
      }, delay);
    }) as T;
  }, [recordCustomMetric]);

  // Throttled function creator for performance
  const createThrottledCallback = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T => {
    let lastCall = 0;
    
    return ((...args: Parameters<T>) => {
      const now = performance.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        const startTime = performance.now();
        callback(...args);
        recordCustomMetric('throttled-action', performance.now() - startTime);
      }
    }) as T;
  }, [recordCustomMetric]);

  // Intersection Observer for lazy loading
  const createIntersectionObserver = useCallback((
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ) => {
    if (typeof IntersectionObserver === 'undefined') {
      return null;
    }

    return new IntersectionObserver((entries) => {
      const startTime = performance.now();
      callback(entries);
      recordCustomMetric('intersection-callback', performance.now() - startTime);
    }, options);
  }, [recordCustomMetric]);

  return {
    // Performance monitoring
    recordCustomMetric,
    
    // Caching
    cache: memoizedCache,
    performantFetch,
    
    // Function optimization
    createDebouncedCallback,
    createThrottledCallback,
    
    // Lazy loading
    createIntersectionObserver,
    
    // Component stats
    renderCount: renderCountRef.current,
  };
};

// Hook for virtual scrolling optimization
export const useVirtualScrolling = <T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) => {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const { recordCustomMetric } = usePerformanceMonitor('virtual-scrolling');

  const getVisibleRange = useCallback((scrollTop: number) => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [items.length, itemHeight, containerHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const startTime = performance.now();
    const scrollTop = e.currentTarget.scrollTop;
    
    // Record scroll performance
    recordCustomMetric('scroll-event', performance.now() - startTime);
  }, [recordCustomMetric]);

  const visibleItems = useMemo(() => {
    if (!scrollElementRef.current) return [];
    
    const scrollTop = scrollElementRef.current.scrollTop;
    const { startIndex, endIndex } = getVisibleRange(scrollTop);
    
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, getVisibleRange]);

  return {
    scrollElementRef,
    visibleItems,
    handleScroll,
    totalHeight: items.length * itemHeight,
  };
};

// Hook for image lazy loading
export const useLazyImage = (src: string, placeholder?: string) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const { createIntersectionObserver, recordCustomMetric } = usePerformanceOptimization('lazy-image');

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const startTime = performance.now();
            
            const imageLoader = new Image();
            imageLoader.onload = () => {
              img.src = src;
              recordCustomMetric('image-load', performance.now() - startTime);
              observer?.unobserve(img);
            };
            imageLoader.onerror = () => {
              recordCustomMetric('image-error', performance.now() - startTime);
              observer?.unobserve(img);
            };
            imageLoader.src = src;
          }
        });
      },
      { threshold: 0.1 }
    );

    if (observer) {
      observer.observe(img);
    }

    return () => {
      if (observer && img) {
        observer.unobserve(img);
      }
    };
  }, [src, createIntersectionObserver, recordCustomMetric]);

  return imgRef;
};

// Hook for bundle size monitoring
export const useBundleMonitoring = () => {
  const { recordCustomMetric } = usePerformanceMonitor('bundle-monitoring');

  useEffect(() => {
    // Monitor bundle loading
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource' && entry.name.includes('.js')) {
          recordCustomMetric('bundle-load', entry.duration);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, [recordCustomMetric]);

  const preloadBundle = useCallback((bundleName: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = bundleName;
    document.head.appendChild(link);
    
    recordCustomMetric('bundle-preload', 1);
  }, [recordCustomMetric]);

  return { preloadBundle };
};

export default usePerformanceOptimization;