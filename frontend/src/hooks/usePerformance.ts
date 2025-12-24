import { useEffect, useCallback, useRef } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentName: string
  timestamp: number
}

interface UsePerformanceOptions {
  enabled?: boolean
  threshold?: number // ms
  onSlowRender?: (metrics: PerformanceMetrics) => void
}

export const usePerformance = (
  componentName: string,
  options: UsePerformanceOptions = {}
) => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    threshold = 16, // 16ms = 60fps
    onSlowRender
  } = options

  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  // Start measuring render time
  const startMeasure = useCallback(() => {
    if (!enabled) return
    renderStartTime.current = performance.now()
  }, [enabled])

  // End measuring render time
  const endMeasure = useCallback(() => {
    if (!enabled || renderStartTime.current === 0) return

    const renderTime = performance.now() - renderStartTime.current
    renderCount.current += 1

    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now()
    }

    // Log slow renders
    if (renderTime > threshold) {
      console.warn(`Slow render detected in ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        threshold: `${threshold}ms`
      })
      
      onSlowRender?.(metrics)
    }

    // Reset for next measurement
    renderStartTime.current = 0
  }, [enabled, threshold, componentName, onSlowRender])

  // Measure component mount/unmount
  useEffect(() => {
    if (!enabled) return

    const mountTime = performance.now()
    console.log(`${componentName} mounted in ${mountTime.toFixed(2)}ms`)

    return () => {
      const unmountTime = performance.now()
      console.log(`${componentName} unmounted after ${(unmountTime - mountTime).toFixed(2)}ms`)
    }
  }, [enabled, componentName])

  // Auto-measure renders
  useEffect(() => {
    startMeasure()
    // Use setTimeout to measure after render
    const timeoutId = setTimeout(endMeasure, 0)
    return () => clearTimeout(timeoutId)
  })

  return {
    startMeasure,
    endMeasure,
    renderCount: renderCount.current
  }
}

// Hook for measuring async operations
export const useAsyncPerformance = () => {
  const measureAsync = useCallback(async <T>(
    name: string,
    asyncFn: () => Promise<T>,
    options: { threshold?: number; logResult?: boolean } = {}
  ): Promise<T> => {
    const { threshold = 1000, logResult = true } = options
    
    const startTime = performance.now()
    
    try {
      const result = await asyncFn()
      const duration = performance.now() - startTime
      
      if (logResult) {
        if (duration > threshold) {
          console.warn(`Slow async operation: ${name} took ${duration.toFixed(2)}ms`)
        } else {
          console.log(`${name} completed in ${duration.toFixed(2)}ms`)
        }
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      console.error(`${name} failed after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  }, [])

  return { measureAsync }
}

// Hook for monitoring memory usage
export const useMemoryMonitor = (intervalMs: number = 30000) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    if (!('memory' in performance)) return

    const checkMemory = () => {
      const memory = (performance as any).memory
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024)
      const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100

      console.log(`Memory: ${used}MB / ${total}MB (${usagePercent.toFixed(1)}% of ${limit}MB limit)`)

      if (usagePercent > 80) {
        console.warn('High memory usage detected:', `${usagePercent.toFixed(1)}%`)
      }
    }

    checkMemory() // Initial check
    const interval = setInterval(checkMemory, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs])
}

// Utility for debouncing expensive operations
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

// Utility for throttling expensive operations
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(0)

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = now
    }
  }, [callback, delay]) as T

  return throttledCallback
}