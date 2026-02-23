'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Heart, Loader2, Star, Calendar, User, Users, SlidersHorizontal } from 'lucide-react';
import { matchAPI } from '@/services/api';
import Header from '@/components/Header';
import { useToast } from '@/hooks/useToast';
import MatchFilterModal, { FilterState } from '@/components/MatchFilterModal';

interface UserCard {
  id: string;
  name: string;
  username?: string;
  age: number | string;
  gender?: string;
  location: string;
  coverImage: string;
  avatar: string;
  travelStyles: string[];
  connectionStatus: 'connected' | 'pending' | 'sent' | 'none';
  bio?: string;
  distance?: number;
  upcomingTrips?: any[];
  interests?: string[];
  totalConnections?: number;
  matchScore?: {
    total: number;
    travelStyle: number;
    interests: number;
    distance: number;
  };
}

export default function DiscoverPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('discover');
  const [users, setUsers] = useState<UserCard[]>([]);
  const [matches, setMatches] = useState<UserCard[]>([]);
  const [incomingLikes, setIncomingLikes] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    ageRange: [18, 60],
    selectedGenders: [],
    selectedTravelStyles: [],
    selectedInterests: [],
    locationRange: 500,
  });
  
  const itemsPerPage = 9;

  // Fetch discover profiles
  const fetchDiscoverProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchAPI.discover();
      
      if (response.success && response.profiles) {
        const formattedUsers: UserCard[] = response.profiles.map((profile: any) => ({
          id: profile.id,
          name: profile.name,
          username: profile.username,
          age: profile.age || 'N/A',
          gender: profile.gender,
          location: profile.location || 'Unknown',
          coverImage: profile.upcomingTrips?.[0]?.coverPhoto || 
                     'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=400&fit=crop',
          avatar: profile.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=059467`,
          travelStyles: Array.isArray(profile.travelStyle) ? profile.travelStyle : 
                       profile.travelStyle ? [profile.travelStyle] : [],
          connectionStatus: profile.connectionStatus || 'none',
          bio: profile.bio,
          distance: profile.distance,
          upcomingTrips: profile.upcomingTrips || [],
          interests: profile.interests || [],
          totalConnections: profile.totalConnections || 0,
          matchScore: profile.matchScore
        }));
        setUsers(formattedUsers);
      }
    } catch (err: any) {
      console.error('Error fetching discover profiles:', err);
      
      // Check for specific error messages
      if (err.message?.includes('Location not set') || err.message?.includes('location')) {
        setError('Please set your location in Account Settings to discover nearby travelers.');
      } else if (err.message?.includes('Unauthorized') || err.message?.includes('log in')) {
        setError('Please log in to discover travel buddies.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(err.message || 'Failed to load profiles. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch mutual matches
  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchAPI.getMatches();
      
      const formattedMatches: UserCard[] = response.map((match: any) => ({
        id: match.user._id,
        name: match.user.name,
        username: match.user.username,
        age: match.user.age || 'N/A',
        gender: match.user.gender,
        location: match.user.location || 'Unknown',
        coverImage: match.user.upcomingTrips?.[0]?.coverPhoto || 
                   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=400&fit=crop',
        avatar: match.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.user.name)}&background=059467`,
        travelStyles: Array.isArray(match.user.travelStyle) ? match.user.travelStyle : 
                     match.user.travelStyle ? [match.user.travelStyle] : [],
        connectionStatus: 'connected',
        bio: match.user.bio,
        upcomingTrips: match.user.upcomingTrips || [],
        interests: match.user.interests || [],
        totalConnections: match.user.totalConnections || 0
      }));
      setMatches(formattedMatches);
    } catch (err: any) {
      console.error('Error fetching matches:', err);
      setError(err.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  // Fetch incoming likes
  const fetchIncomingLikes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchAPI.getLikes();
      
      const formattedLikes: UserCard[] = response.map((like: any) => ({
        id: like.user._id,
        name: like.user.name,
        username: like.user.username,
        age: like.user.age || 'N/A',
        gender: like.user.gender,
        location: like.user.location || 'Unknown',
        coverImage: like.user.upcomingTrips?.[0]?.coverPhoto || 
                   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=400&fit=crop',
        avatar: like.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(like.user.name)}&background=059467`,
        travelStyles: Array.isArray(like.user.travelStyle) ? like.user.travelStyle : 
                     like.user.travelStyle ? [like.user.travelStyle] : [],
        connectionStatus: 'pending',
        bio: like.user.bio,
        upcomingTrips: like.user.upcomingTrips || [],
        interests: like.user.interests || [],
        totalConnections: like.user.totalConnections || 0
      }));
      setIncomingLikes(formattedLikes);
    } catch (err: any) {
      console.error('Error fetching incoming likes:', err);
      setError(err.message || 'Failed to load incoming likes');
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'discover') {
      fetchDiscoverProfiles();
    } else if (activeTab === 'mutual') {
      fetchMatches();
    } else if (activeTab === 'incoming') {
      fetchIncomingLikes();
    }
  }, [activeTab]);

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'discover') return users;
    if (activeTab === 'mutual') return matches;
    if (activeTab === 'incoming') return incomingLikes;
    return [];
  };

  // Apply filters to current data
  const applyFilters = (data: UserCard[]) => {
    return data.filter(user => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(query);
        const matchesUsername = user.username?.toLowerCase().includes(query);
        const matchesLocation = user.location.toLowerCase().includes(query);
        const matchesInterests = user.interests?.some(interest => 
          interest.toLowerCase().includes(query)
        );
        const matchesTravelStyles = user.travelStyles?.some(style => 
          style.toLowerCase().includes(query)
        );
        
        if (!matchesName && !matchesUsername && !matchesLocation && !matchesInterests && !matchesTravelStyles) {
          return false;
        }
      }

      // Age filter
      const userAge = typeof user.age === 'number' ? user.age : parseInt(user.age as string);
      if (!isNaN(userAge) && (userAge < filters.ageRange[0] || userAge > filters.ageRange[1])) {
        return false;
      }

      // Gender filter
      if (filters.selectedGenders.length > 0 && !filters.selectedGenders.includes('Any')) {
        if (!user.gender) {
          // If user has no gender set, exclude them when gender filter is active
          return false;
        }
        // Check if user's gender matches any of the selected genders
        const userGender = user.gender.toLowerCase();
        const matchesGender = filters.selectedGenders.some(selectedGender => 
          selectedGender.toLowerCase() === userGender
        );
        if (!matchesGender) return false;
      }

      // Travel style filter
      if (filters.selectedTravelStyles.length > 0) {
        const hasMatchingStyle = user.travelStyles?.some(style => 
          filters.selectedTravelStyles.includes(style)
        );
        if (!hasMatchingStyle) return false;
      }

      // Interests filter
      if (filters.selectedInterests.length > 0) {
        const hasMatchingInterest = user.interests?.some(interest => 
          filters.selectedInterests.includes(interest)
        );
        if (!hasMatchingInterest) return false;
      }

      // Distance filter
      if (filters.locationRange < 500 && user.distance !== undefined) {
        if (user.distance > filters.locationRange) return false;
      }

      return true;
    });
  };

  const currentData = applyFilters(getCurrentData());
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  
  const paginatedUsers = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleConnect = async (userId: string) => {
    try {
      const response = await matchAPI.likeUser(userId);
      
      // Update the user's connection status in the current list without reloading
      if (activeTab === 'discover') {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, connectionStatus: response.matched ? 'connected' : 'sent' as const }
              : user
          )
        );
      } else if (activeTab === 'incoming') {
        setIncomingLikes(prevLikes => 
          prevLikes.map(user => 
            user.id === userId 
              ? { ...user, connectionStatus: 'connected' as const }
              : user
          )
        );
      }
      
      // Show success message
      if (response.matched) {
        showToast(`🎉 It's a match! You can now message ${response.matchedUser?.name || 'this user'}`, 'success');
        // Silently refresh matches count in background
        fetchMatches();
      } else {
        showToast('✅ Connection request sent!', 'success');
      }
    } catch (err: any) {
      console.error('Error connecting:', err);
      showToast(err.message || 'Failed to connect. Please try again.', 'error');
    }
  };

  const handleCancelConnection = async (userId: string) => {
    try {
      await matchAPI.cancelConnection(userId);
      
      // Update the user's connection status back to 'none'
      if (activeTab === 'discover') {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, connectionStatus: 'none' as const }
              : user
          )
        );
      }
      
      showToast('Connection request cancelled', 'success');
    } catch (err: any) {
      console.error('Error cancelling connection:', err);
      showToast(err.message || 'Failed to cancel connection. Please try again.', 'error');
    }
  };

  const handleViewProfile = (username?: string, userId?: string) => {
    if (username) {
      router.push(`/profile/${username}`);
    } else if (userId) {
      // Fallback to userId if username not available
      router.push(`/profile/${userId}`);
    }
  };

  const handleMessage = (username?: string, userId?: string) => {
    if (username) {
      router.push(`/messages?username=${username}`);
    } else if (userId) {
      router.push(`/messages?userId=${userId}`);
    }
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60) count++;
    if (filters.selectedGenders.length > 0 && !filters.selectedGenders.includes('Any')) count++;
    if (filters.selectedTravelStyles.length > 0) count++;
    if (filters.selectedInterests.length > 0) count++;
    if (filters.locationRange !== 500) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col">
      <Header />
      
      <main className="flex-grow flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero Text */}
        <div className="text-center pt-12 pb-8 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0d1c17] dark:text-white mb-4 tracking-tight">
            Find your next travel buddy
          </h1>
          <p className="text-[#489d82] dark:text-[#489d82] text-lg">
            Connect with digital nomads who share your destination and schedule.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-5xl mb-8">
          <div className="bg-white dark:bg-[#1a3830] rounded-[40px] p-2 shadow-soft flex items-center gap-2 border border-[#e7f4f0] dark:border-[#1a3830]">
            <div className="flex-1 relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-[#059467] w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, location, or interests..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="w-full h-14 pl-14 pr-4 bg-transparent border-none rounded-[32px] focus:ring-2 focus:ring-[#059467]/20 text-[#0d1c17] dark:text-white placeholder:text-gray-400 font-medium hover:bg-[#f5f8f7] dark:hover:bg-[#0f231d]/50 transition-colors"
              />
            </div>
            <button 
              onClick={() => setShowFilterModal(true)}
              className="relative h-14 px-6 bg-white dark:bg-[#0f231d] hover:bg-[#f5f8f7] dark:hover:bg-[#1a3830] text-[#059467] rounded-[32px] font-bold border-2 border-[#059467]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
            <button 
              onClick={handleSearch}
              className="h-14 px-8 bg-[#059467] hover:bg-[#047854] text-white rounded-[32px] font-bold shadow-lg shadow-[#059467]/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full max-w-7xl mb-8">
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => {
                setActiveTab('discover');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                activeTab === 'discover'
                  ? 'bg-[#059467] text-white shadow-lg shadow-[#059467]/30'
                  : 'bg-white dark:bg-[#1a3830] text-[#489d82] hover:bg-[#e7f4f0] dark:hover:bg-[#1a3830]/80 border border-[#e7f4f0] dark:border-[#1a3830]'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Discover
            </button>
            <button
              onClick={() => {
                setActiveTab('mutual');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                activeTab === 'mutual'
                  ? 'bg-[#059467] text-white shadow-lg shadow-[#059467]/30'
                  : 'bg-white dark:bg-[#1a3830] text-[#489d82] hover:bg-[#e7f4f0] dark:hover:bg-[#1a3830]/80 border border-[#e7f4f0] dark:border-[#1a3830]'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Mutual ({matches.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('incoming');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                activeTab === 'incoming'
                  ? 'bg-[#059467] text-white shadow-lg shadow-[#059467]/30'
                  : 'bg-white dark:bg-[#1a3830] text-[#489d82] hover:bg-[#e7f4f0] dark:hover:bg-[#1a3830]/80 border border-[#e7f4f0] dark:border-[#1a3830]'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Incoming ({incomingLikes.length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#059467]" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                {error.includes('location') && (
                  <button
                    onClick={() => router.push('/account')}
                    className="px-6 py-3 bg-[#059467] text-white rounded-full font-bold hover:bg-[#047854] transition-colors shadow-lg shadow-[#059467]/20"
                  >
                    Go to Settings
                  </button>
                )}
                <button
                  onClick={() => {
                    if (activeTab === 'discover') fetchDiscoverProfiles();
                    else if (activeTab === 'mutual') fetchMatches();
                    else fetchIncomingLikes();
                  }}
                  className="px-6 py-3 bg-white dark:bg-[#1a3830] text-[#059467] border border-[#059467] rounded-full font-bold hover:bg-[#059467]/10 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && paginatedUsers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#489d82] text-lg">
              {activeTab === 'discover' && 'No profiles to discover right now. Check back later!'}
              {activeTab === 'mutual' && 'No mutual matches yet. Keep swiping!'}
              {activeTab === 'incoming' && 'No incoming likes yet.'}
            </p>
          </div>
        )}

        {/* User Cards Grid */}
        {!loading && !error && paginatedUsers.length > 0 && (
          <>
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {paginatedUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="group relative bg-white dark:bg-[#1a3830] rounded-2xl p-6 shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-[#059467]/20 flex flex-col items-center text-center"
                >
                  {/* Top Match Badge */}
                  {index === 0 && activeTab === 'discover' && user.matchScore && user.matchScore.total > 2 && user.connectionStatus === 'none' && (
                    <div className="absolute top-4 right-4 bg-[#f59e0b]/10 text-[#f59e0b] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-[#f59e0b]/20">
                      <Star className="w-4 h-4 fill-current" />
                      Top Match
                    </div>
                  )}

                  {/* Connection Sent Badge */}
                  {user.connectionStatus === 'sent' && (
                    <div className="absolute top-4 right-4 bg-[#059467]/10 text-[#059467] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-[#059467]/20">
                      <Heart className="w-4 h-4" />
                      Connection Sent
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="relative mb-4">
                    <div className="size-[120px] rounded-full p-1 border-2 border-[#cee9e0] dark:border-[#059467]/30 cursor-pointer hover:border-[#059467] transition-colors">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                        onClick={() => handleViewProfile(user.username, user.id)}
                      />
                    </div>
                    {user.connectionStatus === 'connected' && (
                      <div className="absolute bottom-2 right-2 bg-white dark:bg-[#1a3830] rounded-full p-1 shadow-sm border border-[#e7f4f0] dark:border-[#059467]/30">
                        <Heart className="w-5 h-5 text-[#059467] fill-current" />
                      </div>
                    )}
                  </div>

                  {/* Name & Location */}
                  <h3 className="text-lg font-bold text-[#0d1c17] dark:text-white mb-1">
                    {user.name}, {user.age}
                  </h3>
                  <div className="flex items-center gap-1 text-[#489d82] text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>

                  {/* Connection Count */}
                  {user.totalConnections !== undefined && user.totalConnections > 0 && (
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium mb-4">
                      <Users className="w-3 h-3" />
                      <span>{user.totalConnections} connection{user.totalConnections !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Distance */}
                  {user.distance !== undefined && (
                    <p className="text-slate-400 text-xs mb-4 font-medium">
                      {user.distance} km away
                    </p>
                  )}

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 w-full text-center px-2">
                      {user.bio}
                    </p>
                  )}

                  {/* Upcoming Trips */}
                  {user.upcomingTrips && user.upcomingTrips.length > 0 && (
                    <div className="w-full bg-[#f5f8f7] dark:bg-[#0f231d]/50 rounded-xl p-4 mb-6">
                      <h4 className="text-xs font-bold text-[#489d82] uppercase tracking-wider mb-3 text-left">
                        Upcoming Trips
                      </h4>
                      <div className="space-y-3">
                        {user.upcomingTrips.slice(0, 2).map((trip: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-white dark:bg-[#1a3830] flex items-center justify-center text-[#059467] shadow-sm">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-[#0d1c17] dark:text-white">
                                {trip.destination || 'Unknown'}
                              </p>
                              <p className="text-xs text-[#489d82]">
                                {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interest Pills */}
                  {((user.interests && user.interests.length > 0) || (user.travelStyles && user.travelStyles.length > 0)) && (
                    <div className="w-full mb-4">
                      <h4 className="text-xs font-bold text-[#489d82] uppercase tracking-wider mb-2 text-left">
                        Interests & Travel Style
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {user.travelStyles?.slice(0, 3).map((style) => (
                          <span
                            key={style}
                            className="px-3 py-1 bg-[#e7f4f0] dark:bg-[#059467]/20 text-[#059467] rounded-full text-xs font-bold"
                          >
                            #{style}
                          </span>
                        ))}
                        {user.interests?.slice(0, 3).map((interest) => (
                          <span
                            key={interest}
                            className="px-3 py-1 bg-[#e7f4f0] dark:bg-[#059467]/20 text-[#059467] rounded-full text-xs font-bold"
                          >
                            #{interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {user.connectionStatus === 'connected' ? (
                    <button
                      onClick={() => handleMessage(user.username, user.id)}
                      className="w-full mt-auto h-12 bg-[#059467] hover:bg-[#047854] text-white font-bold rounded-2xl transition-colors shadow-lg shadow-[#059467]/20 flex items-center justify-center gap-2 group-hover:shadow-[#059467]/40"
                    >
                      <span>Message</span>
                      <Heart className="w-4 h-4" />
                    </button>
                  ) : user.connectionStatus === 'sent' ? (
                    <button
                      onClick={() => handleCancelConnection(user.id)}
                      className="w-full mt-auto h-12 bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all hover:bg-red-500 hover:text-white flex items-center justify-center gap-2 group"
                      title="Click to cancel connection request"
                    >
                      <span className="group-hover:hidden">Connection Sent</span>
                      <span className="hidden group-hover:inline">Cancel Request</span>
                      <Heart className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(user.id)}
                      className="w-full mt-auto h-12 bg-[#059467] hover:bg-[#047854] text-white font-bold rounded-2xl transition-colors shadow-lg shadow-[#059467]/20 flex items-center justify-center gap-2 group-hover:shadow-[#059467]/40"
                    >
                      <span>Connect</span>
                      <User className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Load More / Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-8 py-3 rounded-full border border-[#cee9e0] dark:border-[#059467]/30 bg-white dark:bg-[#1a3830] text-[#489d82] font-bold text-sm hover:bg-[#059467] hover:text-white transition-all shadow-sm"
                  >
                    Load More Nomads
                  </button>
                )}
              </div>
            )}

            {/* Results Info */}
            <div className="text-center text-sm text-[#489d82] mt-4">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} travelers
            </div>
          </>
        )}
      </main>

      {/* Filter Modal */}
      <MatchFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </div>
  );
}
