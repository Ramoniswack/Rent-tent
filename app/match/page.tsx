'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import MatchSuccess from '../../components/MatchSuccess';
import MatchFilterModal, { FilterState } from '../../components/MatchFilterModal';
import { 
  Heart, 
  X, 
  MapPin, 
  Users, 
  Sparkles,
  Info,
  Zap,
  MessageCircle,
  RotateCcw,
  Star,
  Camera,
  User as UserIcon,
  AlertCircle,
  ArrowRight,
  Filter,
  Plane
} from 'lucide-react';
import { userAPI, matchAPI } from '../../services/api';

interface TravelProfile {
  _id: string;
  name: string;
  age?: string;
  gender?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  upcomingTrips?: string[];
  profilePicture?: string;
  travelStyle?: string;
  languages?: string[];
  username?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const MOCK_PROFILES: TravelProfile[] = [];

const TravelMatch: React.FC = () => {
  const router = useRouter();
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, 0], [1, 0]);
  
  const [profiles, setProfiles] = useState<TravelProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<TravelProfile[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatch, setLastMatch] = useState<TravelProfile | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [interactedUserIds, setInteractedUserIds] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Load filter preferences from user profile
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [locationRange, setLocationRange] = useState<number>(500); // in km, default to 500 (show all)

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    checkProfile();
    fetchProfiles();
    fetchMatches();
    fetchInteractedUsers();
  }, []);

  // Reload preferences when page becomes visible (user returns from account page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkProfile(); // Reload profile and preferences
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchProfiles = async () => {
    try {
      const users = await userAPI.getAllUsers();
      console.log('Profiles loaded:', users.length);
      console.log('Sample profile coordinates:', users[0]?.coordinates);
      setProfiles(users);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const matchedUsers = await matchAPI.getMatches();
      setMatches(matchedUsers);
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  };

  const fetchInteractedUsers = async () => {
    try {
      const result = await matchAPI.getInteractedUsers();
      setInteractedUserIds(result.interactedUserIds || []);
      console.log('Interacted users loaded:', result.interactedUserIds?.length || 0);
    } catch (error) {
      console.error('Failed to load interacted users:', error);
    }
  };

  const checkProfile = async () => {
    try {
      const profile = await userAPI.getProfile();
      setUserProfile(profile);
      
      console.log('User profile loaded:', {
        name: profile.name,
        location: profile.location,
        coordinates: profile.coordinates
      });
      
      // Load match preferences from profile
      if (profile.matchPreferences) {
        setAgeRange(profile.matchPreferences.ageRange || [18, 60]);
        setSelectedTravelStyles(profile.matchPreferences.travelStyles || []);
        setSelectedInterests(profile.matchPreferences.interests || []);
        setSelectedGenders(profile.matchPreferences.genders || []);
        setLocationRange(profile.matchPreferences.locationRange || 500);
      }
      
      const isComplete = !!(
        profile.name &&
        profile.profilePicture &&
        profile.username
      );
      
      setProfileComplete(isComplete);
    } catch (error) {
      // Silently handle profile load errors
      setProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        handleLike();
      } else {
        handlePass();
      }
    }
  };

  const handleLike = async () => {
    if (currentIndex >= filteredProfiles.length) return;
    
    const likedProfile = filteredProfiles[currentIndex];
    
    // Add to interacted users immediately to prevent re-showing
    setInteractedUserIds(prev => [...prev, likedProfile._id]);
    
    try {
      const result = await matchAPI.likeUser(likedProfile._id);
      
      if (result.matched) {
        // It's a match!
        setMatches([...matches, likedProfile]);
        setLastMatch(likedProfile);
        setShowMatch(true);
        // Don't auto-close, let user interact with the modal
      } else {
        // Just liked, no match yet - smooth transition to next card
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          x.set(0);
        }, 200);
      }
    } catch (error) {
      console.error('Error liking user:', error);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        x.set(0);
      }, 200);
    }
  };

  const handlePass = async () => {
    if (currentIndex >= filteredProfiles.length) return;
    
    const passedProfile = filteredProfiles[currentIndex];
    
    // Add to interacted users immediately to prevent re-showing
    setInteractedUserIds(prev => [...prev, passedProfile._id]);
    
    try {
      await matchAPI.passUser(passedProfile._id);
    } catch (error) {
      console.error('Error passing user:', error);
    }
    
    // Smooth transition to next card
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      x.set(0);
    }, 200);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const previousProfile = filteredProfiles[currentIndex - 1];
      // Remove from interacted users to allow re-showing
      setInteractedUserIds(prev => prev.filter(id => id !== previousProfile._id));
      setCurrentIndex(currentIndex - 1);
      x.set(0);
    }
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    
    // Age range filter (only if not default)
    if (ageRange[0] !== 18 || ageRange[1] !== 60) count++;
    
    // Gender filter
    if (selectedGenders.length > 0 && !selectedGenders.includes('Any')) count++;
    
    // Travel style filter
    if (selectedTravelStyles.length > 0) count++;
    
    // Interests filter
    if (selectedInterests.length > 0) count++;
    
    // Location range filter (only if not default 500km)
    if (locationRange !== 500) count++;
    
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  const handleApplyFilters = (newFilters: FilterState) => {
    setAgeRange(newFilters.ageRange);
    setSelectedGenders(newFilters.selectedGenders);
    setSelectedTravelStyles(newFilters.selectedTravelStyles);
    setSelectedInterests(newFilters.selectedInterests);
    setLocationRange(newFilters.locationRange);
    setCurrentIndex(0); // Reset to first profile
  };

  // Navigation component that's always visible
  const NavigationBar = () => (
    <div className="relative z-10 max-w-md mx-auto px-4 py-6">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <button 
            onClick={() => setShowFilterModal(true)}
            className="relative flex-1 h-12 bg-gradient-to-br from-[#059467] to-[#047a55] rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-[#059467]/30 transition-all hover:scale-105 active:scale-95 group"
            title="Edit Match Filters"
          >
            <Filter className="w-5 h-5 text-white" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[24px] h-6 px-2 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => router.push('/map?tab=friends')}
            className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 group"
            title="View Map"
          >
            <MapPin className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-[#059467]" />
          </button>
          
          <button 
             onClick={() => router.push('/match/discover')}
            className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 group"
            title="View Matches"
          >
            <Users className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-[#059467]" />
          </button>
          
          <button 
            onClick={() => router.push('/messages')}
            className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 group"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-[#059467]" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="bg-[#f5f8f7] dark:bg-[#0f231d] text-slate-900 dark:text-slate-100 antialiased min-h-screen">
          <main className="w-full min-h-[calc(100vh-64px)] bg-[#f5f8f7] dark:bg-[#0f231d] relative">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f5f8f7] to-[#f1f5f9] dark:from-[#0f231d] dark:to-[#05100d] z-0"></div>
            
            {/* Topographic Pattern */}
            <div 
              className="absolute inset-0 opacity-50 z-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895 2 2 2z' fill='%23059467' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
              }}
            ></div>
            
            <NavigationBar />
            
            <div className="relative z-10 max-w-md mx-auto px-4 pb-6">
              {/* Card Skeleton */}
              <div className="relative h-[calc(100vh-320px)] max-h-[600px] min-h-[400px] mb-6">
                {/* Background cards */}
                <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl scale-90 opacity-30 translate-y-4 animate-pulse" />
                <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl scale-95 opacity-60 translate-y-2 animate-pulse" />
                
                {/* Main card */}
                <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                  {/* Image skeleton */}
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 animate-pulse relative">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
                    
                    {/* Info button skeleton */}
                    <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full animate-pulse"></div>

                    {/* Bottom info skeleton */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-end justify-between mb-4">
                        <div className="flex-1 space-y-3">
                          {/* Name skeleton */}
                          <div className="h-10 w-48 bg-white/20 backdrop-blur-sm rounded-lg animate-pulse"></div>
                          {/* Location skeleton */}
                          <div className="h-6 w-32 bg-white/20 backdrop-blur-sm rounded-lg animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-yellow-400 animate-pulse"></div>
                <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-red-500 animate-pulse"></div>
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-500 animate-pulse"></div>
                <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-emerald-500 animate-pulse"></div>
                <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-purple-500 animate-pulse"></div>
              </div>

              {/* Loading text */}
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#059467] animate-spin" />
                  <p className="text-[#0f231d] dark:text-white font-bold text-sm uppercase tracking-widest">
                    Finding Travel Buddies
                  </p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Loading profiles near you...
                </p>
              </div>
            </div>
          </main>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  if (!profileComplete) {
    return (
      <div className="bg-[#f5f8f7] dark:bg-[#0f231d] min-h-screen flex flex-col">
        <Header />
        <div className="relative flex-grow w-full overflow-hidden py-12">
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f5f8f7] to-[#f1f5f9] dark:from-[#0f231d] dark:to-[#05100d] z-0"></div>
          
          {/* Topographic Pattern */}
          <div 
            className="absolute inset-0 opacity-50 z-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059467' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }}
          ></div>
          
          <NavigationBar />
          
          <div className="relative z-10 w-full max-w-md mx-auto px-4 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 300px)' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#152e26] rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-white/5 w-full"
            >
              <div className="text-center mb-8">
                <div className="size-12 bg-[#0f231d]/5 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-5 text-[#0f231d] dark:text-white">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h2 className="text-[#0f231d] dark:text-white text-2xl font-bold leading-tight tracking-tight mb-2">
                  Complete Your Profile
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Before you can start matching with travel buddies, please complete your profile with the following information:
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-[#f5f8f7] dark:bg-[#0f231d] rounded-2xl border border-slate-200 dark:border-[#2a453b]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userProfile?.profilePicture ? 'bg-[#059467]/10 dark:bg-[#059467]/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <Camera className={`w-5 h-5 ${userProfile?.profilePicture ? 'text-[#059467]' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#0f231d] dark:text-white">Profile Picture</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {userProfile?.profilePicture ? '✓ Added' : 'Required'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#f5f8f7] dark:bg-[#0f231d] rounded-2xl border border-slate-200 dark:border-[#2a453b]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userProfile?.name ? 'bg-[#059467]/10 dark:bg-[#059467]/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <UserIcon className={`w-5 h-5 ${userProfile?.name ? 'text-[#059467]' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#0f231d] dark:text-white">Full Name</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {userProfile?.name ? '✓ Added' : 'Required'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#f5f8f7] dark:bg-[#0f231d] rounded-2xl border border-slate-200 dark:border-[#2a453b]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userProfile?.username ? 'bg-[#059467]/10 dark:bg-[#059467]/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <Sparkles className={`w-5 h-5 ${userProfile?.username ? 'text-[#059467]' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#0f231d] dark:text-white">Username</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {userProfile?.username ? '✓ Added' : 'Required'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/account')}
                className="w-full h-12 bg-[#059467] hover:bg-[#047a55] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#059467]/20 hover:shadow-[#059467]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Complete Profile
                <ArrowRight size={20} />
              </button>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                This helps other travelers know who they're connecting with
              </p>
            </motion.div>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    );
  }

  // Filter profiles based on all match preferences
  const filteredProfiles = profiles.filter(profile => {
    // 0. Exclude current user
    if (profile._id === userProfile?._id) {
      return false;
    }

    // 0.1. Exclude users already interacted with (liked or passed)
    if (interactedUserIds.includes(profile._id)) {
      return false;
    }

    // If no filters are active, show all nearby users (no filtering)
    if (!hasActiveFilters) {
      return true;
    }

    // Apply filters only when they are explicitly set
    
    // 1. Age Filter (only if age is set on profile and filter is not default)
    if (ageRange[0] !== 18 || ageRange[1] !== 60) {
      if (profile.age) {
        const profileAge = parseInt(profile.age);
        if (!isNaN(profileAge)) {
          if (profileAge < ageRange[0] || profileAge > ageRange[1]) {
            return false;
          }
        }
      }
    }

    // 2. Gender Filter (only if specific genders selected, not 'Any')
    if (selectedGenders.length > 0 && !selectedGenders.includes('Any')) {
      if (profile.gender && !selectedGenders.includes(profile.gender)) {
        return false;
      }
    }

    // 3. Travel Style Filter (only if styles selected)
    if (selectedTravelStyles.length > 0) {
      if (profile.travelStyle && !selectedTravelStyles.includes(profile.travelStyle)) {
        return false;
      }
    }

    // 4. Interests Filter (at least one common interest, only if interests selected)
    if (selectedInterests.length > 0) {
      if (profile.interests && profile.interests.length > 0) {
        const hasCommonInterest = profile.interests.some(interest => 
          selectedInterests.includes(interest)
        );
        if (!hasCommonInterest) {
          return false;
        }
      }
    }

    // 5. Location Range Filter (only if range is not max and both users have coordinates)
    if (locationRange < 500 && userProfile?.coordinates?.lat && userProfile?.coordinates?.lng) {
      if (profile.coordinates?.lat && profile.coordinates?.lng) {
        const distance = calculateDistance(
          userProfile.coordinates.lat,
          userProfile.coordinates.lng,
          profile.coordinates.lat,
          profile.coordinates.lng
        );
        
        if (distance > locationRange) {
          return false;
        }
      }
    }

    return true;
  });

  // Log filtering results for debugging
  console.log('Match filtering:', {
    totalProfiles: profiles.length,
    filteredProfiles: filteredProfiles.length,
    interactedUsers: interactedUserIds.length,
    activeFilters: activeFilterCount,
    hasActiveFilters,
    filters: {
      ageRange,
      selectedGenders,
      selectedTravelStyles,
      selectedInterests,
      locationRange
    },
    userHasLocation: !!(userProfile?.coordinates?.lat && userProfile?.coordinates?.lng)
  });

  const currentProfile = filteredProfiles[currentIndex];
  const hasInteractedWithAll = profiles.length > 0 && interactedUserIds.length >= (profiles.length - 1); // -1 for current user

  const handleRefreshMatches = async () => {
    try {
      // Clear interacted users from backend
      await matchAPI.resetInteractions();
      
      // Clear local state
      setInteractedUserIds([]);
      setCurrentIndex(0);
      
      // Refresh profiles
      await fetchProfiles();
      
      console.log('Match pool refreshed - all interactions cleared');
    } catch (error) {
      console.error('Failed to refresh matches:', error);
    }
  };

  const handleShowPreviouslyPassed = () => {
    // Show only previously passed users (not liked ones to avoid confusion)
    const passedUserIds = interactedUserIds.filter(id => {
      // This is a simplified approach - in a real app you'd track pass vs like separately
      return true; // For now, show all previously interacted users
    });
    
    // Reset interacted users to show them again
    setInteractedUserIds([]);
    setCurrentIndex(0);
  };

  if (!currentProfile && currentIndex >= filteredProfiles.length) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col">
        <Header />
        <div className="relative flex-grow w-full overflow-hidden py-12">
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f5f8f7] to-[#f1f5f9] dark:from-[#0f231d] dark:to-[#05100d] z-0"></div>
          
          {/* Topographic Pattern */}
          <div 
            className="absolute inset-0 opacity-50 z-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059467' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }}
          ></div>
          
          <NavigationBar />
          
          <div className="relative z-10 w-full max-w-md mx-auto px-4 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 300px)' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center w-full"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="mb-6"
              >
                <Sparkles className="w-20 h-20 text-[#059467] mx-auto" />
              </motion.div>
              <h3 className="text-[#0f231d] dark:text-white text-3xl font-black mb-3">
                {filteredProfiles.length === 0 ? "No Matches Found" : "That's Everyone!"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-base font-medium mb-3">
                {filteredProfiles.length === 0 
                  ? "Try adjusting your filters to see more potential matches"
                  : hasInteractedWithAll 
                    ? "You've seen all available profiles. Try refreshing or adjusting your filters."
                    : "Check back later for new travel buddies"
                }
              </p>
              
              {/* Debug info */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 shadow-lg"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white">Total profiles</div>
                    <div className="text-2xl font-black text-[#059467]">{profiles.length}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white">Filtered</div>
                    <div className="text-2xl font-black text-[#059467]">{filteredProfiles.length}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white">Interacted</div>
                    <div className="text-2xl font-black text-[#059467]">{interactedUserIds.length}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white">Active filters</div>
                    <div className="text-2xl font-black text-[#059467]">{activeFilterCount}</div>
                  </div>
                </div>
              </motion.div>
              
              <div className="flex flex-col gap-3">
                {hasInteractedWithAll && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRefreshMatches}
                    className="h-14 px-8 bg-gradient-to-r from-[#059467] to-[#047a55] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#059467]/30 hover:shadow-xl hover:shadow-[#059467]/40 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Refresh Match Pool
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentIndex(0)}
                  className="h-14 px-8 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0f231d] dark:text-white rounded-2xl font-bold text-base shadow-lg border-2 border-slate-200 dark:border-slate-700 transition-all"
                >
                  Start Over
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilterModal(true)}
                  className="h-14 px-8 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0f231d] dark:text-white rounded-2xl font-bold text-base shadow-lg border-2 border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Adjust Filters
                </motion.button>
                
                {activeFilterCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => {
                      // Reset all filters to defaults
                      setAgeRange([18, 60]);
                      setSelectedTravelStyles([]);
                      setSelectedInterests([]);
                      setSelectedGenders([]);
                      setLocationRange(500);
                      setCurrentIndex(0);
                    }}
                    className="h-14 px-8 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all"
                  >
                    Clear All Filters
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-[#f5f8f7] dark:bg-[#0f231d] text-slate-900 dark:text-slate-100 antialiased min-h-screen">
        {/* Main Content */}
        <main className="w-full min-h-[calc(100vh-64px)] bg-[#f5f8f7] dark:bg-[#0f231d] relative">
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f5f8f7] to-[#f1f5f9] dark:from-[#0f231d] dark:to-[#05100d] z-0"></div>
          
          {/* Topographic Pattern */}
          <div 
            className="absolute inset-0 opacity-50 z-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059467' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }}
          ></div>
          
          <NavigationBar />
          
          <div className="relative z-10 max-w-md mx-auto px-4 pb-6">
            {/* Card Container */}
            <div className="relative h-[calc(100vh-320px)] max-h-[600px] min-h-[400px] mb-6">
              {currentIndex >= filteredProfiles.length ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#059467]/5 via-emerald-50/50 to-teal-50/50 dark:from-slate-800/50 dark:via-slate-800/30 dark:to-slate-700/50 rounded-3xl border-2 border-dashed border-[#059467]/30 dark:border-slate-600 text-center backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    <Sparkles className="w-20 h-20 text-[#059467] dark:text-emerald-400 mb-6" />
                  </motion.div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 px-6">
                    {filteredProfiles.length === 0 ? "No Matches Found" : "That's Everyone!"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 text-center px-8 text-base">
                    {filteredProfiles.length === 0 
                      ? "Try adjusting your filters to see more potential matches"
                      : "Check back later for new travel buddies nearby"
                    }
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentIndex(0)}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#059467] to-[#047a55] text-white px-8 py-4 rounded-2xl font-bold text-base hover:shadow-xl hover:shadow-[#059467]/30 transition-all"
                  >
                    <RotateCcw size={20} /> Start Over
                  </motion.button>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {/* Background cards for stack effect */}
                  {currentIndex + 2 < filteredProfiles.length && (
                    <motion.div 
                      key={`bg-2-${currentIndex}`}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 0.90, opacity: 0.3 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl translate-y-4 border border-slate-200 dark:border-slate-700" 
                    />
                  )}
                  {currentIndex + 1 < filteredProfiles.length && (
                    <motion.div 
                      key={`bg-1-${currentIndex}`}
                      initial={{ scale: 0.90, opacity: 0 }}
                      animate={{ scale: 0.95, opacity: 0.6 }}
                      exit={{ scale: 0.90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl translate-y-2 border border-slate-200 dark:border-slate-700" 
                    />
                  )}

                  {/* Main profile card */}
                  <motion.div
                    key={currentProfile._id}
                    style={{ x, rotate, opacity }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ 
                      scale: 0.95, 
                      opacity: 0,
                      transition: { duration: 0.2 }
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 30,
                      mass: 0.8
                    }}
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border-2 border-white/20 dark:border-slate-700/50"
                  >
                    <div className="relative h-full">
                      <img
                        src={currentProfile.profilePicture || 'https://i.pravatar.cc/800?img=' + Math.floor(Math.random() * 70)}
                        alt={currentProfile.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Gradient overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
                      
                      {/* Swipe indicators */}
                      <motion.div
                        style={{ opacity: likeOpacity }}
                        className="absolute top-12 right-8 transform rotate-12"
                      >
                        <div className="bg-gradient-to-br from-emerald-400 to-green-600 text-white px-8 py-4 rounded-2xl font-black text-3xl border-4 border-white shadow-2xl backdrop-blur-sm">
                          LIKE
                        </div>
                      </motion.div>
                      <motion.div
                        style={{ opacity: nopeOpacity }}
                        className="absolute top-12 left-8 transform -rotate-12"
                      >
                        <div className="bg-gradient-to-br from-red-400 to-rose-600 text-white px-8 py-4 rounded-2xl font-black text-3xl border-4 border-white shadow-2xl backdrop-blur-sm">
                          NOPE
                        </div>
                      </motion.div>

                      {/* Profile info button */}
                      <button 
                        onClick={() => currentProfile.username && router.push(`/profile/${currentProfile.username}`)}
                        className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 hover:bg-white/30 hover:scale-110 transition-all shadow-lg hover:shadow-xl"
                        title="View Profile"
                      >
                        <Info className="w-6 h-6 text-white drop-shadow-lg" />
                      </button>

                      {/* Profile details */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-end justify-between">
                          <div className="flex-1">
                            <h2 className="text-5xl font-black mb-3 drop-shadow-2xl tracking-tight">
                              {currentProfile.name}
                              {currentProfile.age && (
                                <span className="text-4xl font-semibold ml-3 opacity-90">{currentProfile.age}</span>
                              )}
                            </h2>
                            
                            {/* Distance indicator */}
                            {userProfile?.coordinates?.lat && userProfile?.coordinates?.lng && 
                             currentProfile.coordinates?.lat && currentProfile.coordinates?.lng && (
                              <div className="flex items-center gap-2 text-xl drop-shadow-lg">
                                <MapPin size={22} className="flex-shrink-0" />
                                <span className="font-semibold">
                                  {(() => {
                                    const distance = calculateDistance(
                                      userProfile.coordinates.lat,
                                      userProfile.coordinates.lng,
                                      currentProfile.coordinates.lat,
                                      currentProfile.coordinates.lng
                                    );
                                    
                                    if (distance < 1) {
                                      return `${Math.round(distance * 1000)}m away`;
                                    } else {
                                      return `${Math.round(distance)}km away`;
                                    }
                                  })()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Action Buttons */}
            {currentIndex < filteredProfiles.length && (
              <div className="flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleUndo}
                  disabled={currentIndex === 0}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center hover:shadow-lg hover:shadow-amber-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                  title="Undo"
                >
                  <RotateCcw size={22} className="text-white" strokeWidth={2.5} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePass}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center hover:shadow-xl hover:shadow-red-500/50 transition-all shadow-lg"
                  title="Pass"
                >
                  <X size={36} className="text-white" strokeWidth={3} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/50 transition-all shadow-md"
                  title="Super Like"
                >
                  <Star size={22} className="text-white" fill="currentColor" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center hover:shadow-xl hover:shadow-emerald-500/50 transition-all shadow-lg"
                  title="Like"
                >
                  <Heart size={36} className="text-white" fill="currentColor" strokeWidth={0} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-all shadow-md"
                  title="Boost"
                >
                  <Zap size={22} className="text-white" fill="currentColor" />
                </motion.button>
              </div>
            )}

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#059467]" />
                    Active Filters
                  </span>
                  <span className="text-xs font-semibold text-[#059467] bg-[#059467]/10 px-3 py-1 rounded-full">
                    {filteredProfiles.length} {filteredProfiles.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(ageRange[0] !== 18 || ageRange[1] !== 60) && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-[#059467] to-[#047a55] text-white rounded-full text-xs font-semibold shadow-sm">
                      Age: {ageRange[0]}-{ageRange[1]}
                    </span>
                  )}
                  {selectedGenders.length > 0 && !selectedGenders.includes('Any') && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-[#059467] to-[#047a55] text-white rounded-full text-xs font-semibold shadow-sm">
                      Gender: {selectedGenders.join(', ')}
                    </span>
                  )}
                  {selectedTravelStyles.length > 0 && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-[#059467] to-[#047a55] text-white rounded-full text-xs font-semibold shadow-sm">
                      Style: {selectedTravelStyles.length} selected
                    </span>
                  )}
                  {selectedInterests.length > 0 && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-[#059467] to-[#047a55] text-white rounded-full text-xs font-semibold shadow-sm">
                      Interests: {selectedInterests.length}
                    </span>
                  )}
                  {locationRange !== 500 && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-[#059467] to-[#047a55] text-white rounded-full text-xs font-semibold shadow-sm">
                      Range: {locationRange === 0 ? 'Nearby' : `${locationRange}km`}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Match Success Overlay */}
            {showMatch && lastMatch && userProfile && (
              <MatchSuccess
                isOpen={showMatch}
                onClose={() => {
                  setShowMatch(false);
                  setCurrentIndex(currentIndex + 1);
                  x.set(0);
                }}
                onSendMessage={() => {
                  router.push(`/messages?user=${lastMatch._id}`);
                }}
                matchedUser={{
                  name: lastMatch.name,
                  profilePicture: lastMatch.profilePicture,
                }}
                currentUser={{
                  name: userProfile.name,
                  profilePicture: userProfile.profilePicture,
                }}
              />
            )}

            {/* Filter Modal */}
            <MatchFilterModal
              isOpen={showFilterModal}
              onClose={() => setShowFilterModal(false)}
              onApply={handleApplyFilters}
              initialFilters={{
                ageRange,
                selectedGenders,
                selectedTravelStyles,
                selectedInterests,
                locationRange,
              }}
            />
          </div>
        </main>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
};

export default function ProtectedTravelMatch() {
  return (
    <ProtectedRoute>
      <TravelMatch />
    </ProtectedRoute>
  );
}
