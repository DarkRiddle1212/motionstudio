import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './utils/serviceWorker'
import { initializeCriticalResources } from './utils/resourcePreloader'

// Initialize critical resources before rendering
initializeCriticalResources().then(() => {
  console.log('Critical resources initialized')
}).catch(error => {
  console.warn('Failed to initialize some critical resources:', error)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for caching and offline support
registerServiceWorker()

// Report Web Vitals in production
if (process.env.NODE_ENV === 'production') {
  // Report to analytics endpoint
  const reportWebVitals = (metric: any) => {
    // Send to analytics
    console.log(metric)
    
    // You can send to your analytics service here
    // Example: analytics.track('web-vital', metric)
  }

  // Measure and report Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      reportWebVitals({
        name: 'LCP',
        value: lastEntry.startTime,
        rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
      })
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime
        reportWebVitals({
          name: 'FID',
          value: fid,
          rating: fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor'
        })
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      reportWebVitals({
        name: 'CLS',
        value: clsValue,
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }
}
