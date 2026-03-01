'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { tripAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { TripCardSkeleton, DashboardStatSkeleton } from '../../components/SkeletonCard';
import { 
  Calendar, 
  Search, 
  Plus, 
  ArrowRight,
  Loader2,
  Users,
  X,
  Trash2,
  Edit2
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
  lat?: number;
  lng?: number;
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
  const { showConfirm, showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [publicTrips, setPublicTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyTripIds, setNearbyTripIds] = useState<Set<string>>(new Set());

  // Get user's current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Check which trips are nearby (within 50km)
  useEffect(() => {
    if (!userLocation) return;

    const nearby = new Set<string>();
    const NEARBY_THRESHOLD_KM = 50; // Consider trips within 50km as "nearby"

    trips.forEach(trip => {
      // Check if trip has coordinates
      if ((trip as any).lat && (trip as any).lng) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          (trip as any).lat,
          (trip as any).lng
        );
        
        if (distance <= NEARBY_THRESHOLD_KM) {
          nearby.add(trip._id);
        }
      }
    });

    setNearbyTripIds(nearby);
  }, [userLocation, trips]);

  useEffect(() => {
    fetchTrips();
  }, [activeTab]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'public') {
        const response = await fetch('http://localhost:5000/api/trips/public', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch public trips');
        const data = await response.json();
        setPublicTrips(data);
      } else {
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
    
    // Find the trip to check ownership
    const trip = trips.find(t => t._id === tripId);
    if (!trip || !user) return;
    
    // Check if current user is the owner
    const isOwner = trip.userId._id === user._id;
    
    if (!isOwner) {
      showToast('You cannot delete this trip. Only the trip creator can delete it.', 'error');
      return;
    }
    
    showConfirm({
      title: 'Delete Trip',
      message: 'Are you sure you want to delete this trip? This action cannot be undone and will remove all associated data including itinerary, expenses, and packing lists.',
      confirmText: 'Delete Trip',
      cancelText: 'Cancel',
      type: 'error',
      onConfirm: async () => {
        setDeletingId(tripId);
        try {
          await tripAPI.delete(tripId);
          setTrips(trips.filter(t => t._id !== tripId));
          showToast('Trip deleted successfully', 'success');
        } catch (err: any) {
          console.error('Error deleting trip:', err);
          showToast('Failed to delete trip. Please try again.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

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
  const filterOptions = ['all', 'planning', 'traveling', 'completed'];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] pb-20 md:pb-0">
          <main className="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-20 py-6 md:py-12">
            
            {/* Skeleton Mobile Hero Section */}
            <div className="md:hidden mb-6 space-y-2">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-48 animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 animate-pulse" />
            </div>

            {/* Skeleton Desktop Hero */}
            <div className="hidden md:flex mb-6 md:mb-12 flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
              <div className="space-y-3 animate-pulse">
                <div className="h-12 md:h-14 bg-slate-200 dark:bg-slate-700 rounded-xl w-64 md:w-80" />
                <div className="h-4 md:h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-48 md:w-96" />
              </div>
              <div className="h-12 md:h-14 bg-slate-200 dark:bg-slate-700 rounded-full w-40 md:w-48 animate-pulse" />
            </div>

            {/* Navigation & Search Skeleton */}
            <div className="flex flex-col gap-4 mb-6 md:mb-10">
              {/* Search Bar Skeleton */}
              <div className="w-full lg:max-w-xl">
                <div className="h-12 md:h-14 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </div>

              {/* Filter Chips Skeleton */}
              <div className="flex gap-2 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse flex-shrink-0" />
                ))}
              </div>
            </div>

            {/* Trips Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-900/5 dark:shadow-black/20 overflow-hidden flex flex-col animate-pulse"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                    <div className="absolute top-3 md:top-6 left-3 md:left-6 w-20 md:w-24 h-6 md:h-7 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-full" />
                    {/* Glassmorphic Delete Skeleton */}
                    <div className="absolute top-3 md:top-6 right-3 md:right-6 w-8 h-8 md:w-10 md:h-10 bg-white/30 backdrop-blur-md rounded-full" />
                  </div>
                  <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col">
                    <div className="space-y-2 mb-3 md:mb-4">
                      <div className="h-6 md:h-7 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
                      <div className="h-6 md:h-7 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
                    </div>
                    <div className="flex flex-col gap-2 mb-4 md:mb-8">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 md:w-5 md:h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 md:w-40" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 md:w-5 md:h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40 md:w-48" />
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4 md:pt-6">
                      <div className="flex -space-x-2 md:-space-x-3">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800" />
                        ))}
                      </div>
                      <div className="h-4 md:h-5 w-16 md:w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] pb-20 md:pb-0">
        <main className="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-20 py-6 md:py-12">
          
          {/* Mobile Hero Section */}
          <div className="md:hidden mb-6">
            <h1 className="text-2xl font-black text-[#0f172a] dark:text-white mb-1">
              Where to next, {user?.name?.split(' ')[0] || 'Traveler'}?
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Manage your itineraries across Nepal
            </p>
          </div>

          {/* Desktop Hero Title Section */}
          <div className="hidden md:flex mb-6 md:mb-12 flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
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
          <div className="flex flex-col gap-4 mb-6 md:mb-10">
            {/* Search Bar */}
            <div className="flex items-center w-full lg:max-w-xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-[#059467] transition-colors" />
                <input
                  className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 bg-white dark:bg-slate-800 border-none rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#059467] outline-none transition-all placeholder:text-slate-400 dark:text-white text-sm md:text-base"
                  placeholder="Search trips..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal Filter Chips */}
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {filterOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    statusFilter === status
                      ? 'bg-[#059467] text-white ring-2 ring-[#059467] ring-offset-1 dark:ring-offset-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 ring-1 ring-slate-200 dark:ring-slate-700'
                  }`}
                >
                  {status === 'all' ? 'All Trips' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
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
              const isNearby = nearbyTripIds.has(trip._id);
              
              return (
                <div 
                  key={trip._id}
                  className={`trip-card group bg-white dark:bg-slate-800 rounded-3xl md:rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl cursor-pointer ${
                    isNearby 
                      ? 'ring-4 ring-[#059467] ring-offset-2 dark:ring-offset-slate-900 shadow-[#059467]/30 animate-pulse-slow' 
                      : 'shadow-slate-900/5 dark:shadow-black/20 hover:shadow-[#059467]/10'
                  }`}
                  onClick={() => router.push(`/trips/${trip._id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      alt={trip.destination}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={trip.imageUrl || getDefaultImage(trip.destination)}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 md:top-6 left-3 md:left-6 flex flex-col gap-2">
                      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 md:px-4 py-1 md:py-1.5 rounded-full flex items-center gap-1.5 md:gap-2">
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
                      
                      {/* Nearby Badge */}
                      {isNearby && (
                        <div className="bg-[#059467] backdrop-blur-md px-3 md:px-4 py-1 md:py-1.5 rounded-full flex items-center gap-1.5 md:gap-2 animate-in slide-in-from-left duration-500">
                          <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[10px] md:text-xs font-black text-white">
                            You're Here!
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Touch-Friendly Action Buttons */}
                    {activeTab !== 'public' && user && (
                      <div className="absolute top-3 md:top-6 right-3 md:right-6 flex gap-2">
                        {/* Edit Button - Only show for trip owner */}
                        {trip.userId._id === user._id && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/trips/${trip._id}/edit`);
                            }}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md text-white hover:bg-blue-500 hover:text-white shadow-sm ring-1 ring-white/30 transition-all flex items-center justify-center z-10"
                            aria-label="Edit Trip"
                          >
                            <Edit2 className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                          </button>
                        )}
                        
                        {/* Delete Button - Only show for trip owner */}
                        {trip.userId._id === user._id && (
                          <button 
                            onClick={(e) => handleDeleteTrip(e, trip._id)}
                            disabled={deletingId === trip._id}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md text-white hover:bg-red-500 hover:text-white shadow-sm ring-1 ring-white/30 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed z-10"
                            aria-label="Delete Trip"
                          >
                            {deletingId === trip._id ? (
                              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                            )}
                          </button>
                        )}
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
      
      {/* Floating Action Button - Mobile Only */}
      <button
        onClick={() => router.push('/trips/new')}
        className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 bg-[#059467] hover:bg-[#047854] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Create new trip"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>
      
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