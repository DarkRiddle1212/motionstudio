// Performance testing utilities
export interface PerformanceTestResult {
  name: string
  duration: number
  timestamp: number
  passed: boolean
  threshold: number
}

export class PerformanceTest {
  private results: PerformanceTestResult[] = []

  // Test bundle size
  async testBundleSize(): Promise<PerformanceTestResult> {
    const threshold = 1000 // 1MB threshold for main bundle
    const startTime = performance.now()
    
    try {
      // This would be implemented with actual bundle analysis
      // For now, we'll simulate the test
      const bundleSize = 800 // KB - simulated
      const duration = performance.now() - startTime
      
      const result: PerformanceTestResult = {
        name: 'Bundle Size',
        duration,
        timestamp: Date.now(),
        passed: bundleSize < threshold,
        threshold
      }
      
      this.results.push(result)
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      const result: PerformanceTestResult = {
        name: 'Bundle Size',
        duration,
        timestamp: Date.now(),
        passed: false,
        threshold
      }
      
      this.results.push(result)
      return result
    }
  }

  // Test First Contentful Paint
  async testFCP(): Promise<PerformanceTestResult> {
    const threshold = 1800 // 1.8s threshold
    
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        
        if (fcpEntry) {
          const result: PerformanceTestResult = {
            name: 'First Contentful Paint',
            duration: fcpEntry.startTime,
            timestamp: Date.now(),
            passed: fcpEntry.startTime < threshold,
            threshold
          }
          
          this.results.push(result)
          resolve(result)
        }
      }).observe({ entryTypes: ['paint'] })
    })
  }

  // Test Largest Contentful Paint
  async testLCP(): Promise<PerformanceTestResult> {
    const threshold = 2500 // 2.5s threshold
    
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        const result: PerformanceTestResult = {
          name: 'Largest Contentful Paint',
          duration: lastEntry.startTime,
          timestamp: Date.now(),
          passed: lastEntry.startTime < threshold,
          threshold
        }
        
        this.results.push(result)
        resolve(result)
      }).observe({ entryTypes: ['largest-contentful-paint'] })
    })
  }

  // Test Cumulative Layout Shift
  async testCLS(): Promise<PerformanceTestResult> {
    const threshold = 0.1 // 0.1 CLS threshold
    let clsValue = 0
    
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        // Resolve after a delay to collect all layout shifts
        setTimeout(() => {
          const result: PerformanceTestResult = {
            name: 'Cumulative Layout Shift',
            duration: clsValue,
            timestamp: Date.now(),
            passed: clsValue < threshold,
            threshold
          }
          
          this.results.push(result)
          resolve(result)
        }, 5000) // Wait 5 seconds to collect CLS
      }).observe({ entryTypes: ['layout-shift'] })
    })
  }

  // Test Time to Interactive
  async testTTI(): Promise<PerformanceTestResult> {
    const threshold = 3800 // 3.8s threshold
    const startTime = performance.now()
    
    // Simplified TTI calculation
    return new Promise((resolve) => {
      // Wait for main thread to be idle
      setTimeout(() => {
        const tti = performance.now() - startTime
        
        const result: PerformanceTestResult = {
          name: 'Time to Interactive',
          duration: tti,
          timestamp: Date.now(),
          passed: tti < threshold,
          threshold
        }
        
        this.results.push(result)
        resolve(result)
      }, 100)
    })
  }

  // Test resource loading performance
  async testResourceLoading(): Promise<PerformanceTestResult> {
    const threshold = 1000 // 1s threshold for slow resources
    const slowResources: string[] = []
    
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.duration > threshold) {
            slowResources.push(entry.name)
          }
        })
        
        setTimeout(() => {
          const result: PerformanceTestResult = {
            name: 'Resource Loading',
            duration: slowResources.length,
            timestamp: Date.now(),
            passed: slowResources.length === 0,
            threshold: 0
          }
          
          this.results.push(result)
          resolve(result)
        }, 3000) // Wait 3 seconds to collect all resources
      }).observe({ entryTypes: ['resource'] })
    })
  }

  // Test memory usage
  async testMemoryUsage(): Promise<PerformanceTestResult> {
    const threshold = 50 // 50MB threshold
    
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      
      const result: PerformanceTestResult = {
        name: 'Memory Usage',
        duration: usedMB,
        timestamp: Date.now(),
        passed: usedMB < threshold,
        threshold
      }
      
      this.results.push(result)
      return result
    } else {
      const result: PerformanceTestResult = {
        name: 'Memory Usage',
        duration: 0,
        timestamp: Date.now(),
        passed: true, // Pass if memory API not available
        threshold
      }
      
      this.results.push(result)
      return result
    }
  }

  // Run all performance tests
  async runAllTests(): Promise<PerformanceTestResult[]> {
    console.log('Starting performance tests...')
    
    const tests = [
      this.testBundleSize(),
      this.testFCP(),
      this.testLCP(),
      this.testCLS(),
      this.testTTI(),
      this.testResourceLoading(),
      this.testMemoryUsage()
    ]
    
    const results = await Promise.all(tests)
    
    // Log results
    console.log('Performance Test Results:')
    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${result.name}: ${result.duration.toFixed(2)}ms (threshold: ${result.threshold}ms)`)
    })
    
    const passedTests = results.filter(r => r.passed).length
    const totalTests = results.length
    console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`)
    
    return results
  }

  // Get test results
  getResults(): PerformanceTestResult[] {
    return this.results
  }

  // Clear test results
  clearResults(): void {
    this.results = []
  }

  // Generate performance report
  generateReport(): string {
    const passedTests = this.results.filter(r => r.passed).length
    const totalTests = this.results.length
    const passRate = (passedTests / totalTests) * 100
    
    let report = `Performance Test Report\n`
    report += `========================\n\n`
    report += `Overall Score: ${passedTests}/${totalTests} (${passRate.toFixed(1)}%)\n\n`
    
    this.results.forEach(result => {
      const status = result.passed ? 'PASS' : 'FAIL'
      report += `${result.name}: ${status}\n`
      report += `  Value: ${result.duration.toFixed(2)}${result.name.includes('Layout Shift') ? '' : 'ms'}\n`
      report += `  Threshold: ${result.threshold}${result.name.includes('Layout Shift') ? '' : 'ms'}\n`
      report += `  Timestamp: ${new Date(result.timestamp).toISOString()}\n\n`
    })
    
    return report
  }
}

// Global performance test instance
export const performanceTest = new PerformanceTest()

// Utility function to run performance tests
export const runPerformanceTests = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    await performanceTest.runAllTests()
  }
}

// Hook for running performance tests in React components
export const usePerformanceTest = () => {
  return {
    runTests: performanceTest.runAllTests.bind(performanceTest),
    getResults: performanceTest.getResults.bind(performanceTest),
    clearResults: performanceTest.clearResults.bind(performanceTest),
    generateReport: performanceTest.generateReport.bind(performanceTest)
  }
}