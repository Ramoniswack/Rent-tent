'use client';

import { useOfflineSync } from '../hooks/useOfflineSync';
import { WifiOff, Wifi, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
  const { isOnline, isSyncing, syncStatus, queueCount, triggerSync, clearSyncStatus } = useOfflineSync();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');

  // Show toast when sync status changes
  useEffect(() => {
    if (syncStatus) {
      if (syncStatus.type === 'sync-start') {
        setToastMessage(syncStatus.message || 'Syncing...');
        setToastType('info');
        setShowToast(true);
      } else if (syncStatus.type === 'sync-complete') {
        setToastMessage(syncStatus.message || 'Sync complete');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          clearSyncStatus();
        }, 3000);
      } else if (syncStatus.type === 'sync-error') {
        setToastMessage(syncStatus.message || 'Sync failed');
        setToastType('error');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          clearSyncStatus();
        }, 5000);
      } else if (syncStatus.type === 'sync-progress') {
        setToastMessage(syncStatus.message || 'Syncing...');
        setToastType('info');
        setShowToast(true);
      }
    }
  }, [syncStatus]);

  // Show toast when going offline/online
  useEffect(() => {
    if (!isOnline) {
      setToastMessage('You are offline. Changes will be synced when online.');
      setToastType('info');
      setShowToast(true);
    } else if (queueCount > 0) {
      setToastMessage(`Back online. Syncing ${queueCount} pending changes...`);
      setToastType('info');
      setShowToast(true);
    }
  }, [isOnline]);

  return (
    <>
      {/* Offline Status Bar */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>You are offline</span>
            {queueCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {queueCount} pending
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sync Toast */}
      {showToast && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
            toastType === 'success' 
              ? 'bg-green-500 border-green-600 text-white'
              : toastType === 'error'
              ? 'bg-red-500 border-red-600 text-white'
              : 'bg-[#059467] border-[#047854] text-white'
          }`}>
            {isSyncing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : toastType === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : toastType === 'error' ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <Wifi className="w-5 h-5" />
            )}
            
            <span className="text-sm font-medium">{toastMessage}</span>
            
            {syncStatus?.progress && (
              <span className="text-xs opacity-90">
                ({syncStatus.progress.current}/{syncStatus.progress.total})
              </span>
            )}
            
            <button
              onClick={() => setShowToast(false)}
              className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sync Button (when there are pending items) */}
      {isOnline && queueCount > 0 && !isSyncing && (
        <button
          onClick={triggerSync}
          className="fixed bottom-24 md:bottom-12 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-[#059467] hover:bg-[#047854] text-white rounded-full shadow-2xl transition-all hover:scale-105"
        >
          <Clock className="w-5 h-5" />
          <span className="text-sm font-medium">Sync {queueCount} pending</span>
        </button>
      )}
    </>
  );
}
