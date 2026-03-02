'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { tripAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import SearchAndFilters from '../../components/dashboard/SearchAndFilters';
import TripCard from '../../components/dashboard/TripCard';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import { Plus } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyTripIds, setNearbyTripIds] = useState<Set<string>>(new Set());
  const filterOptions = ['all', 'planning', 'traveling', 'completed'];

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
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await tripAPI.getAll();
      setTrips(data);
    } catch (err: any) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    
    const trip = trips.find(t => t._id === tripId);
    if (!trip || !user) return;
    
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

  const filterTrips = () => {
    let filtered = trips;

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

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] pb-20 md:pb-0">
          <main className="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-20 py-6 md:py-12">
            <DashboardSkeleton />
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
          
          <DashboardHeader userName={user?.name} />

          <SearchAndFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            filterOptions={filterOptions}
          />

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

          {/* Trip Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                isNearby={nearbyTripIds.has(trip._id)}
                currentUserId={user?._id}
                deletingId={deletingId}
                onDelete={handleDeleteTrip}
                activeTab="all"
              />
            ))}
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