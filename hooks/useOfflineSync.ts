import { useState, useEffect } from 'react';
import { offlineSyncManager, SyncEvent } from '../lib/offlineSync';
import { syncQueueOperations } from '../lib/db';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncEvent | null>(null);
  const [queueCount, setQueueCount] = useState(0);

  // Update online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Subscribe to sync events
  useEffect(() => {
    const unsubscribe = offlineSyncManager.on((event) => {
      setSyncStatus(event);
      
      if (event.type === 'sync-start') {
        setIsSyncing(true);
      } else if (event.type === 'sync-complete' || event.type === 'sync-error') {
        setIsSyncing(false);
        // Update queue count after sync
        updateQueueCount();
      }
    });

    return unsubscribe;
  }, []);

  // Listen to service worker messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        const { type, count, success, failed, error } = event.data;
        
        if (type === 'sync-start') {
          setIsSyncing(true);
          setSyncStatus({
            type: 'sync-start',
            message: `Syncing ${count} items...`
          });
        } else if (type === 'sync-complete') {
          setIsSyncing(false);
          setSyncStatus({
            type: 'sync-complete',
            message: `Sync complete: ${success} succeeded, ${failed} failed`
          });
          updateQueueCount();
        } else if (type === 'sync-error') {
          setIsSyncing(false);
          setSyncStatus({
            type: 'sync-error',
            message: 'Sync failed',
            error: new Error(error)
          });
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  // Update queue count
  const updateQueueCount = async () => {
    const count = await syncQueueOperations.getCount();
    setQueueCount(count);
  };

  // Initial queue count
  useEffect(() => {
    updateQueueCount();
  }, []);

  // Trigger manual sync
  const triggerSync = () => {
    offlineSyncManager.syncNow();
  };

  // Clear sync status
  const clearSyncStatus = () => {
    setSyncStatus(null);
  };

  return {
    isOnline,
    isSyncing,
    syncStatus,
    queueCount,
    triggerSync,
    clearSyncStatus
  };
}
