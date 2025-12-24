import { useEffect } from 'react'

interface PerformanceMonitorProps {
  enabled?: boolean
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development'
}) => {
  useEffect(() => {
    if (!enabled) return

    // Monitor Core Web Vitals
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('LCP:', lastEntry.startTime)
        
        // Warn if LCP is over 2.5s (poor threshold)
        if (lastEntry.startTime > 2500) {
          console.warn('Poor LCP detected:', lastEntry.startTime + 'ms')
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID) - approximated with First Input
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const firstInputEntry = entry as PerformanceEventTiming
          const fid = firstInputEntry.processingStart - firstInputEntry.startTime
          console.log('FID:', fid)
          
          // Warn if FID is over 100ms (poor threshold)
          if (fid > 100) {
            console.warn('Poor FID detected:', fid + 'ms')
          }
        })
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const layoutShiftEntry = entry as LayoutShift
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value
          }
        })
        console.log('CLS:', clsValue)
        
        // Warn if CLS is over 0.1 (poor threshold)
        if (clsValue > 0.1) {
          console.warn('Poor CLS detected:', clsValue)
        }
      }).observe({ entryTypes: ['layout-shift'] })
    }

    // Monitor long tasks (over 50ms)
    const observeLongTasks = () => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          })
        })
      }).observe({ entryTypes: ['longtask'] })
    }

    // Monitor resource loading
    const observeResources = () => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const resource = entry as PerformanceResourceTiming
          
          // Warn about slow resources (over 1s)
          if (resource.duration > 1000) {
            console.warn('Slow resource detected:', {
              name: resource.name,
              duration: resource.duration,
              size: resource.transferSize
            })
          }
          
          // Warn about large resources (over 1MB)
          if (resource.transferSize > 1024 * 1024) {
            console.warn('Large resource detected:', {
              name: resource.name,
              size: resource.transferSize,
              duration: resource.duration
            })
          }
        })
      }).observe({ entryTypes: ['resource'] })
    }

    // Start monitoring
    observeWebVitals()
    observeLongTasks()
    observeResources()

    // Memory usage monitoring (if available)
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
        })
        
        // Warn if memory usage is high
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        if (usagePercent > 80) {
          console.warn('High memory usage detected:', usagePercent.toFixed(2) + '%')
        }
      }
    }

    // Monitor memory every 30 seconds
    const memoryInterval = setInterval(monitorMemory, 30000)

    return () => {
      clearInterval(memoryInterval)
    }
  }, [enabled])

  // This component doesn't render anything
  return null
}

// Utility function to measure custom performance marks
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const startMark = `${name}-start`
  const endMark = `${name}-end`
  const measureName = `${name}-measure`

  performance.mark(startMark)
  
  const result = fn()
  
  if (result instanceof Promise) {
    return result.finally(() => {
      performance.mark(endMark)
      performance.measure(measureName, startMark, endMark)
      
      const measure = performance.getEntriesByName(measureName)[0]
      console.log(`${name} took ${measure.duration.toFixed(2)}ms`)
      
      // Clean up marks and measures
      performance.clearMarks(startMark)
      performance.clearMarks(endMark)
      performance.clearMeasures(measureName)
    })
  } else {
    performance.mark(endMark)
    performance.measure(measureName, startMark, endMark)
    
    const measure = performance.getEntriesByName(measureName)[0]
    console.log(`${name} took ${measure.duration.toFixed(2)}ms`)
    
    // Clean up marks and measures
    performance.clearMarks(startMark)
    performance.clearMarks(endMark)
    performance.clearMeasures(measureName)
    
    return result
  }
}

// Type definitions for Web APIs
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number
}

interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}