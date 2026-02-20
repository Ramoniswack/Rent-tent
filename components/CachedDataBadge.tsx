'use client';

import { Database, RefreshCw } from 'lucide-react';

interface CachedDataBadgeProps {
  data: any;
  onRefresh?: () => void;
}

export default function CachedDataBadge({ data, onRefresh }: CachedDataBadgeProps) {
  if (!data || (!data._fromCache && !data._offline)) {
    return null;
  }

  const isStale = data._stale;
  const isOffline = data._offline;
  const timestamp = data._cacheTimestamp;

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
      isOffline 
        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
        : isStale
        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
    }`}>
      <Database className="w-3.5 h-3.5" />
      <span>
        {isOffline 
          ? 'Offline - Cached version'
          : isStale
          ? 'Stale cache - Updating...'
          : 'Cached version'}
        {timestamp && ` (${formatTime(timestamp)})`}
      </span>
      {onRefresh && !isOffline && (
        <button
          onClick={onRefresh}
          className="ml-1 p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
