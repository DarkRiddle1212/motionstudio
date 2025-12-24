import { useState, useEffect, useCallback } from 'react';

interface OfflineOptions {
  pingUrl?: string;
  pingInterval?: number;
  timeout?: number;
  onOnline?: () => void;
  onOffline?: () => void;
}

/**
 * useOffline Hook
 * 
 * Detects online/offline status and provides utilities for handling
 * network connectivity changes with graceful degradation.
 */
export const useOffline = (options: OfflineOptions = {}) => {
  const {
    pingUrl = '/api/health',
    pingInterval = 30000, // 30 seconds
    timeout = 5000, // 5 seconds
    onOnline,
    onOffline
  } = options;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }, [pingUrl, timeout]);

  const updateOnlineStatus = useCallback((online: boolean) => {
    const wasOnline = isOnline;
    
    setIsOnline(online);
    
    if (online) {
      setLastOnlineTime(new Date());
      if (!wasOnline && onOnline) {
        onOnline();
      }
    } else {
      if (wasOnline && onOffline) {
        onOffline();
      }
    }
  }, [isOnline, onOnline, onOffline]);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => updateOnlineStatus(true);
    const handleOffline = () => updateOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateOnlineStatus]);

  // Periodic connectivity check
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(async () => {
      const online = await checkConnectivity();
      if (!online && isOnline) {
        updateOnlineStatus(false);
      }
    }, pingInterval);

    return () => clearInterval(interval);
  }, [isOnline, checkConnectivity, pingInterval, updateOnlineStatus]);

  const forceCheck = useCallback(async () => {
    const online = await checkConnectivity();
    updateOnlineStatus(online);
    return online;
  }, [checkConnectivity, updateOnlineStatus]);

  const getOfflineDuration = useCallback((): number | null => {
    if (isOnline || !lastOnlineTime) return null;
    return Date.now() - lastOnlineTime.getTime();
  }, [isOnline, lastOnlineTime]);

  return {
    isOnline,
    isOffline: !isOnline,
    lastOnlineTime,
    forceCheck,
    getOfflineDuration
  };
};

/**
 * useOfflineStorage Hook
 * 
 * Provides utilities for storing and retrieving data when offline,
 * with automatic sync when connection is restored.
 */
export const useOfflineStorage = <T>(key: string) => {
  const [offlineData, setOfflineData] = useState<T[]>([]);
  const { isOnline } = useOffline();

  const storageKey = `offline_${key}`;

  // Load offline data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setOfflineData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }, [storageKey]);

  const addOfflineData = useCallback((data: T) => {
    const newData = [...offlineData, data];
    setOfflineData(newData);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(newData));
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }, [offlineData, storageKey]);

  const clearOfflineData = useCallback(() => {
    setOfflineData([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const syncOfflineData = useCallback(async (
    syncFunction: (data: T[]) => Promise<void>
  ) => {
    if (!isOnline || offlineData.length === 0) return;

    try {
      await syncFunction(offlineData);
      clearOfflineData();
    } catch (error) {
      console.error('Failed to sync offline data:', error);
      throw error;
    }
  }, [isOnline, offlineData, clearOfflineData]);

  return {
    offlineData,
    addOfflineData,
    clearOfflineData,
    syncOfflineData,
    hasOfflineData: offlineData.length > 0
  };
};