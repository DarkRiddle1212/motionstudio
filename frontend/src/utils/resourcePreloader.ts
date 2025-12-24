// Resource preloader for critical assets
export class ResourcePreloader {
  private static instance: ResourcePreloader
  private preloadedResources = new Set<string>()
  private loadingResources = new Map<string, Promise<void>>()

  static getInstance(): ResourcePreloader {
    if (!ResourcePreloader.instance) {
      ResourcePreloader.instance = new ResourcePreloader()
    }
    return ResourcePreloader.instance
  }

  // Preload critical images
  async preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve()
    }

    if (this.loadingResources.has(src)) {
      return this.loadingResources.get(src)!
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        this.preloadedResources.add(src)
        this.loadingResources.delete(src)
        resolve()
      }
      
      img.onerror = () => {
        this.loadingResources.delete(src)
        reject(new Error(`Failed to preload image: ${src}`))
      }

      // Set priority hint if supported
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = priority
      }
      
      img.src = src
    })

    this.loadingResources.set(src, loadPromise)
    return loadPromise
  }

  // Preload critical CSS
  preloadCSS(href: string): void {
    if (this.preloadedResources.has(href)) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    link.onload = () => {
      this.preloadedResources.add(href)
      // Convert to actual stylesheet
      link.rel = 'stylesheet'
    }
    
    document.head.appendChild(link)
  }

  // Preload JavaScript modules
  preloadScript(src: string): void {
    if (this.preloadedResources.has(src)) return

    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = src
    link.onload = () => this.preloadedResources.add(src)
    
    document.head.appendChild(link)
  }

  // Preload fonts
  preloadFont(href: string, type: string = 'font/woff2'): void {
    if (this.preloadedResources.has(href)) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = type
    link.href = href
    link.crossOrigin = 'anonymous'
    link.onload = () => this.preloadedResources.add(href)
    
    document.head.appendChild(link)
  }

  // Prefetch resources for future navigation
  prefetchResource(href: string): void {
    if (this.preloadedResources.has(href)) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    link.onload = () => this.preloadedResources.add(href)
    
    document.head.appendChild(link)
  }

  // DNS prefetch for external domains
  dnsPrefetch(domain: string): void {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    
    document.head.appendChild(link)
  }

  // Preconnect to external domains
  preconnect(domain: string): void {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    link.crossOrigin = 'anonymous'
    
    document.head.appendChild(link)
  }

  // Batch preload multiple images
  async preloadImages(sources: string[], priority: 'high' | 'low' = 'low'): Promise<void[]> {
    const promises = sources.map(src => this.preloadImage(src, priority))
    return Promise.all(promises)
  }

  // Check if resource is preloaded
  isPreloaded(src: string): boolean {
    return this.preloadedResources.has(src)
  }

  // Get preload statistics
  getStats(): { preloaded: number; loading: number } {
    return {
      preloaded: this.preloadedResources.size,
      loading: this.loadingResources.size
    }
  }

  // Clear preload cache
  clearCache(): void {
    this.preloadedResources.clear()
    this.loadingResources.clear()
  }
}

// Utility functions
export const preloader = ResourcePreloader.getInstance()

// Hook for preloading resources in React components
export const useResourcePreloader = () => {
  return {
    preloadImage: preloader.preloadImage.bind(preloader),
    preloadImages: preloader.preloadImages.bind(preloader),
    preloadCSS: preloader.preloadCSS.bind(preloader),
    preloadScript: preloader.preloadScript.bind(preloader),
    preloadFont: preloader.preloadFont.bind(preloader),
    prefetchResource: preloader.prefetchResource.bind(preloader),
    dnsPrefetch: preloader.dnsPrefetch.bind(preloader),
    preconnect: preloader.preconnect.bind(preloader),
    isPreloaded: preloader.isPreloaded.bind(preloader),
    getStats: preloader.getStats.bind(preloader)
  }
}

// Critical resource preloading configuration
export const CRITICAL_RESOURCES = {
  // Critical images (above the fold)
  images: [
    // Add your critical images here
    // '/images/hero-bg.jpg',
    // '/images/logo.svg'
  ],
  
  // Critical fonts
  fonts: [
    // Add your critical fonts here
    // '/fonts/playfair-display.woff2',
    // '/fonts/inter.woff2'
  ],
  
  // External domains to preconnect
  domains: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
    // Add your API domains, CDN domains, etc.
  ],
  
  // DNS prefetch domains
  dnsPrefetch: [
    '//api.example.com',
    '//cdn.example.com'
    // Add domains for faster DNS resolution
  ]
}

// Initialize critical resource preloading
export const initializeCriticalResources = async (): Promise<void> => {
  const preloader = ResourcePreloader.getInstance()
  
  // Preconnect to critical domains
  CRITICAL_RESOURCES.domains.forEach(domain => {
    preloader.preconnect(domain)
  })
  
  // DNS prefetch
  CRITICAL_RESOURCES.dnsPrefetch.forEach(domain => {
    preloader.dnsPrefetch(domain)
  })
  
  // Preload critical fonts
  CRITICAL_RESOURCES.fonts.forEach(font => {
    preloader.preloadFont(font)
  })
  
  // Preload critical images
  if (CRITICAL_RESOURCES.images.length > 0) {
    try {
      await preloader.preloadImages(CRITICAL_RESOURCES.images, 'high')
      console.log('Critical images preloaded successfully')
    } catch (error) {
      console.warn('Some critical images failed to preload:', error)
    }
  }
}