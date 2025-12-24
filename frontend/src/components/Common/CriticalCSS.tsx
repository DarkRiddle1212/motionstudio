import { useEffect } from 'react'

// Critical CSS that should be inlined to prevent FOUC (Flash of Unstyled Content)
const CRITICAL_CSS = `
  /* Critical styles for above-the-fold content */
  
  /* Reset and base styles */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
  }
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #F6C1CC;
    color: #2B2B2E;
  }
  
  /* Loading spinner for initial load */
  .initial-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #F6C1CC;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  
  .initial-loading .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #F9D6DC;
    border-top: 3px solid #2B2B2E;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Prevent layout shift for images */
  img {
    max-width: 100%;
    height: auto;
  }
  
  /* Critical navigation styles */
  .nav-critical {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    background-color: rgba(246, 193, 204, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    border-bottom: 1px solid rgba(43, 43, 46, 0.1);
  }
  
  /* Critical hero section styles */
  .hero-critical {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F6C1CC;
    padding-top: 64px;
  }
  
  /* Critical button styles */
  .btn-critical {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
  }
  
  .btn-primary-critical {
    background-color: #2B2B2E;
    color: white;
  }
  
  .btn-primary-critical:hover {
    background-color: #C89AA6;
  }
  
  .btn-secondary-critical {
    background-color: transparent;
    color: #2B2B2E;
    border: 2px solid #2B2B2E;
  }
  
  .btn-secondary-critical:hover {
    background-color: #2B2B2E;
    color: white;
  }
  
  /* Prevent flash of invisible text */
  @font-face {
    font-family: 'Playfair Display';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: local('Playfair Display'), local('PlayfairDisplay-Regular');
  }
  
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: local('Inter'), local('Inter-Regular');
  }
  
  /* Critical responsive utilities */
  @media (max-width: 640px) {
    .hero-critical {
      padding: 80px 16px 40px;
      text-align: center;
    }
    
    .nav-critical {
      height: 56px;
    }
  }
`

interface CriticalCSSProps {
  children?: React.ReactNode
}

export const CriticalCSS: React.FC<CriticalCSSProps> = ({ children }) => {
  useEffect(() => {
    // Inject critical CSS if not already present
    const existingStyle = document.getElementById('critical-css')
    if (!existingStyle) {
      const style = document.createElement('style')
      style.id = 'critical-css'
      style.textContent = CRITICAL_CSS
      document.head.insertBefore(style, document.head.firstChild)
    }

    // Remove initial loading screen once React has mounted
    const loadingScreen = document.getElementById('initial-loading')
    if (loadingScreen) {
      loadingScreen.style.opacity = '0'
      setTimeout(() => {
        loadingScreen.remove()
      }, 300)
    }

    // Note: In Vite, CSS is automatically handled, so we don't need to manually preload
    // The CSS is already being imported in main.tsx

    return () => {
      // Cleanup if needed
    }
  }, [])

  return <>{children}</>
}

// Component to prevent Cumulative Layout Shift (CLS)
interface LayoutStabilityProps {
  children: React.ReactNode
  className?: string
}

export const LayoutStability: React.FC<LayoutStabilityProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`${className}`}
      style={{
        // Prevent layout shifts by reserving space
        minHeight: 'var(--min-height, auto)',
        aspectRatio: 'var(--aspect-ratio, auto)',
        // Ensure consistent sizing
        contain: 'layout style paint'
      }}
    >
      {children}
    </div>
  )
}

// Hook for measuring and preventing layout shifts
export const useLayoutStability = () => {
  useEffect(() => {
    // Monitor layout shifts
    if ('LayoutShift' in window) {
      let clsValue = 0
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as LayoutShift
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value
          }
        }
        
        // Log significant layout shifts
        if (clsValue > 0.1) {
          console.warn('Cumulative Layout Shift detected:', clsValue)
        }
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
      
      return () => observer.disconnect()
    }
  }, [])
}

// Utility for creating aspect ratio containers
export const AspectRatioContainer: React.FC<{
  ratio: number // width/height ratio (e.g., 16/9 = 1.777)
  children: React.ReactNode
  className?: string
}> = ({ ratio, children, className = '' }) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{ aspectRatio: ratio.toString() }}
    >
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  )
}

// Type definition for LayoutShift
interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}