import { syncQueueOperations, cacheOperations } from './db';
import { offlineSyncManager } from './offlineSync';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Check if online
const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Enhanced API request with offline support
export async function apiRequestWithOffline(
  endpoint: string,
  options: RequestInit = {},
  skipCache = false
) {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge headers
  const finalHeaders = {
    ...headers,
    ...(options.headers as Record<string, string>),
  };

  // Handle GET requests with caching
  if (method === 'GET') {
    // Try to get from cache first
    if (!skipCache) {
      const cached = await cacheOperations.get(url);
      
      if (cached) {
        console.log('Serving from cache:', url);
        
        // If online, fetch in background to update cache (Stale-While-Revalidate)
        if (isOnline()) {
          fetch(url, {
            ...options,
            headers: finalHeaders,
          })
            .then(async (response) => {
              if (response.ok) {
                const data = await response.json();
                await cacheOperations.set(url, data);
                console.log('Cache updated in background:', url);
              }
            })
            .catch((error) => {
              console.log('Background fetch failed:', error);
            });
        }
        
        // Return cached data with indicator
        return {
          ...cached.data,
          _fromCache: true,
          _cacheTimestamp: cached.timestamp
        };
      }
    }

    // If not in cache or skipCache, try network
    if (isOnline()) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: finalHeaders,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Cache the response
        await cacheOperations.set(url, data);
        
        return data;
      } catch (error) {
        console.error('Network request failed:', error);
        
        // Try cache as fallback
        const cached = await cacheOperations.get(url);
        if (cached) {
          console.log('Network failed, serving stale cache:', url);
          return {
            ...cached.data,
            _fromCache: true,
            _cacheTimestamp: cached.timestamp,
            _stale: true
          };
        }
        
        throw error;
      }
    } else {
      // Offline - try cache
      const cached = await cacheOperations.get(url);
      if (cached) {
        console.log('Offline, serving from cache:', url);
        return {
          ...cached.data,
          _fromCache: true,
          _cacheTimestamp: cached.timestamp,
          _offline: true
        };
      }
      
      throw new Error('No cached data available offline');
    }
  }

  // Handle POST/PUT/PATCH/DELETE requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!isOnline()) {
      // Offline - queue the request
      console.log('Offline, queueing request:', method, url);
      
      await syncQueueOperations.add({
        url,
        method: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        payload: options.body ? JSON.parse(options.body as string) : null,
        headers: finalHeaders
      });

      // Register background sync
      await offlineSyncManager.registerBackgroundSync();

      // Return optimistic response
      return {
        _queued: true,
        _offline: true,
        message: 'Request queued for sync when online'
      };
    }

    // Online - make the request
    try {
      const response = await fetch(url, {
        ...options,
        headers: finalHeaders,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return {};
    } catch (error) {
      console.error('Request failed:', error);
      
      // Queue for retry
      await syncQueueOperations.add({
        url,
        method: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        payload: options.body ? JSON.parse(options.body as string) : null,
        headers: finalHeaders
      });

      // Register background sync
      await offlineSyncManager.registerBackgroundSync();

      throw error;
    }
  }

  // Fallback for other methods
  const response = await fetch(url, {
    ...options,
    headers: finalHeaders,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

// Export wrapper functions for common HTTP methods
export const offlineAPI = {
  get: (endpoint: string, skipCache = false) => 
    apiRequestWithOffline(endpoint, { method: 'GET' }, skipCache),
  
  post: (endpoint: string, data: any) =>
    apiRequestWithOffline(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  put: (endpoint: string, data: any) =>
    apiRequestWithOffline(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  patch: (endpoint: string, data: any) =>
    apiRequestWithOffline(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  
  delete: (endpoint: string) =>
    apiRequestWithOffline(endpoint, { method: 'DELETE' })
};
