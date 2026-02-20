'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { notificationAPI } from '../services/api';
import { useSocket } from '../hooks/useSocket';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  sender?: {
    _id: string;
    name: string;
    profilePicture?: string;
    username?: string;
  };
}

export default function NotificationCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Get current user
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id || user._id);
      }
    }
  }, []);

  const { socket } = useSocket(currentUserId);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getNotifications(1, 20, false);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (currentUserId) {
      fetchNotifications();
    }
  }, [currentUserId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // New notification received
    socket.on('notification:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png'
        });
      }
    });

    // Unread count update
    socket.on('notification:count', (count: number) => {
      setUnreadCount(count);
    });

    return () => {
      socket.off('notification:new');
      socket.off('notification:count');
    };
  }, [socket]);

  // Mark as read
  const handleMarkAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon color
  const getIconColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-500';
      case 'match': return 'text-pink-500';
      case 'like': return 'text-red-500';
      case 'booking_request': return 'text-purple-500';
      case 'booking_accepted': return 'text-green-500';
      case 'booking_rejected': return 'text-orange-500';
      case 'review': return 'text-yellow-500';
      case 'trip_update': return 'text-cyan-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-[#132a24] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-sm text-[#059467] hover:text-[#047854] transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#059467] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Bell className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-center">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                      notification.read
                        ? 'bg-white dark:bg-[#132a24] hover:bg-slate-50 dark:hover:bg-[#1a2c26]'
                        : 'bg-[#059467]/5 dark:bg-[#059467]/10 hover:bg-[#059467]/10 dark:hover:bg-[#059467]/15'
                    }`}
                  >
                    {/* Sender Avatar */}
                    {notification.sender?.profilePicture ? (
                      <img
                        src={notification.sender.profilePicture}
                        alt={notification.sender.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)} bg-current/10`}>
                        <Bell className="w-5 h-5" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0d1c17] dark:text-white mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification._id, e)}
                          className="p-1.5 text-[#059467] hover:bg-[#059467]/10 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(notification._id, e)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    router.push('/notifications');
                    setIsOpen(false);
                  }}
                  className="w-full text-sm text-[#059467] hover:text-[#047854] font-medium transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
