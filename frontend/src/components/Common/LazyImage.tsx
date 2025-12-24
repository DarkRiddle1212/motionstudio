import { useState, useRef, useEffect, useCallback } from 'react'
import React from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
  // Performance optimizations
  priority?: boolean // For above-the-fold images
  sizes?: string // Responsive image sizes
  srcSet?: string // Multiple image sources
  quality?: number // Image quality (1-100)
  blur?: boolean // Enable blur-up effect
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0Y2QzFDQyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOEE4QThFIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
  onLoad,
  onError,
  priority = false,
  sizes,
  srcSet,
  quality = 75,
  blur = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority) // Load immediately if priority
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Preload critical images
  const preloadImage = useCallback((imageSrc: string) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = imageSrc
    if (srcSet) link.setAttribute('imagesrcset', srcSet)
    if (sizes) link.setAttribute('imagesizes', sizes)
    document.head.appendChild(link)
  }, [srcSet, sizes])

  // Intersection Observer setup
  useEffect(() => {
    if (priority || isInView) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          setIsLoading(true)
          observerRef.current?.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    )

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [priority, isInView])

  // Preload priority images
  useEffect(() => {
    if (priority) {
      preloadImage(src)
    }
  }, [priority, src, preloadImage])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }, [onError])

  // Generate optimized image URL (if using a CDN or image service)
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    // This would integrate with your image optimization service
    // For now, just return the original src
    return originalSrc
  }, [])

  const optimizedSrc = getOptimizedSrc(src)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover ${
            blur ? 'blur-sm' : ''
          } transition-opacity duration-300`}
          aria-hidden="true"
        />
      )}
      
      {/* Loading indicator */}
      {isLoading && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary-bg bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-text"></div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? optimizedSrc : placeholder}
        srcSet={isInView && srcSet ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // Add performance hints
        fetchPriority={priority ? 'high' : 'auto'}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary-bg">
          <div className="text-center">
            <div className="text-secondary-text text-sm mb-2">Failed to load image</div>
            <button
              onClick={() => {
                setHasError(false)
                setIsInView(true)
                setIsLoading(true)
              }}
              className="text-xs text-primary-text hover:text-accent-pink transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Higher-order component for image optimization
export const withImageOptimization = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    // Add image optimization logic here
    return <Component {...(props as P)} ref={ref} />
  })
}

// Utility for generating responsive image srcSet
export const generateSrcSet = (
  baseSrc: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string => {
  return widths
    .map(width => {
      // This would integrate with your image service
      // For now, just return the base src
      return `${baseSrc} ${width}w`
    })
    .join(', ')
}

// Utility for generating responsive sizes attribute
export const generateSizes = (breakpoints: { [key: string]: string } = {
  '(max-width: 640px)': '100vw',
  '(max-width: 1024px)': '50vw',
  default: '33vw'
}): string => {
  const entries = Object.entries(breakpoints)
  const mediaQueries = entries.slice(0, -1).map(([query, size]) => `${query} ${size}`)
  const defaultSize = breakpoints.default || '100vw'
  
  return [...mediaQueries, defaultSize].join(', ')
}