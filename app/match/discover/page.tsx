'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, Heart, Loader2, Star, 
  User, SlidersHorizontal, 
  Compass, XCircle, CheckCircle2 
} from 'lucide-react';
import { matchAPI, userAPI } from '@/services/api';
import Header from '@/components/Header';
import { useToast } from '@/hooks/useToast';
import MatchFilterModal, { FilterState } from '@/components/MatchFilterModal';
import MatchSuccess from '@/components/MatchSuccess';

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
  
  // -- State --
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('discover');
  const [users, setUsers] = useState<UserCard[]>([]);
  const [matches, setMatches] = useState<UserCard[]>([]);
  const [incomingLikes, setIncomingLikes] = useState<UserCard[]>([]);
  const [outgoingLikes, setOutgoingLikes] = useState<UserCard[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatch, setLastMatch] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    ageRange: [18, 60],
    selectedGenders: [],
    selectedTravelStyles: [],
    selectedInterests: [],
    locationRange: 500,
  });

  const itemsPerPage = 9;

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await userAPI.getProfile();
        setUserProfile(profile);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    };
    loadUserProfile();
  }, []);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      
      setError(null);
      const [discoverRes, matchesRes, likesRes, sentRes] = await Promise.all([
        matchAPI.discover(),
        matchAPI.getMatches(),
        matchAPI.getLikes(),
        matchAPI.getSentLikes()
      ]);

      const formatUser = (data: any, status: UserCard['connectionStatus']): UserCard => {
        const travelStyle = data.travelStyle || data.user?.travelStyle;
        const travelStylesArray = Array.isArray(travelStyle) 
          ? travelStyle 
          : (typeof travelStyle === 'string' && travelStyle.trim() ? [travelStyle] : []);
        
        return {
          id: data.id || data.user?._id || data._id,
          name: data.name || data.user?.name,
          username: data.username || data.user?.username,
          age: data.age || data.user?.age || 'N/A',
          gender: data.gender || data.user?.gender,
          location: data.location || data.user?.location || 'Unknown',
          coverImage: data.upcomingTrips?.[0]?.coverPhoto || data.user?.upcomingTrips?.[0]?.coverPhoto || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
          avatar: data.profilePicture || data.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || data.user?.name)}&background=059467`,
          travelStyles: travelStylesArray,
          connectionStatus: status,
          bio: data.bio || data.user?.bio,
          distance: data.distance,
          upcomingTrips: data.upcomingTrips || data.user?.upcomingTrips || [],
          interests: data.interests || data.user?.interests || [],
          totalConnections: data.totalConnections || data.user?.totalConnections || 0,
          matchScore: data.matchScore
        };
      };

      // BATCH UPDATES: Prepare all data before updating state
      const formattedDiscover = discoverRes.success ? discoverRes.profiles.map((p: any) => formatUser(p, p.connectionStatus || 'none')) : [];
      const formattedMatches = matchesRes.map((m: any) => formatUser(m, 'connected'));
      const formattedIncoming = likesRes.map((l: any) => formatUser(l, 'pending'));
      const formattedOutgoing = sentRes.map((s: any) => formatUser(s, 'sent'));

      // Update states simultaneously
      setUsers(formattedDiscover);
      setMatches(formattedMatches);
      setIncomingLikes(formattedIncoming);
      setOutgoingLikes(formattedOutgoing);

      // Pre-fetch first card's image to ensure it's ready before skeleton hides
      if (formattedDiscover.length > 0) {
        const img = new Image();
        img.src = formattedDiscover[0].avatar;
        img.onload = () => {
          setLoading(false);
          setIsRefreshing(false);
        };
      } else {
        setLoading(false);
        setIsRefreshing(false);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to sync with Nomad Network');
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentFilteredData = useMemo(() => {
    let source = users;
    if (activeTab === 'mutual') source = matches;
    if (activeTab === 'incoming') source = incomingLikes;
    if (activeTab === 'outgoing') source = outgoingLikes;

    return source.filter(user => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchFields = [user.name, user.username, user.location, ...(user.interests || []), ...(user.travelStyles || [])];
        if (!searchFields.some(f => f?.toLowerCase().includes(query))) return false;
      }
      
      // Age range filter
      const age = Number(user.age);
      if (!isNaN(age) && (age < filters.ageRange[0] || age > filters.ageRange[1])) return false;
      
      // Gender filter
      if (filters.selectedGenders.length > 0 && !filters.selectedGenders.includes('Any')) {
        if (!user.gender || !filters.selectedGenders.some(g => g.toLowerCase() === user.gender?.toLowerCase())) return false;
      }
      
      // Travel styles filter
      if (filters.selectedTravelStyles.length > 0) {
        const userTravelStyles = Array.isArray(user.travelStyles) ? user.travelStyles : [];
        const hasMatchingStyle = filters.selectedTravelStyles.some(filterStyle => 
          userTravelStyles.some(userStyle => 
            userStyle?.toLowerCase() === filterStyle?.toLowerCase()
          )
        );
        if (!hasMatchingStyle) return false;
      }
      
      // Interests filter
      if (filters.selectedInterests.length > 0) {
        const userInterests = Array.isArray(user.interests) ? user.interests : [];
        const hasMatchingInterest = filters.selectedInterests.some(filterInterest => 
          userInterests.some(userInterest => 
            userInterest?.toLowerCase() === filterInterest?.toLowerCase()
          )
        );
        if (!hasMatchingInterest) return false;
      }
      
      // Location range filter
      if (filters.locationRange < 500 && user.distance !== undefined) {
        if (user.distance > filters.locationRange) return false;
      }
      
      return true;
    });
  }, [activeTab, users, matches, incomingLikes, outgoingLikes, searchQuery, filters]);

  const paginatedUsers = useMemo(() => 
    currentFilteredData.slice(0, currentPage * itemsPerPage), 
  [currentFilteredData, currentPage]);

  const handleConnect = async (userId: string) => {
    try {
      const response = await matchAPI.likeUser(userId);
      
      if (response.matched && response.matchedUser) {
        setLastMatch(response.matchedUser);
        setShowMatch(true);
      } else {
        showToast("✅ Request sent!", "success");
      }
      
      fetchData(true); 
    } catch (err: any) {
      showToast(err.message || "Connection failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col selection:bg-[#059467] selection:text-white">
      <Header />
      
      {isRefreshing && (
        <div className="fixed top-0 left-0 w-full h-1 bg-[#059467] z-[60] overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[loading_2.5s_ease-in-out_infinite] w-full" />
        </div>
      )}

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center py-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#059467]/10 text-[#059467] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            <Compass size={14} /> Global Discovery
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            Find your <span className="text-[#059467]">travel buddy.</span>
          </h1>
        </div>

        <div className="sticky top-4 z-30 mb-12">
          <div className="bg-white/80 dark:bg-[#1a3830]/80 backdrop-blur-xl rounded-[2.5rem] p-3 shadow-2xl border border-white dark:border-white/5 flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#059467] w-5 h-5 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search nomads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-[#0f231d] border-none rounded-3xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold focus:outline-none"
              />
            </div>
            <button 
              onClick={() => setShowFilterModal(true)}
              className="h-14 px-8 bg-white dark:bg-[#0f231d] text-[#059467] rounded-3xl font-black border-2 border-slate-100 dark:border-white/5 flex items-center gap-2 active:scale-95 transition-transform"
            >
              <SlidersHorizontal size={18} /> <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { id: 'discover', label: 'Explore', icon: Compass, count: users.length },
            { id: 'mutual', label: 'Matches', icon: Heart, count: matches.length },
            { id: 'incoming', label: 'Requests', icon: User, count: incomingLikes.length },
            { id: 'outgoing', label: 'Sent', icon: CheckCircle2, count: outgoingLikes.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#059467] text-white shadow-lg shadow-emerald-500/10' 
                  : 'bg-white dark:bg-[#1a3830] text-slate-400 hover:text-[#059467] border border-transparent'
              }`}
            >
              <tab.icon size={14} /> {tab.label} <span className="ml-1 opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, idx) => (
                  <UserDiscoveryCard 
                    key={user.id} 
                    user={user} 
                    isTop={idx === 0 && activeTab === 'discover'} 
                    onConnect={handleConnect}
                    onView={() => router.push(`/profile/${user.username || user.id}`)}
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center animate-fadeIn">
                  <XCircle className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                  <h3 className="text-xl font-black dark:text-white">No nomads found</h3>
                </div>
              )}
            </div>
          )}
        </div>

        {!loading && currentFilteredData.length > paginatedUsers.length && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-12 py-4 bg-white dark:bg-[#1a3830] text-[#059467] font-black rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl hover:bg-slate-50 transition-colors"
            >
              Load More Explorers
            </button>
          </div>
        )}
      </main>

      {showFilterModal && (
        <MatchFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={(f) => { setFilters(f); setCurrentPage(1); }}
          initialFilters={filters}
        />
      )}

      {showMatch && lastMatch && userProfile && (
        <MatchSuccess
          isOpen={showMatch}
          onClose={() => { 
            setShowMatch(false); 
            setLastMatch(null); 
          }}
          onSendMessage={() => { 
            setShowMatch(false); 
            setLastMatch(null); 
            router.push(`/messages?user=${lastMatch.id || lastMatch._id}`); 
          }}
          matchedUser={{ 
            name: lastMatch.name, 
            profilePicture: lastMatch.profilePicture 
          }}
          currentUser={{ 
            name: userProfile.name, 
            profilePicture: userProfile.profilePicture 
          }}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* Prevent autocomplete dropdown styling issues */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgb(248 250 252) inset !important;
          -webkit-text-fill-color: rgb(15 23 42) !important;
        }
        
        .dark input:-webkit-autofill,
        .dark input:-webkit-autofill:hover,
        .dark input:-webkit-autofill:focus,
        .dark input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgb(15 35 29) inset !important;
          -webkit-text-fill-color: rgb(255 255 255) !important;
        }
      `}</style>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1a3830] rounded-[2.5rem] p-6 border border-slate-100 dark:border-white/5">
      <div className="flex flex-col items-center space-y-4">
        <div className="size-32 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 animate-pulse" />
        <div className="h-6 w-3/4 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
        <div className="h-4 w-1/2 bg-slate-50 dark:bg-white/5 rounded-lg animate-pulse" />
        <div className="h-20 w-full bg-slate-50 dark:bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-12 w-full bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

function UserDiscoveryCard({ user, isTop, onConnect, onView }: { user: UserCard, isTop: boolean, onConnect: (id: string) => void, onView: () => void }) {
  return (
    <div className={`bg-white dark:bg-[#1a3830] rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden ${isTop ? 'ring-2 ring-emerald-500/20' : ''}`}>
      {isTop && <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#059467]" />}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative cursor-pointer" onClick={onView}>
          <div className="size-32 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 dark:border-white/5 shadow-md">
            <img 
              src={user.avatar} 
              className="w-full h-full object-cover" 
              alt={user.name}
              loading="lazy"
            />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{user.name}, {user.age}</h3>
          <div className="flex items-center justify-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
            <MapPin size={12} className="text-[#059467]" /> {user.location}
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
          {user.bio || "Nomad explorer searching for the next adventure."}
        </p>
        <div className="pt-2 w-full">
          {user.connectionStatus === 'connected' ? (
            <button onClick={onView} className="w-full py-4 bg-emerald-50 dark:bg-emerald-500/10 text-[#059467] rounded-2xl font-black text-sm">
              Message
            </button>
          ) : user.connectionStatus === 'sent' ? (
            <button disabled className="w-full py-4 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl font-black text-sm">
              Pending
            </button>
          ) : (
            <button onClick={() => onConnect(user.id)} className="w-full py-4 bg-[#059467] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <Heart size={16} /> Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}