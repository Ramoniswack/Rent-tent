'use client';

import { useState, useEffect, ChangeEvent, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, Heart, Loader2, Star, 
  Calendar, User, Users, SlidersHorizontal, 
  Compass, XCircle, CheckCircle2 
} from 'lucide-react';
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
  
  // -- State --
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('discover');
  const [users, setUsers] = useState<UserCard[]>([]);
  const [matches, setMatches] = useState<UserCard[]>([]);
  const [incomingLikes, setIncomingLikes] = useState<UserCard[]>([]);
  const [outgoingLikes, setOutgoingLikes] = useState<UserCard[]>([]);
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

  // -- Data Fetching --
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // We fetch counts for the badges regardless of active tab
      const [discoverRes, matchesRes, likesRes, sentRes] = await Promise.all([
        matchAPI.discover(),
        matchAPI.getMatches(),
        matchAPI.getLikes(),
        matchAPI.getSentLikes()
      ]);

      const formatUser = (data: any, status: UserCard['connectionStatus']): UserCard => ({
        id: data.id || data.user?._id || data._id,
        name: data.name || data.user?.name,
        username: data.username || data.user?.username,
        age: data.age || data.user?.age || 'N/A',
        gender: data.gender || data.user?.gender,
        location: data.location || data.user?.location || 'Unknown',
        coverImage: data.upcomingTrips?.[0]?.coverPhoto || data.user?.upcomingTrips?.[0]?.coverPhoto || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
        avatar: data.profilePicture || data.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || data.user?.name)}&background=059467`,
        travelStyles: Array.isArray(data.travelStyle || data.user?.travelStyle) ? (data.travelStyle || data.user?.travelStyle) : [],
        connectionStatus: status,
        bio: data.bio || data.user?.bio,
        distance: data.distance,
        upcomingTrips: data.upcomingTrips || data.user?.upcomingTrips || [],
        interests: data.interests || data.user?.interests || [],
        totalConnections: data.totalConnections || data.user?.totalConnections || 0,
        matchScore: data.matchScore
      });

      if (discoverRes.success) setUsers(discoverRes.profiles.map((p: any) => formatUser(p, p.connectionStatus || 'none')));
      setMatches(matchesRes.map((m: any) => formatUser(m, 'connected')));
      setIncomingLikes(likesRes.map((l: any) => formatUser(l, 'pending')));
      setOutgoingLikes(sentRes.map((s: any) => formatUser(s, 'sent')));

    } catch (err: any) {
      setError(err.message || 'Failed to sync with Nomad Network');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -- Filter Logic --
  const currentFilteredData = useMemo(() => {
    let source = users;
    if (activeTab === 'mutual') source = matches;
    if (activeTab === 'incoming') source = incomingLikes;
    if (activeTab === 'outgoing') source = outgoingLikes;

    return source.filter(user => {
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchFields = [user.name, user.username, user.location, ...(user.interests || []), ...(user.travelStyles || [])];
        if (!searchFields.some(f => f?.toLowerCase().includes(query))) return false;
      }

      // Age Range
      const age = Number(user.age);
      if (!isNaN(age) && (age < filters.ageRange[0] || age > filters.ageRange[1])) return false;

      // Gender
      if (filters.selectedGenders.length > 0 && !filters.selectedGenders.includes('Any')) {
        if (!user.gender || !filters.selectedGenders.some(g => g.toLowerCase() === user.gender?.toLowerCase())) return false;
      }

      // Proximity
      if (filters.locationRange < 500 && user.distance !== undefined) {
        if (user.distance > filters.locationRange) return false;
      }

      return true;
    });
  }, [activeTab, users, matches, incomingLikes, outgoingLikes, searchQuery, filters]);

  const paginatedUsers = useMemo(() => 
    currentFilteredData.slice(0, currentPage * itemsPerPage), 
  [currentFilteredData, currentPage]);

  // -- Actions --
  const handleConnect = async (userId: string) => {
    try {
      const response = await matchAPI.likeUser(userId);
      showToast(response.matched ? "🎉 It's a match! Start a conversation." : "✅ Connection request sent!", "success");
      fetchData(); // Refresh all lists to ensure UI consistency
    } catch (err: any) {
      showToast(err.message || "Connection failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col selection:bg-[#059467] selection:text-white">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 animate-fadeIn">
        {/* Hero Section */}
        <div className="text-center py-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#059467]/10 text-[#059467] px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">
            <Compass size={14} className="animate-spin-slow" />
            Global Discovery
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            Find your <span className="text-[#059467]">travel buddy.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Connect with digital nomads who share your destination and remote work schedule.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="sticky top-4 z-30 mb-12">
          <div className="bg-white/80 dark:bg-[#1a3830]/80 backdrop-blur-xl rounded-[2.5rem] p-3 shadow-2xl shadow-emerald-900/10 border border-white dark:border-white/5 flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#059467] w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, interests, or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-[#0f231d] border-none rounded-3xl focus:ring-2 focus:ring-[#059467] text-slate-900 dark:text-white font-bold"
              />
            </div>
            
            <div className="flex w-full md:w-auto gap-2">
              <button 
                onClick={() => setShowFilterModal(true)}
                className="relative flex-1 md:flex-none h-14 px-8 bg-white dark:bg-[#0f231d] text-[#059467] rounded-3xl font-black border-2 border-slate-100 dark:border-white/5 transition-all hover:bg-slate-50 active:scale-95 flex items-center justify-center gap-2"
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 && v[0] !== 18 : v !== 500) && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center border-4 border-[#f5f8f7] dark:border-[#0f231d]">
                    !
                  </span>
                )}
              </button>
              
              <button 
                className="flex-1 md:flex-none h-14 px-10 bg-[#059467] hover:bg-[#06ac77] text-white rounded-3xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                Find Nomads
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
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
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#059467] text-white shadow-xl shadow-emerald-500/10' 
                  : 'bg-white dark:bg-[#1a3830] text-slate-400 hover:text-[#059467] border border-slate-100 dark:border-white/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-slate-900 dark:text-[#059467] animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Filtering Nomad Network...</p>
          </div>
        ) : paginatedUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedUsers.map((user, idx) => (
              <UserDiscoveryCard 
                key={user.id} 
                user={user} 
                isTop={idx === 0 && activeTab === 'discover'} 
                onConnect={handleConnect}
                onView={() => router.push(`/profile/${user.username || user.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center space-y-4">
            <XCircle className="w-16 h-16 mx-auto text-slate-200" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No nomads found</h3>
            <p className="text-slate-400 max-w-xs mx-auto">Try adjusting your filters or search terms to broaden your discovery.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && currentFilteredData.length > paginatedUsers.length && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-12 py-4 bg-white dark:bg-[#1a3830] text-[#059467] font-black rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl hover:shadow-emerald-500/10 transition-all active:scale-95"
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
    </div>
  );
}

