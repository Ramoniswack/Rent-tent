'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { notificationAPI } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Mail,
  Heart,
  Users,
  Package,
  Star,
  MapPin,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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

function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const limit = 20;

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
      const data = await notificationAPI.getNotifications(currentPage, limit, showUnreadOnly);
      
      let filteredNotifications = data.notifications || [];
      
      // Apply type filter
      if (filterType !== 'all') {
        filteredNotifications = filteredNotifications.filter((n: Notification) => n.type === filterType);
      }
      
      setNotifications(filteredNotifications);
      setTotalPages(data.pagination?.pages || 1);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    if (currentUserId) {
      fetchNotifications();
    }
  }, [currentUserId, currentPage, showUnreadOnly, filterType]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('notification:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socket.on('notification:count', (count: number) => {
      setUnreadCount(count);
    });

    return () => {
      socket.off('notification:new');
      socket.off('notification:count');
    };
  }, [socket]);

  // Mark as read
  const handleMarkAsRead = async (notificationId: string) => {
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
  const handleDelete = async (notificationId: string) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Delete all read
  const handleDeleteAllRead = async () => {
    try {
      await notificationAPI.deleteAllRead();
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n._id)));
    }
  };

  const handleBulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => 
      notificationAPI.markAsRead(id)
    );
    
    try {
      await Promise.all(promises);
      setNotifications(prev =>
        prev.map(n => selectedNotifications.has(n._id) ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - selectedNotifications.size));
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error bulk marking as read:', error);
    }
  };

  const handleBulkDelete = async () => {
    const promises = Array.from(selectedNotifications).map(id => 
      notificationAPI.deleteNotification(id)
    );
    
    try {
      await Promise.all(promises);
      setNotifications(prev => prev.filter(n => !selectedNotifications.has(n._id)));
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error bulk deleting:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    
    if (notification.link) {
      router.push(notification.link);
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <Mail className="w-5 h-5 text-blue-500" />;
      case 'match': return <Users className="w-5 h-5 text-pink-500" />;
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'booking_request':
      case 'booking_accepted':
      case 'booking_rejected':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'review': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'trip_update': return <MapPin className="w-5 h-5 text-cyan-500" />;
      case 'system': return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const notificationTypes = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'message', label: 'Messages', icon: Mail },
    { value: 'match', label: 'Matches', icon: Users },
    { value: 'like', label: 'Likes', icon: Heart },
    { value: 'booking_request', label: 'Bookings', icon: Package },
    { value: 'review', label: 'Reviews', icon: Star },
    { value: 'trip_update', label: 'Trips', icon: MapPin },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1a16] flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-20 md:pb-8">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d1c17] dark:text-white mb-1 sm:mb-2">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Stay updated with your latest activities
            </p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white dark:bg-[#132a24] rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-3 sm:p-4 mb-4 sm:mb-6">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {notificationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setFilterType(type.value)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                      filterType === type.value
                        ? 'bg-[#059467] text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  showUnreadOnly
                    ? 'bg-[#059467] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Unread</span> {unreadCount > 0 && `(${unreadCount})`}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-[#059467] hover:bg-[#059467]/10 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Mark All Read</span>
                  <span className="sm:hidden">All Read</span>
                </button>
              )}

              <button
                onClick={handleDeleteAllRead}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Delete Read</span>
                <span className="sm:hidden">Del Read</span>
              </button>

              {selectedNotifications.size > 0 && (
                <>
                  <button
                    onClick={handleBulkMarkAsRead}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-[#059467] hover:bg-[#059467]/10 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Mark Selected ({selectedNotifications.size})</span>
                    <span className="sm:hidden">Read ({selectedNotifications.size})</span>
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Delete Selected ({selectedNotifications.size})</span>
                    <span className="sm:hidden">Del ({selectedNotifications.size})</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white dark:bg-[#132a24] rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 sm:py-20">
                <Loader2 className="w-8 h-8 text-slate-900 dark:text-[#059467] animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
                <Bell className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No notifications
                </h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 text-center">
                  {showUnreadOnly ? 'You have no unread notifications' : 'You have no notifications yet'}
                </p>
              </div>
            ) : (
              <>
                {/* Select All */}
                {notifications.length > 0 && (
                  <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.size === notifications.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-[#059467] border-slate-300 rounded focus:ring-[#059467]"
                      />
                      <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                        Select All
                      </span>
                    </label>
                  </div>
                )}

                {/* Notification Items */}
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors ${
                      notification.read
                        ? 'bg-white dark:bg-[#132a24]'
                        : 'bg-[#059467]/5 dark:bg-[#059467]/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification._id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedNotifications);
                        if (e.target.checked) {
                          newSelected.add(notification._id);
                        } else {
                          newSelected.delete(notification._id);
                        }
                        setSelectedNotifications(newSelected);
                      }}
                      className="mt-1 w-4 h-4 text-[#059467] border-slate-300 rounded focus:ring-[#059467] flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="flex-shrink-0">
                      {notification.sender?.profilePicture ? (
                        <img
                          src={notification.sender.profilePicture}
                          alt={notification.sender.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <h3 className="text-xs sm:text-sm font-semibold text-[#0d1c17] dark:text-white mb-1 line-clamp-2">
                        {notification.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1 sm:mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className="p-1.5 sm:p-2 text-[#059467] hover:bg-[#059467]/10 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                        className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </main>

        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default NotificationsPage;