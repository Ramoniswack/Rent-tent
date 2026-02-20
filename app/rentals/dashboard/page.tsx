'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Toast from '../../../components/Toast';
import ConfirmModal from '../../../components/ConfirmModal';
import BookingDetailsModal from '../../../components/BookingDetailsModal';
import { BookingCardSkeleton } from '../../../components/SkeletonCard';
import { bookingAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import {
  Calendar,
  User,
  MessageCircle,
  Star,
  Check,
  X,
  Loader2
} from 'lucide-react';

type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

function RentalDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Get initial tab from URL or default to 'rentals'
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialTab = (searchParams.get('tab') as 'rentals' | 'requests') || 'rentals';
  
  const [activeTab, setActiveTab] = useState<'rentals' | 'requests'>(initialTab);
  const [filterStatus, setFilterStatus] = useState<'all' | BookingStatus>('all');
  const [myRentals, setMyRentals] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    bookingId: string;
    status: string;
    type: 'confirm' | 'decline';
  } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [user]);

  // Update URL when tab changes
  const handleTabChange = (tab: 'rentals' | 'requests') => {
    setActiveTab(tab);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch gear bookings (as owner)
      try {
        const rentalsData = await bookingAPI.getGearBookings();
        setMyRentals(rentalsData || []);
      } catch (err) {
        console.error('Error fetching rentals:', err);
        setMyRentals([]);
      }

      // Fetch my bookings (as renter)
      try {
        const requestsData = await bookingAPI.getMyBookings();
        setMyRequests(requestsData || []);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setMyRequests([]);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
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

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await bookingAPI.updateStatus(bookingId, status);
      await fetchBookings();
      setToast({ 
        message: `Booking ${status === 'confirmed' ? 'accepted' : 'declined'} successfully!`, 
        type: 'success' 
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      setToast({ 
        message: error.message || 'Failed to update booking status', 
        type: 'error' 
      });
    } finally {
      setConfirmModal(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        bg: 'bg-[#fef3c7]',
        text: 'text-[#f59e0b]',
        label: 'Pending'
      },
      confirmed: {
        bg: 'bg-[#d1fae5]',
        text: 'text-[#059467]',
        label: 'Accepted'
      },
      active: {
        bg: 'bg-[#dbeafe]',
        text: 'text-[#3b82f6]',
        label: 'Active'
      },
      completed: {
        bg: 'bg-[#f1f5f9]',
        text: 'text-[#64748b]',
        label: 'Completed'
      },
      cancelled: {
        bg: 'bg-[#fee2e2]',
        text: 'text-[#ef4444]',
        label: 'Declined'
      }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const formatDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${days} Days)`;
  };

  const currentBookings = activeTab === 'rentals' ? myRentals : myRequests;
  const filteredBookings = filterStatus === 'all' 
    ? currentBookings 
    : currentBookings.filter(b => b.status === filterStatus);

  const pendingCount = currentBookings.filter(b => b.status === 'pending').length;

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="space-y-2 animate-pulse">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64" />
              </div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-full w-32 animate-pulse" />
            </div>
            <div className="flex flex-col gap-5">
              {[1, 2, 3].map((i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          </main>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.status === 'confirmed' ? 'Accept Booking Request?' : 'Decline Booking Request?'}
          message={confirmModal.status === 'confirmed' 
            ? 'Are you sure you want to accept this booking request? The renter will be notified.'
            : 'Are you sure you want to decline this booking request? This action cannot be undone.'
          }
          confirmText={confirmModal.status === 'confirmed' ? 'Accept' : 'Decline'}
          cancelText="Cancel"
          type={confirmModal.type}
          onConfirm={() => handleStatusUpdate(confirmModal.bookingId, confirmModal.status)}
          onCancel={() => setConfirmModal(null)}
        />
      )}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOwner={activeTab === 'rentals'}
          onClose={() => setSelectedBooking(null)}
        />
      )}
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          {/* Header Section */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[#0d1c17] dark:text-white mb-1">
                  Dashboard
                </h1>
                <p className="text-[#0d1c17]/60 dark:text-white/60 text-xs md:text-base hidden md:block">
                  Manage your gear rentals and requests in one place.
                </p>
              </div>
              {/* Refresh Button - Desktop */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="hidden md:flex px-4 py-2 bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#059467] rounded-full text-sm font-medium hover:bg-[#f8fcfb] dark:hover:bg-white/10 transition-colors items-center gap-2"
              >
                <Loader2 className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm">
                {error} - <button onClick={handleRefresh} className="underline">Try again</button>
              </p>
            )}

            {/* Segment Controller - Mobile Optimized */}
            <div className="bg-[#e7f4f0] dark:bg-white/10 p-1 rounded-full flex relative">
              <button
                onClick={() => handleTabChange('rentals')}
                className={`relative z-10 flex-1 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 text-center ${
                  activeTab === 'rentals'
                    ? 'bg-white dark:bg-[#059467] text-[#059467] dark:text-white shadow-sm'
                    : 'text-[#0d1c17]/70 dark:text-white/70 hover:text-[#0d1c17] dark:hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">My Rentals</span>
                <span className="sm:hidden">Rentals</span>
              </button>
              <button
                onClick={() => handleTabChange('requests')}
                className={`relative z-10 flex-1 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                  activeTab === 'requests'
                    ? 'bg-white dark:bg-[#059467] text-[#059467] dark:text-white shadow-sm'
                    : 'text-[#0d1c17]/70 dark:text-white/70 hover:text-[#0d1c17] dark:hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">My Gear Requests</span>
                <span className="sm:hidden">Requests</span>
                {myRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="size-1.5 sm:size-2 bg-[#ef4444] rounded-full animate-pulse"></span>
                )}
              </button>
            </div>

            {/* Refresh Button - Mobile */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="md:hidden w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#059467] rounded-full text-sm font-medium hover:bg-[#f8fcfb] dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Loader2 className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Filters - Mobile Optimized */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-transform active:scale-95 ${
                filterStatus === 'all'
                  ? 'bg-[#0d1c17] dark:bg-[#059467] text-white'
                  : 'bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 ${
                filterStatus === 'pending'
                  ? 'bg-[#0d1c17] dark:bg-[#059467] text-white'
                  : 'bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-white/10'
              }`}
            >
              Pending
              {pendingCount > 0 && (
                <span className="bg-[#f59e0b] text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full min-w-[16px] sm:min-w-[18px] text-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                filterStatus === 'confirmed'
                  ? 'bg-[#0d1c17] dark:bg-[#059467] text-white'
                  : 'bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-white/10'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-[#0d1c17] dark:bg-[#059467] text-white'
                  : 'bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-white/10'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Booking Cards Container */}
          <div className="flex flex-col gap-4 pb-20 md:pb-0">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 md:py-16 bg-white dark:bg-white/5 rounded-2xl md:rounded-[24px] border border-[#e7f4f0] dark:border-white/5">
                <p className="text-[#0d1c17]/60 dark:text-white/60 font-medium mb-2 text-sm md:text-base">
                  No {filterStatus !== 'all' ? filterStatus : ''} bookings found
                </p>
                <p className="text-xs md:text-sm text-[#0d1c17]/40 dark:text-white/40 px-4">
                  {activeTab === 'rentals' 
                    ? 'Start listing your gear to receive rental requests'
                    : 'Browse available gear to make your first rental request'}
                </p>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const badge = getStatusBadge(booking.status);
                const isOwner = activeTab === 'rentals';
                const otherUser = isOwner ? booking.renter : booking.owner;
                const gear = booking.gear;
                
                // Skip if gear is null or undefined
                if (!gear) {
                  return null;
                }
                
                return (
                  <article
                    key={booking._id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`bg-white dark:bg-white/5 rounded-2xl md:rounded-[24px] p-4 md:p-5 shadow-sm border border-[#e7f4f0]/60 dark:border-white/5 hover:shadow-md transition-shadow duration-300 flex flex-col gap-4 group cursor-pointer ${
                      booking.status === 'completed' ? 'opacity-80 hover:opacity-100' : ''
                    }`}
                  >
                    {/* Mobile Layout */}
                    <div className="flex gap-3 md:hidden">
                      {/* Thumbnail */}
                      <div
                        className={`shrink-0 relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 cursor-pointer ${
                          booking.status === 'completed' ? 'grayscale-[0.5] group-hover:grayscale-0' : ''
                        } ${booking.status === 'cancelled' ? 'grayscale' : ''}`}
                        onClick={() => router.push(`/gear/${gear._id}`)}
                      >
                        <img
                          alt={gear.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={gear.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'}
                        />
                        {booking.status === 'cancelled' && (
                          <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[1px]"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} text-[10px] font-bold uppercase tracking-wider`}>
                            {booking.status === 'completed' && <Check className="w-2.5 h-2.5" />}
                            {booking.status === 'cancelled' && <X className="w-2.5 h-2.5" />}
                            {booking.status === 'pending' && <span className="size-1 rounded-full bg-current"></span>}
                            {booking.status === 'confirmed' && <span className="size-1 rounded-full bg-current"></span>}
                            {badge.label}
                          </span>
                        </div>
                        <h3
                          className={`text-sm font-bold leading-tight line-clamp-1 cursor-pointer hover:text-[#059467] transition-colors mb-1 ${
                            booking.status === 'cancelled' ? 'text-[#0d1c17]/80 dark:text-white/80' : 'text-[#0d1c17] dark:text-white'
                          }`}
                          onClick={() => router.push(`/gear/${gear._id}`)}
                        >
                          {gear.title}
                        </h3>
                        <div className={`text-right ${booking.status === 'cancelled' ? 'opacity-50' : ''}`}>
                          <p className="text-[10px] text-[#0d1c17]/50 dark:text-white/50 font-medium uppercase tracking-wide">
                            {booking.status === 'completed' ? 'Earned' : booking.status === 'cancelled' ? 'Potential' : isOwner ? 'Earnings' : 'Cost'}
                          </p>
                          <p className={`text-base font-bold text-[#0d1c17] dark:text-white ${booking.status === 'cancelled' ? 'line-through decoration-[#ef4444]' : ''}`}>
                            ${booking.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Details */}
                    <div className="flex flex-col gap-2 text-xs text-[#0d1c17]/60 dark:text-white/60 md:hidden">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(booking.startDate, booking.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>
                          {isOwner ? 'From: ' : 'Renter: '}
                          <span className="text-[#0d1c17] dark:text-white font-medium">
                            {otherUser?.name || 'Unknown'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex gap-2 md:hidden" onClick={(e) => e.stopPropagation()}>
                      {booking.status === 'pending' && isOwner && (
                        <>
                          <button
                            onClick={() => setConfirmModal({ bookingId: booking._id, status: 'cancelled', type: 'decline' })}
                            className="flex-1 h-9 px-3 rounded-full border border-gray-200 dark:border-gray-600 text-[#0d1c17]/70 dark:text-white/70 font-bold text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => setConfirmModal({ bookingId: booking._id, status: 'confirmed', type: 'confirm' })}
                            className="flex-1 h-9 px-4 rounded-full bg-[#059467] text-white font-bold text-xs hover:bg-[#047854] transition-colors shadow-lg shadow-[#059467]/20"
                          >
                            Accept
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => router.push('/messages')}
                          className="flex-1 h-9 px-4 rounded-full bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17] dark:text-white font-bold text-xs hover:bg-[#f8fcfb] dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Message
                        </button>
                      )}
                      {booking.status === 'completed' && !booking.rating && (
                        <button
                          onClick={() => router.push(`/gear/${gear._id}`)}
                          className="flex-1 h-9 px-4 rounded-full bg-[#e7f4f0] dark:bg-[#059467]/20 text-[#059467] dark:text-[#059467] font-bold text-xs hover:bg-[#dbece6] dark:hover:bg-[#059467]/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Review
                        </button>
                      )}
                      {booking.status === 'cancelled' && (
                        <button className="flex-1 h-9 px-3 rounded-full text-[#0d1c17]/40 dark:text-white/40 font-medium text-xs hover:text-[#0d1c17] dark:hover:text-white transition-colors">
                          Archive
                        </button>
                      )}
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex gap-6 items-center">
                      {/* Thumbnail */}
                      <div
                        className={`shrink-0 relative w-[120px] aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 cursor-pointer ${
                          booking.status === 'completed' ? 'grayscale-[0.5] group-hover:grayscale-0' : ''
                        } ${booking.status === 'cancelled' ? 'grayscale' : ''}`}
                        onClick={() => router.push(`/gear/${gear._id}`)}
                      >
                        <img
                          alt={gear.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={gear.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'}
                        />
                        {booking.status === 'cancelled' && (
                          <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[1px]"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-xs font-bold uppercase tracking-wider`}>
                            {booking.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                            {booking.status === 'cancelled' && <X className="w-3.5 h-3.5" />}
                            {booking.status === 'pending' && <span className="size-1.5 rounded-full bg-current"></span>}
                            {booking.status === 'confirmed' && <span className="size-1.5 rounded-full bg-current"></span>}
                            {badge.label}
                          </span>
                          <span className="text-xs text-[#0d1c17]/50 dark:text-white/50 font-medium">
                            Request #{booking._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <h3
                          className={`text-[18px] font-bold leading-tight truncate cursor-pointer hover:text-[#059467] transition-colors ${
                            booking.status === 'cancelled' ? 'text-[#0d1c17]/80 dark:text-white/80' : 'text-[#0d1c17] dark:text-white'
                          }`}
                          onClick={() => router.push(`/gear/${gear._id}`)}
                        >
                          {gear.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-sm text-[#0d1c17]/60 dark:text-white/60 mt-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.startDate, booking.endDate)}</span>
                          </div>
                          <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            <span>
                              {isOwner ? 'Request from: ' : 'Renter: '}
                              <span className="text-[#0d1c17] dark:text-white font-medium">
                                {otherUser?.name || 'Unknown'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Side */}
                      <div className="flex flex-col items-end gap-2 pl-4 border-l border-[#f0f7f5] dark:border-white/10 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                        <div className={`text-right ${booking.status === 'cancelled' ? 'opacity-50' : ''}`}>
                          <p className="text-xs text-[#0d1c17]/50 dark:text-white/50 font-medium mb-0.5 uppercase tracking-wide">
                            {booking.status === 'completed' ? 'Earned' : booking.status === 'cancelled' ? 'Potential' : isOwner ? 'Total Earnings' : 'Total Cost'}
                          </p>
                          <p className={`text-[20px] font-bold text-[#0d1c17] dark:text-white ${booking.status === 'cancelled' ? 'line-through decoration-[#ef4444]' : ''}`}>
                            ${booking.totalPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && isOwner && (
                            <>
                              <button
                                onClick={() => setConfirmModal({ bookingId: booking._id, status: 'cancelled', type: 'decline' })}
                                className="h-10 px-4 rounded-full border border-gray-200 dark:border-gray-600 text-[#0d1c17]/70 dark:text-white/70 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => setConfirmModal({ bookingId: booking._id, status: 'confirmed', type: 'confirm' })}
                                className="h-10 px-5 rounded-full bg-[#059467] text-white font-bold text-sm hover:bg-[#047854] transition-colors shadow-lg shadow-[#059467]/20"
                              >
                                Accept
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => router.push('/messages')}
                              className="h-10 px-5 rounded-full bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17] dark:text-white font-bold text-sm hover:bg-[#f8fcfb] dark:hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Message
                            </button>
                          )}
                          {booking.status === 'completed' && !booking.rating && (
                            <button
                              onClick={() => router.push(`/gear/${gear._id}`)}
                              className="h-10 px-5 rounded-full bg-[#e7f4f0] dark:bg-[#059467]/20 text-[#059467] dark:text-[#059467] font-bold text-sm hover:bg-[#dbece6] dark:hover:bg-[#059467]/30 transition-colors flex items-center gap-1"
                            >
                              <Star className="w-4 h-4" />
                              Leave Review
                            </button>
                          )}
                          {booking.status === 'cancelled' && (
                            <button className="h-10 px-4 rounded-full text-[#0d1c17]/40 dark:text-white/40 font-medium text-sm hover:text-[#0d1c17] dark:hover:text-white transition-colors">
                              Archive
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Footer Call to action */}
          {filteredBookings.length > 0 && (
            <div className="mt-8 md:mt-12 text-center pb-20 md:pb-12">
              <p className="text-[#0d1c17]/50 dark:text-white/50 text-xs md:text-sm mb-3 md:mb-4">
                You've reached the end of your {activeTab === 'rentals' ? 'rentals' : 'requests'} list.
              </p>
              <button
                onClick={() => router.push('/gear')}
                className="inline-flex items-center gap-2 text-[#059467] font-bold hover:underline cursor-pointer text-sm md:text-base"
              >
                <span>Browse available gear</span>
                <span className="text-sm">→</span>
              </button>
            </div>
          )}
        </main>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
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
