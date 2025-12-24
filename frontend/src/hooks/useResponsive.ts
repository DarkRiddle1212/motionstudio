import { useState, useEffect } from 'react';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type Breakpoint = keyof BreakpointConfig;

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  currentBreakpoint: Breakpoint | 'xs';
}

export const useResponsive = (breakpoints: Partial<BreakpointConfig> = {}): ResponsiveState => {
  const config = { ...defaultBreakpoints, ...breakpoints };
  
  const [state, setState] = useState<ResponsiveState>(() => {
    // Initialize with default values for SSR compatibility
    const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const initialHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    return {
      width: initialWidth,
      height: initialHeight,
      isMobile: initialWidth < config.md,
      isTablet: initialWidth >= config.md && initialWidth < config.lg,
      isDesktop: initialWidth >= config.lg,
      isLarge: initialWidth >= config.xl,
      currentBreakpoint: getCurrentBreakpoint(initialWidth, config),
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState({
        width,
        height,
        isMobile: width < config.md,
        isTablet: width >= config.md && width < config.lg,
        isDesktop: width >= config.lg,
        isLarge: width >= config.xl,
        currentBreakpoint: getCurrentBreakpoint(width, config),
      });
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [config.md, config.lg, config.xl]);

  return state;
};

function getCurrentBreakpoint(width: number, config: BreakpointConfig): Breakpoint | 'xs' {
  if (width >= config['2xl']) return '2xl';
  if (width >= config.xl) return 'xl';
  if (width >= config.lg) return 'lg';
  if (width >= config.md) return 'md';
  if (width >= config.sm) return 'sm';
  return 'xs';
}

// Hook for checking specific breakpoints
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const { currentBreakpoint } = useResponsive();
  const breakpointOrder: (Breakpoint | 'xs')[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const targetIndex = breakpointOrder.indexOf(breakpoint);
  
  return currentIndex >= targetIndex;
};

// Hook for mobile-first responsive design
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

// Predefined media queries
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsLarge = () => useMediaQuery('(min-width: 1280px)');

// Hook for touch device detection
export const useIsTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - for older browsers
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
    
    // Re-check on resize in case device orientation changes
    window.addEventListener('resize', checkTouch);
    
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
};

export default useResponsive;