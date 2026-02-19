'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
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

export default function RentalDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rentals' | 'requests'>('rentals');
  const [filterStatus, setFilterStatus] = useState<'all' | BookingStatus>('all');
  const [myRentals, setMyRentals] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
    const confirmMessage = status === 'confirmed' 
      ? 'Accept this booking request?' 
      : 'Decline this booking request?';
    
    if (!confirm(confirmMessage)) return;

    try {
      await bookingAPI.updateStatus(bookingId, status);
      await fetchBookings();
      alert(`Booking ${status === 'confirmed' ? 'accepted' : 'declined'} successfully!`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update booking status');
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
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#059467] animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0d1c17] dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-[#0d1c17]/60 dark:text-white/60 text-sm md:text-base">
                Manage your gear rentals and requests in one place.
              </p>
              {error && (
                <p className="text-red-500 text-sm mt-2">
                  {error} - <button onClick={handleRefresh} className="underline">Try again</button>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="md:self-end px-4 py-2 bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#059467] rounded-full text-sm font-medium hover:bg-[#f8fcfb] dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Loader2 className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              {/* Segment Controller */}
              <div className="bg-[#e7f4f0] dark:bg-white/10 p-1.5 rounded-full flex relative">
                <button
                  onClick={() => setActiveTab('rentals')}
                  className={`relative z-10 flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 text-center min-w-[140px] ${
                    activeTab === 'rentals'
                      ? 'bg-white dark:bg-[#059467] text-[#059467] dark:text-white shadow-sm'
                      : 'text-[#0d1c17]/70 dark:text-white/70 hover:text-[#0d1c17] dark:hover:text-white'
                  }`}
                >
                  My Rentals
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`relative z-10 flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 min-w-[160px] ${
                    activeTab === 'requests'
                      ? 'bg-white dark:bg-[#059467] text-[#059467] dark:text-white shadow-sm'
                      : 'text-[#0d1c17]/70 dark:text-white/70 hover:text-[#0d1c17] dark:hover:text-white'
                  }`}
                >
                  My Gear Requests
                  {myRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="size-2 bg-[#ef4444] rounded-full animate-pulse"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
                filterStatus === 'all'
                  ? 'bg-[#0d1c17] dark:bg-[#059467] text-white'
                  : 'bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                filterStatus === 'pending'
                  ? 'bg-[#0d1c17] dark:bg-[#059467] text-white'
                  : 'bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-white/10'
              }`}
            >
              Pending
              {pendingCount > 0 && (
                <span className="bg-[#f59e0b] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'confirmed'
                  ? 'bg-[#0d1c17] dark:bg-[#059467] text-white'
                  : 'bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-white/10'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-[#0d1c17] dark:bg-[#059467] text-white'
                  : 'bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17]/70 dark:text-white/70 hover:bg-[#f8fcfb] dark:hover:bg-white/10'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Booking Cards Container */}
          <div className="flex flex-col gap-5">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-white/5 rounded-[24px] border border-[#e7f4f0] dark:border-white/5">
                <p className="text-[#0d1c17]/60 dark:text-white/60 font-medium mb-2">
                  No {filterStatus !== 'all' ? filterStatus : ''} bookings found
                </p>
                <p className="text-sm text-[#0d1c17]/40 dark:text-white/40">
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
                
                return (
                  <article
                    key={booking._id}
                    className={`bg-white dark:bg-white/5 rounded-[24px] p-5 shadow-sm border border-[#e7f4f0]/60 dark:border-white/5 hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center group ${
                      booking.status === 'completed' ? 'opacity-80 hover:opacity-100' : ''
                    }`}
                  >
                    {/* Thumbnail */}
                    <div
                      className={`shrink-0 relative w-full md:w-[120px] aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 cursor-pointer ${
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
                    <div className="flex-1 min-w-0 flex flex-col gap-2 w-full">
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
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-2 pl-0 md:pl-4 md:border-l md:border-[#f0f7f5] dark:md:border-white/10 min-w-[160px]">
                      <div className={`text-right ${booking.status === 'cancelled' ? 'opacity-50' : ''}`}>
                        <p className="text-xs text-[#0d1c17]/50 dark:text-white/50 font-medium mb-0.5 uppercase tracking-wide">
                          {booking.status === 'completed' ? 'Earned' : booking.status === 'cancelled' ? 'Potential' : isOwner ? 'Total Earnings' : 'Total Cost'}
                        </p>
                        <p className={`text-[20px] font-bold text-[#0d1c17] dark:text-white ${booking.status === 'cancelled' ? 'line-through decoration-[#ef4444]' : ''}`}>
                          ${booking.totalPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        {booking.status === 'pending' && isOwner && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              className="flex-1 md:flex-none h-10 px-4 rounded-full border border-gray-200 dark:border-gray-600 text-[#0d1c17]/70 dark:text-white/70 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              className="flex-1 md:flex-none h-10 px-5 rounded-full bg-[#059467] text-white font-bold text-sm hover:bg-[#047854] transition-colors shadow-lg shadow-[#059467]/20 flex items-center justify-center gap-1"
                            >
                              Accept
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => router.push('/messages')}
                            className="flex-1 md:flex-none h-10 px-5 rounded-full bg-white dark:bg-white/5 border border-[#e7f4f0] dark:border-white/10 text-[#0d1c17] dark:text-white font-bold text-sm hover:bg-[#f8fcfb] dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </button>
                        )}
                        {booking.status === 'completed' && !booking.rating && (
                          <button
                            onClick={() => router.push(`/gear/${gear._id}`)}
                            className="flex-1 md:flex-none h-10 px-5 rounded-full bg-[#e7f4f0] dark:bg-[#059467]/20 text-[#059467] dark:text-[#059467] font-bold text-sm hover:bg-[#dbece6] dark:hover:bg-[#059467]/30 transition-colors flex items-center justify-center gap-1"
                          >
                            <Star className="w-4 h-4" />
                            Leave Review
                          </button>
                        )}
                        {booking.status === 'cancelled' && (
                          <button className="flex-1 md:flex-none h-10 px-4 rounded-full text-[#0d1c17]/40 dark:text-white/40 font-medium text-sm hover:text-[#0d1c17] dark:hover:text-white transition-colors flex items-center justify-center">
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Footer Call to action */}
          {filteredBookings.length > 0 && (
            <div className="mt-12 text-center pb-12">
              <p className="text-[#0d1c17]/50 dark:text-white/50 text-sm mb-4">
                You've reached the end of your {activeTab === 'rentals' ? 'rentals' : 'requests'} list.
              </p>
              <button
                onClick={() => router.push('/gear')}
                className="inline-flex items-center gap-2 text-[#059467] font-bold hover:underline cursor-pointer"
              >
                <span>Browse available gear</span>
                <span className="text-sm">→</span>
              </button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
