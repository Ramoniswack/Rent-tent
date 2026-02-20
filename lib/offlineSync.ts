import { syncQueueOperations } from './db';

// Event emitter for sync status
type SyncEventListener = (event: SyncEvent) => void;

export interface SyncEvent {
  type: 'sync-start' | 'sync-progress' | 'sync-complete' | 'sync-error';
  message?: string;
  progress?: { current: number; total: number };
  error?: Error;
}

// Type guard for Background Sync support
function hasBackgroundSync(registration: ServiceWorkerRegistration): registration is ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } } {
  return 'sync' in registration && registration.sync !== undefined;
}

class OfflineSyncManager {
  private listeners: SyncEventListener[] = [];
  private isSyncing = false;

  // Subscribe to sync events
  on(listener: SyncEventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Emit sync event
  private emit(event: SyncEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  // Check if online
  isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  // Register background sync
  async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Use type guard to check for sync support
        if (hasBackgroundSync(registration)) {
          await registration.sync.register('sync-data');
          console.log('Background sync registered');
        } else {
          throw new Error('Sync manager not available');
        }
      } catch (error) {
        console.error('Background sync registration failed:', error);
        // Fallback to manual sync
        this.syncNow();
      }
    } else {
      console.log('Background sync not supported, using manual sync');
      // Fallback to manual sync when online
      if (this.isOnline()) {
        this.syncNow();
      }
    }
  }

  // Manual sync now
  async syncNow() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!this.isOnline()) {
      console.log('Cannot sync: offline');
      return;
    }

    this.isSyncing = true;
    this.emit({ type: 'sync-start', message: 'Starting sync...' });

    try {
      const queue = await syncQueueOperations.getAll();
      
      if (queue.length === 0) {
        this.emit({ type: 'sync-complete', message: 'Nothing to sync' });
        this.isSyncing = false;
        return;
      }

      console.log(`Syncing ${queue.length} items...`);
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        
        this.emit({
          type: 'sync-progress',
          message: `Syncing ${i + 1} of ${queue.length}...`,
          progress: { current: i + 1, total: queue.length }
        });

        try {
          // Replay the request
          const response = await fetch(item.url, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              ...item.headers
            },
            body: item.payload ? JSON.stringify(item.payload) : undefined
          });

          if (response.ok) {
            // Success - remove from queue
            if (item.id) {
              await syncQueueOperations.remove(item.id);
            }
            successCount++;
            console.log(`Synced successfully: ${item.method} ${item.url}`);
          } else {
            // Failed - increment retry count
            if (item.id) {
              await syncQueueOperations.incrementRetry(item.id);
            }
            failCount++;
            console.error(`Sync failed: ${item.method} ${item.url}`, response.status);
            
            // Remove if too many retries (max 3)
            if (item.retryCount && item.retryCount >= 3 && item.id) {
              await syncQueueOperations.remove(item.id);
              console.log(`Removed after ${item.retryCount} retries: ${item.url}`);
            }
          }
        } catch (error) {
          console.error(`Sync error: ${item.method} ${item.url}`, error);
          if (item.id) {
            await syncQueueOperations.incrementRetry(item.id);
          }
          failCount++;
        }
      }

      const message = `Sync complete: ${successCount} succeeded, ${failCount} failed`;
      this.emit({ type: 'sync-complete', message });
      console.log(message);

    } catch (error) {
      console.error('Sync error:', error);
      this.emit({
        type: 'sync-error',
        message: 'Sync failed',
        error: error as Error
      });
    } finally {
      this.isSyncing = false;
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      isOnline: this.isOnline()
    };
  }
}

// Singleton instance
export const offlineSyncManager = new OfflineSyncManager();

// Setup online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online - triggering sync');
    offlineSyncManager.registerBackgroundSync();
  });

  window.addEventListener('offline', () => {
    console.log('Gone offline');
  });
}