function UserDiscoveryCard({ user, isTop, onConnect, onView }: { user: UserCard, isTop: boolean, onConnect: (id: string) => void, onView: () => void }) {
  return (
    <div className={`group bg-white dark:bg-[#1a3830] rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden ${isTop ? 'ring-2 ring-emerald-500/20' : ''}`}>
      {isTop && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-[#059467]" />
      )}
      
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative group/avatar cursor-pointer" onClick={onView}>
          <div className="size-32 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 dark:border-white/5 shadow-xl transition-transform duration-500 group-hover/avatar:scale-105 group-hover/avatar:rotate-3">
            <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
          </div>
          {isTop && (
            <div className="absolute -top-3 -right-3 bg-amber-400 text-white p-2 rounded-2xl shadow-lg animate-bounce">
              <Star size={16} className="fill-current" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#059467] transition-colors">{user.name}, {user.age}</h3>
          <div className="flex items-center justify-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            <MapPin size={12} className="text-[#059467]" />
            {user.location} {user.distance ? `• ${user.distance}km away` : ''}
          </div>
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
          {user.bio || "Searching for epic views and reliable coffee shop Wi-Fi across the globe."}
        </p>

        {/* Interests */}
        <div className="flex flex-wrap justify-center gap-2">
          {(user.travelStyles || []).slice(0, 2).map(style => (
            <span key={style} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-[#059467] rounded-lg text-[10px] font-black uppercase tracking-tighter">
              {style}
            </span>
          ))}
        </div>

        {/* Match Breakdown (Simplified visual for instrucive value) */}
        {isTop && (
          <div className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase text-left">Match logic</p>
            <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
               <div className="bg-emerald-500 h-full" style={{ width: '40%' }} />
               <div className="bg-emerald-300 h-full" style={{ width: '30%' }} />
               <div className="bg-emerald-100 h-full" style={{ width: '20%' }} />
            </div>
          </div>
        )}

        <div className="pt-4 w-full">
          {user.connectionStatus === 'connected' ? (
            <button onClick={onView} className="w-full py-4 bg-emerald-50 dark:bg-emerald-500/10 text-[#059467] rounded-2xl font-black text-sm transition-all hover:bg-emerald-100">
              View Connection
            </button>
          ) : user.connectionStatus === 'sent' ? (
            <button disabled className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl font-black text-sm cursor-not-allowed">
              Pending Reply
            </button>
          ) : (
            <button 
              onClick={() => onConnect(user.id)}
              className="w-full py-4 bg-[#059467] hover:bg-[#06ac77] text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Heart size={16} className="group-hover:fill-current" />
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}