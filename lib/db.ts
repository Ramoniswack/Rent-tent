import Dexie, { Table } from 'dexie';

// Define sync queue item interface
export interface SyncQueueItem {
  id?: number;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount?: number;
}

// Define cached response interface
export interface CachedResponse {
  url: string;
  data: any;
  timestamp: number;
  etag?: string;
}

// Dexie database class
class NomadNotesDB extends Dexie {
  syncQueue!: Table<SyncQueueItem, number>;
  cachedResponses!: Table<CachedResponse, string>;

  constructor() {
    super('NomadNotesDB');
    
    this.version(1).stores({
      syncQueue: '++id, url, method, timestamp',
      cachedResponses: 'url, timestamp'
    });
  }
}

// Create database instance
export const db = new NomadNotesDB();

// Sync Queue Operations
export const syncQueueOperations = {
  // Add item to sync queue
  add: async (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => {
    try {
      const id = await db.syncQueue.add({
        ...item,
        timestamp: Date.now(),
        retryCount: 0
      });
      console.log('Added to sync queue:', id, item);
      return id;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  },

  // Get all items in queue
  getAll: async () => {
    try {
      return await db.syncQueue.orderBy('timestamp').toArray();
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  },

  // Get count of items in queue
  getCount: async () => {
    try {
      return await db.syncQueue.count();
    } catch (error) {
      console.error('Error getting sync queue count:', error);
      return 0;
    }
  },

  // Remove item from queue
  remove: async (id: number) => {
    try {
      await db.syncQueue.delete(id);
      console.log('Removed from sync queue:', id);
    } catch (error) {
      console.error('Error removing from sync queue:', error);
      throw error;
    }
  },

  // Update retry count
  incrementRetry: async (id: number) => {
    try {
      const item = await db.syncQueue.get(id);
      if (item) {
        await db.syncQueue.update(id, {
          retryCount: (item.retryCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error incrementing retry count:', error);
    }
  },

  // Clear all items
  clear: async () => {
    try {
      await db.syncQueue.clear();
      console.log('Sync queue cleared');
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }
};

// Cache Operations
export const cacheOperations = {
  // Save response to cache
  set: async (url: string, data: any, etag?: string) => {
    try {
      await db.cachedResponses.put({
        url,
        data,
        timestamp: Date.now(),
        etag
      });
      console.log('Cached response:', url);
    } catch (error) {
      console.error('Error caching response:', error);
    }
  },

  // Get cached response
  get: async (url: string) => {
    try {
      return await db.cachedResponses.get(url);
    } catch (error) {
      console.error('Error getting cached response:', error);
      return null;
    }
  },

  // Check if cache is stale (older than 5 minutes)
  isStale: (cachedItem: CachedResponse | null, maxAge = 5 * 60 * 1000) => {
    if (!cachedItem) return true;
    return Date.now() - cachedItem.timestamp > maxAge;
  },

  // Clear old cache entries (older than 24 hours)
  clearOld: async (maxAge = 24 * 60 * 60 * 1000) => {
    try {
      const cutoff = Date.now() - maxAge;
      await db.cachedResponses
        .where('timestamp')
        .below(cutoff)
        .delete();
      console.log('Cleared old cache entries');
    } catch (error) {
      console.error('Error clearing old cache:', error);
    }
  },

  // Clear all cache
  clear: async () => {
    try {
      await db.cachedResponses.clear();
      console.log('Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
};

export default db;
