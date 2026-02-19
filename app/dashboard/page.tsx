'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { tripAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  Calendar, 
  Search, 
  Plus, 
  ArrowRight,
  Loader2,
  Users,
  X
} from 'lucide-react';

interface Trip {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  country: string;
  status: string;
  imageUrl?: string;
  isPublic: boolean;
  collaborators: Array<{
    userId: {
      _id: string;
      name: string;
      profilePicture?: string;
    };
    role: string;
    status: string;
  }>;
  userId: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
}

function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [publicTrips, setPublicTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTrips();
  }, [activeTab]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showFilterMenu && !target.closest('.filter-menu-container')) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'public') {
        // Fetch public trips
        const response = await fetch('http://localhost:5000/api/trips/public', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch public trips');
        const data = await response.json();
        setPublicTrips(data);
      } else {
        // Fetch user's trips
        const data = await tripAPI.getAll();
        setTrips(data);
      }
    } catch (err: any) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    setDeletingId(tripId);
    try {
      await tripAPI.delete(tripId);
      setTrips(trips.filter(t => t._id !== tripId));
    } catch (err: any) {
      console.error('Error deleting trip:', err);
      alert('Failed to delete trip. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      planning: { label: 'Planning', color: 'bg-blue-600' },
      traveling: { label: 'Active', color: 'bg-slate-900/60' },
      completed: { label: 'Completed', color: 'bg-green-600' }
    };
    return statusMap[status] || { label: status, color: 'bg-slate-900/60' };
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const getDefaultImage = (destination: string) => {
    // Default images based on destination keywords
    const images: Record<string, string> = {
      japan: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
      iceland: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&q=80',
      patagonia: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
      'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
      bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
      switzerland: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&q=80',
      nepal: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80'
    };
    
    const key = Object.keys(images).find(k => 
      destination.toLowerCase().includes(k)
    );
    return key ? images[key] : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
  };

  const filterTrips = () => {
    const currentTrips = activeTab === 'public' ? publicTrips : trips;
    let filtered = currentTrips;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(trip =>
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTrips = filterTrips();

  // Calculate stats (only for user's trips)
  const stats = {
    total: trips.length,
    active: trips.filter(t => t.status === 'traveling').length,
    completed: trips.filter(t => t.status === 'completed').length,
    countries: new Set(trips.map(t => t.country)).size,
    totalDays: trips.reduce((sum, trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0)
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        {/* Footer - Hidden on mobile */}
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] pb-20 md:pb-0">
        {/* Main Layout Container */}
        <main className="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-20 py-6 md:py-12">
          {/* Hero Title Section */}
          <div className="mb-6 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-[48px] font-black text-[#0f172a] dark:text-white mb-1 md:mb-2">
                Your Journeys.
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium">
                Manage your itineraries across Nepal
              </p>
            </div>
            <button 
              onClick={() => router.push('/trips/new')}
              className="bg-[#059467] hover:bg-[#047853] text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base shadow-lg shadow-[#059467]/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 w-full md:w-auto"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              Start New Trip
            </button>
          </div>

          {/* Navigation & Search Section */}
          <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-10">
            {/* Active Filters Display */}
            {(statusFilter !== 'all' || searchQuery) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#059467]/10 text-[#059467] rounded-full text-sm font-medium hover:bg-[#059467]/20 transition-colors"
                  >
                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    <X className="w-3 h-3" />
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#059467]/10 text-[#059467] rounded-full text-sm font-medium hover:bg-[#059467]/20 transition-colors"
                  >
                    Search: "{searchQuery}"
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#059467] transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
            
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 md:gap-6">
              {/* Segmented Pill Switcher */}
              <div className="bg-[#059467]/5 p-1.5 rounded-full flex w-full lg:w-auto">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 lg:min-w-[160px] py-2.5 md:py-3 px-4 md:px-6 rounded-full font-bold text-xs md:text-sm transition-all ${
                    activeTab === 'all'
                      ? 'bg-[#059467] text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white'
                  }`}
                >
                  My Trips
                </button>
                <button 
                  onClick={() => setActiveTab('public')}
                  className={`flex-1 lg:min-w-[160px] py-2.5 md:py-3 px-4 md:px-6 rounded-full font-bold text-xs md:text-sm transition-all ${
                    activeTab === 'public'
                      ? 'bg-[#059467] text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white'
                  }`}
                >
                  Public Trips
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex items-center gap-2 md:gap-3 w-full lg:max-w-xl">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-[#059467] transition-colors" />
                  <input
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 bg-white dark:bg-slate-800 border-none rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#059467] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[#0f172a] dark:text-white text-sm md:text-base"
                    placeholder="Search trips..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Filter Dropdown */}
                <div className="relative filter-menu-container flex-shrink-0">
                  <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`bg-white dark:bg-slate-800 p-3 md:p-4 rounded-full shadow-sm ring-1 transition-all flex items-center justify-center ${
                      statusFilter !== 'all' 
                        ? 'ring-[#059467] text-[#059467]' 
                        : 'ring-slate-200 dark:ring-slate-700 text-slate-600 dark:text-slate-400 hover:ring-[#059467]/30'
                    }`}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </button>

                  {/* Filter Menu */}
                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 z-50 overflow-hidden">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Filter by Status
                        </div>
                        <button
                          onClick={() => {
                            setStatusFilter('all');
                            setShowFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                            statusFilter === 'all'
                              ? 'bg-[#059467] text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          All Trips
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter('planning');
                            setShowFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                            statusFilter === 'planning'
                              ? 'bg-[#059467] text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Planning
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter('traveling');
                            setShowFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                            statusFilter === 'traveling'
                              ? 'bg-[#059467] text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Traveling
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter('completed');
                            setShowFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                            statusFilter === 'completed'
                              ? 'bg-[#059467] text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Completed
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Empty State */}
        {filteredTrips.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-4">
              {searchQuery ? 'No trips found matching your search.' : 'No trips yet. Start planning your first adventure!'}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => router.push('/trips/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#059467] text-white rounded-full font-bold hover:bg-[#047854] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Trip
              </button>
            )}
          </div>
        )}

          {/* Trip Card Grid (3-Column Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {filteredTrips.map((trip) => {
              const statusDisplay = getStatusDisplay(trip.status);
              const acceptedCollaborators = trip.collaborators.filter(c => c.status === 'accepted');
              const allMembers = [trip.userId, ...acceptedCollaborators.map(c => c.userId)];
              const displayMembers = allMembers.slice(0, 4);
              const remainingCount = allMembers.length - 4;
              
              return (
                <div 
                  key={trip._id}
                  className="trip-card group bg-white dark:bg-slate-800 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-900/5 dark:shadow-black/20 overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:shadow-[#059467]/10 cursor-pointer"
                  onClick={() => router.push(`/trips/${trip._id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      alt={trip.destination}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={trip.imageUrl || getDefaultImage(trip.destination)}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 md:top-6 left-3 md:left-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 md:px-4 py-1 md:py-1.5 rounded-full flex items-center gap-1.5 md:gap-2">
                      {trip.status === 'traveling' && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      )}
                      {trip.status === 'completed' && (
                        <svg className="w-4 h-4 text-[#059467]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {trip.status === 'planning' && (
                        <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="text-[10px] md:text-xs font-bold text-[#0f172a] dark:text-white">
                        {statusDisplay.label}
                      </span>
                    </div>

                    {/* Public Badge */}
                    {activeTab === 'public' && (
                      <div className="absolute top-3 md:top-6 right-3 md:right-6 bg-blue-500/90 backdrop-blur-md px-3 md:px-4 py-1 md:py-1.5 rounded-full flex items-center gap-1.5 md:gap-2">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Public</span>
                      </div>
                    )}

                    {/* Hover Actions - Only for user's trips */}
                    {activeTab !== 'public' && (
                      <div className="action-overlay opacity-0 absolute inset-0 bg-[#0f172a]/20 backdrop-blur-[2px] md:flex items-center justify-center gap-4 transition-opacity duration-300 hidden">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/trips/${trip._id}`);
                          }}
                          className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-[#0f172a] dark:text-white hover:bg-[#059467] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg"
                        >
                          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTrip(e, trip._id);
                          }}
                          disabled={deletingId === trip._id}
                          className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-red-500 hover:bg-red-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg delay-75 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === trip._id ? (
                            <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                          ) : (
                            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-black text-[#0f172a] dark:text-white mb-3 md:mb-4 group-hover:text-[#059467] transition-colors line-clamp-2">
                      {trip.title}
                    </h3>
                    <div className="flex flex-col gap-1.5 md:gap-2 mb-4 md:mb-8">
                      <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 dark:text-slate-400">
                        <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs md:text-sm font-medium truncate">{trip.destination}, {trip.country}</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium truncate">{formatDateRange(trip.startDate, trip.endDate)}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-[#059467]/5 dark:border-slate-700 pt-4 md:pt-6">
                      <div className="flex -space-x-2 md:-space-x-3">
                        {displayMembers.map((member, idx) => (
                          <div key={`${trip._id}-member-${member._id}-${idx}`} className="relative">
                            {member.profilePicture ? (
                              <img
                                alt={member.name}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-slate-800 ring-1 ring-[#059467]/20 object-cover"
                                src={member.profilePicture}
                              />
                            ) : (
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-slate-800 ring-1 ring-[#059467]/20 bg-gradient-to-br from-[#059467] to-[#047853] flex items-center justify-center">
                                <span className="text-white font-bold text-[10px] md:text-xs">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {idx === 0 && (
                              <div className="absolute -top-1 md:-top-2 -right-0.5 md:-right-1 bg-yellow-400 text-white rounded-full p-0.5 shadow-sm border border-white dark:border-slate-800">
                                <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                        {remainingCount > 0 && (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#059467]/10 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] md:text-[10px] font-bold text-[#059467] dark:text-white ring-1 ring-[#059467]/20">
                            +{remainingCount}
                          </div>
                        )}
                      </div>
                      <div className="text-[#059467] font-bold text-xs md:text-sm flex items-center gap-1 group/link">
                        Details
                        <ArrowRight className="w-4 h-4 md:w-[18px] md:h-[18px] group-hover/link:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
      </main>
    </div>
    {/* Footer - Hidden on mobile */}
    <div className="hidden md:block">
      <Footer />
    </div>
  </>
  );
}


export default function ProtectedDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
