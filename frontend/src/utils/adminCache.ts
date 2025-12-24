// Admin data caching system for improved performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  enablePersistence: boolean; // Whether to persist to localStorage
}

class AdminCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private accessOrder: string[] = []; // For LRU eviction

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      enablePersistence: true,
      ...config,
    };

    // Load from localStorage if persistence is enabled
    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }

    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60 * 1000); // Every minute
  }

  // Get data from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);
    
    return entry.data;
  }

  // Set data in cache
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);

    // Evict if cache is full
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);

    // Persist to localStorage if enabled
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  // Delete specific key
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
      if (this.config.enablePersistence) {
        this.saveToStorage();
      }
    }
    return deleted;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    if (this.config.enablePersistence) {
      localStorage.removeItem('admin-cache');
    }
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [, entry] of this.cache) {
      if (now > entry.expiresAt) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      expiredCount,
      hitRate: this.calculateHitRate(),
    };
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: RegExp): number {
    let invalidated = 0;
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.delete(key);
      invalidated++;
    });

    return invalidated;
  }

  // Private methods
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder[0];
      this.cache.delete(lruKey);
      this.accessOrder.shift();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  private saveToStorage(): void {
    try {
      const cacheData = {
        entries: Array.from(this.cache.entries()),
        accessOrder: this.accessOrder,
      };
      localStorage.setItem('admin-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('admin-cache');
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache = new Map(cacheData.entries);
        this.accessOrder = cacheData.accessOrder || [];
        
        // Clean up expired entries
        this.cleanup();
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      localStorage.removeItem('admin-cache');
    }
  }

  private calculateHitRate(): number {
    // This would need to be implemented with hit/miss tracking
    // For now, return a placeholder
    return 0;
  }
}

// Create singleton instance
export const adminCache = new AdminCache();

// Cache key generators for different data types
export const CacheKeys = {
  users: (page: number, filters?: any) => 
    `users:${page}:${JSON.stringify(filters || {})}`,
  
  user: (id: string) => `user:${id}`,
  
  courses: (page: number, filters?: any) => 
    `courses:${page}:${JSON.stringify(filters || {})}`,
  
  course: (id: string) => `course:${id}`,
  
  payments: (page: number, filters?: any) => 
    `payments:${page}:${JSON.stringify(filters || {})}`,
  
  analytics: (type: string, period: string) => 
    `analytics:${type}:${period}`,
  
  scholarships: (page: number, filters?: any) => 
    `scholarships:${page}:${JSON.stringify(filters || {})}`,
  
  projects: (page: number, filters?: any) => 
    `projects:${page}:${JSON.stringify(filters || {})}`,
  
  systemConfig: () => 'system-config',
  
  auditLogs: (page: number, filters?: any) => 
    `audit-logs:${page}:${JSON.stringify(filters || {})}`,
};

// Cache invalidation helpers
export const CacheInvalidation = {
  // Invalidate all user-related cache
  users: () => adminCache.invalidatePattern(/^users?:/),
  
  // Invalidate all course-related cache
  courses: () => adminCache.invalidatePattern(/^courses?:/),
  
  // Invalidate all payment-related cache
  payments: () => adminCache.invalidatePattern(/^payments:/),
  
  // Invalidate all analytics cache
  analytics: () => adminCache.invalidatePattern(/^analytics:/),
  
  // Invalidate all scholarship-related cache
  scholarships: () => adminCache.invalidatePattern(/^scholarships:/),
  
  // Invalidate all project-related cache
  projects: () => adminCache.invalidatePattern(/^projects:/),
  
  // Invalidate system config cache
  systemConfig: () => adminCache.delete(CacheKeys.systemConfig()),
  
  // Invalidate all audit logs cache
  auditLogs: () => adminCache.invalidatePattern(/^audit-logs:/),
  
  // Clear all cache
  all: () => adminCache.clear(),
};

// Hook for using cache in React components
export const useAdminCache = () => {
  const get = <T>(key: string): T | null => adminCache.get<T>(key);
  
  const set = <T>(key: string, data: T, ttl?: number): void => 
    adminCache.set(key, data, ttl);
  
  const invalidate = (pattern: string | RegExp): number => {
    if (typeof pattern === 'string') {
      return adminCache.delete(pattern) ? 1 : 0;
    }
    return adminCache.invalidatePattern(pattern);
  };
  
  const has = (key: string): boolean => adminCache.has(key);
  
  const stats = () => adminCache.getStats();
  
  return {
    get,
    set,
    invalidate,
    has,
    stats,
    keys: CacheKeys,
    invalidation: CacheInvalidation,
  };
};

export default adminCache;