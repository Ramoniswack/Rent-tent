'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Toast from '../../../components/Toast';
import { BookingCardSkeleton } from '../../../components/SkeletonCard';
import { bookingAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { formatNPR } from '../../../lib/currency';
import {
  Calendar,
  User,
  MessageCircle,
  Star,
  Check,
  X,
  Loader2,
  Inbox,
  ArrowRight
} from 'lucide-react';

type BookingStatus = 'pending' | 'confirmed' | 'picked_up' | 'in_use' | 'returned' | 'inspected' | 'completed' | 'cancelled';

function RentalDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [filterStatus, setFilterStatus] = useState<'all' | BookingStatus>('all');
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      try {
        const requestsData = await bookingAPI.getMyBookings();
        setMyRequests(requestsData || []);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setMyRequests([]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const displayStatus = status === 'active' ? 'in_use' : status;
    const badges = {
      pending: { bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', label: 'Pending' },
      confirmed: { bg: 'bg-emerald-100 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', label: 'Confirmed' },
      picked_up: { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', label: 'Picked Up' },
      in_use: { bg: 'bg-indigo-100 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400', label: 'In Use' },
      returned: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', label: 'Returned' },
      inspected: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/10', text: 'text-fuchsia-700 dark:text-fuchsia-400', label: 'Inspected' },
      completed: { bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-700 dark:text-slate-400', label: 'Completed' },
      cancelled: { bg: 'bg-rose-100 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', label: 'Cancelled' }
    };
    return badges[displayStatus as keyof typeof badges] || badges.pending;
  };

  const formatDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${days} Days)`;
  };

  const currentBookings = myRequests;
  const filteredBookings = filterStatus === 'all' 
    ? currentBookings 
    : currentBookings.filter(b => b.status === filterStatus);

  const pendingCount = currentBookings.filter(b => b.status === 'pending').length;

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="space-y-2 animate-pulse">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-48" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-64" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
            </div>
          </main>
        </div>
        <div className="hidden md:block"><Footer /></div>
      </>
    );
  }

  return (
    <>
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                My Rental Requests
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Track your gear rental requests and bookings.
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full md:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Loader2 className={`w-4 h-4 text-slate-900 dark:text-[#059467] ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-rose-50 dark:bg-rose-50/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={handleRefresh} className="font-bold hover:underline">Retry</button>
            </div>
          )}

          {/* Scrollable Filters */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 mb-6 snap-x">
            {['all', 'pending', 'confirmed', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  filterStatus === status
                    ? 'bg-[#059467] text-white shadow-md shadow-[#059467]/20'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="capitalize">{status === 'confirmed' ? 'Accepted' : status}</span>
                {status === 'pending' && pendingCount > 0 && filterStatus !== 'pending' && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Unified Booking Cards Container */}
          <div className="flex flex-col gap-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No {filterStatus !== 'all' ? filterStatus : ''} rental requests
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
                  Browse available gear and request to rent it for your next adventure.
                </p>
                <button
                  onClick={() => router.push('/gear')}
                  className="px-6 py-2.5 bg-[#059467] text-white rounded-xl text-sm font-bold shadow-md shadow-[#059467]/20 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
                >
                  Browse Gear <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const badge = getStatusBadge(booking.status);
                const isOwner = false; // Always false since this is requests page
                const otherUser = booking.owner; // Always show the owner since user is the renter
                const gear = booking.gear;
                
                if (!gear) return null;
                
                return (
                  <article
                    key={booking._id}
                    onClick={() => router.push(`/bookings/${booking._id}`)}
                    className={`bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row gap-4 md:gap-6 ${
                      booking.status === 'cancelled' ? 'opacity-75 grayscale-[0.5]' : ''
                    }`}
                  >
                    {/* Top/Left: Image & Core Info */}
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className="shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                        <img
                          alt={gear.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={gear.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'}
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text} text-[10px] font-bold uppercase tracking-wider`}>
                              {booking.status === 'completed' && <Check className="w-3 h-3" />}
                              {booking.status === 'cancelled' && <X className="w-3 h-3" />}
                              {booking.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                              {badge.label}
                            </span>
                            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
                              #{booking._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate mb-2 group-hover:text-[#059467] transition-colors">
                            {gear.title}
                          </h3>
                        </div>

                        <div className="flex flex-col gap-1 md:gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="truncate">{formatDate(booking.startDate, booking.endDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span className="truncate">
                              {isOwner ? 'From: ' : 'Owner: '}
                              <span className="text-slate-700 dark:text-slate-300">{otherUser?.name || 'Unknown User'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom/Right: Price & Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700/50 md:pl-6 md:border-l min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                      
                      {/* Price Block */}
                      <div className="text-left md:text-right">
                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                          {booking.status === 'completed' ? 'Earned' : isOwner ? 'Est. Earnings' : 'Total Cost'}
                        </p>
                        <p className={`text-lg md:text-xl font-black text-slate-900 dark:text-white ${booking.status === 'cancelled' ? 'line-through decoration-rose-500' : ''}`}>
                          {formatNPR(booking.totalPrice)}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 w-full md:w-auto">
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => router.push('/messages')}
                            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Message
                          </button>
                        )}
                        {booking.status === 'completed' && !booking.rating && (
                          <button
                            onClick={() => router.push(`/gear/${gear._id}`)}
                            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-[#059467] font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5" /> Review
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}

export default function ProtectedRentalDashboard() {
  return (
    <ProtectedRoute>
      <RentalDashboard />
    </ProtectedRoute>
  );
}