const CACHE_NAME = 'motion-studio-v1'
const STATIC_CACHE = 'motion-studio-static-v1'
const DYNAMIC_CACHE = 'motion-studio-dynamic-v1'
const IMAGE_CACHE = 'motion-studio-images-v1'
const API_CACHE = 'motion-studio-api-v1'

// Cache size limits
const MAX_CACHE_SIZE = {
  [STATIC_CACHE]: 50,
  [DYNAMIC_CACHE]: 100,
  [IMAGE_CACHE]: 200,
  [API_CACHE]: 50
}

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  [STATIC_CACHE]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [DYNAMIC_CACHE]: 24 * 60 * 60 * 1000, // 1 day
  [IMAGE_CACHE]: 30 * 24 * 60 * 60 * 1000, // 30 days
  [API_CACHE]: 5 * 60 * 1000 // 5 minutes
}

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add critical CSS and JS files here when they're generated
]

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  /^\/api\/courses/,
  /^\/api\/projects/,
  /^\/api\/users\/profile/
]

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              !Object.values({
                STATIC_CACHE,
                DYNAMIC_CACHE,
                IMAGE_CACHE,
                API_CACHE
              }).includes(cacheName)
            )
            .map(cacheName => caches.delete(cacheName))
        )
      }),
      // Clean up expired entries
      cleanupExpiredEntries()
    ]).then(() => self.clients.claim())
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE))
    return
  }

  // Handle images with cache-first strategy
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE))
    return
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
    return
  }

  // Default to network-first for everything else
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
})

// Network-first strategy with cache size management
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      
      // Add timestamp for expiration tracking
      const responseToCache = networkResponse.clone()
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cache-timestamp', Date.now().toString())
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      })
      
      await cache.put(request, modifiedResponse)
      
      // Manage cache size
      await manageCacheSize(cacheName)
    }
    
    return networkResponse
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Check if cached response is expired
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp')
      if (cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp)
        if (age > CACHE_EXPIRATION[cacheName]) {
          // Remove expired entry
          const cache = await caches.open(cacheName)
          await cache.delete(request)
          throw error
        }
      }
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html')
    }
    
    throw error
  }
}

// Cache-first strategy with expiration
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    // Check if cached response is expired
    const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp')
    if (cacheTimestamp) {
      const age = Date.now() - parseInt(cacheTimestamp)
      if (age <= CACHE_EXPIRATION[cacheName]) {
        // Update in background if needed
        updateInBackground(request, cacheName)
        return cachedResponse
      }
    } else {
      // Old cache entry without timestamp, still use it
      return cachedResponse
    }
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      
      // Add timestamp
      const responseToCache = networkResponse.clone()
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cache-timestamp', Date.now().toString())
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      })
      
      await cache.put(request, modifiedResponse)
      await manageCacheSize(cacheName)
    }
    
    return networkResponse
  } catch (error) {
    // Return cached response even if expired as fallback
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Update resource in background
async function updateInBackground(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      
      const headers = new Headers(networkResponse.headers)
      headers.set('sw-cache-timestamp', Date.now().toString())
      
      const modifiedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      })
      
      await cache.put(request, modifiedResponse)
    }
  } catch (error) {
    // Silently fail background updates
    console.log('Background update failed:', error)
  }
}

// Manage cache size by removing oldest entries
async function manageCacheSize(cacheName) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > MAX_CACHE_SIZE[cacheName]) {
    // Sort by timestamp (oldest first)
    const keysWithTimestamp = await Promise.all(
      keys.map(async key => {
        const response = await cache.match(key)
        const timestamp = response?.headers.get('sw-cache-timestamp') || '0'
        return { key, timestamp: parseInt(timestamp) }
      })
    )
    
    keysWithTimestamp.sort((a, b) => a.timestamp - b.timestamp)
    
    // Remove oldest entries
    const entriesToRemove = keysWithTimestamp.slice(0, keys.length - MAX_CACHE_SIZE[cacheName])
    await Promise.all(
      entriesToRemove.map(entry => cache.delete(entry.key))
    )
  }
}

// Clean up expired entries
async function cleanupExpiredEntries() {
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE]
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      
      for (const key of keys) {
        const response = await cache.match(key)
        const cacheTimestamp = response?.headers.get('sw-cache-timestamp')
        
        if (cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp)
          if (age > CACHE_EXPIRATION[cacheName]) {
            await cache.delete(key)
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up cache:', cacheName, error)
    }
  }
}

// Background sync for failed API requests (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
      event.waitUntil(doBackgroundSync())
    }
  })
}

async function doBackgroundSync() {
  // Implement background sync logic for failed requests
  console.log('Background sync triggered')
}

// Periodic cleanup
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEANUP_CACHES') {
    event.waitUntil(cleanupExpiredEntries())
  }
})

// Send periodic cleanup message
setInterval(() => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'CLEANUP_CACHES' })
    })
  })
}, 60 * 60 * 1000) // Every hour