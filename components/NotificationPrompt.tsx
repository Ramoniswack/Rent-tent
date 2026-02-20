'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, X } from 'lucide-react';

export default function NotificationPrompt() {
  const { supported, permission, subscribe } = useNotifications();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show prompt if notifications are supported but not granted
    if (supported && permission === 'default') {
      const dismissed = localStorage.getItem('notificationPromptDismissed');
      if (!dismissed) {
        setTimeout(() => setShow(true), 5000); // Show after 5 seconds
      }
    }
  }, [supported, permission]);

  const handleEnable = async () => {
    try {
      await subscribe();
      setShow(false);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="bg-[#059467]/10 p-2 rounded-lg">
          <Bell className="w-6 h-6 text-[#059467]" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">
            Enable Notifications
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Get notified about new messages, bookings, and trip updates
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              className="px-4 py-2 bg-[#059467] text-white text-sm font-medium rounded-lg hover:bg-[#047854] transition-colors"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
