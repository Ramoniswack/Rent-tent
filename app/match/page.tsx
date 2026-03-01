'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import MatchSuccess from '../../components/MatchSuccess';
import MatchFilterModal, { FilterState } from '../../components/MatchFilterModal';
import {
  Heart, X, MapPin, Users, Sparkles, Info, MessageCircle,
  RotateCcw, Star, Camera, User as UserIcon, AlertCircle, ArrowRight,
  Filter, CheckCircle2
} from 'lucide-react';
import { userAPI, matchAPI } from '../../services/api';

interface TravelProfile {
  _id?: string;
  id?: string;
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
  coordinates?: { lat: number; lng: number; };
}

const TravelMatch: React.FC = () => {
  const router = useRouter();

  const x = useMotionValue(0);
  // TanTan style physics: More aggressive rotation
  const rotate = useTransform(x, [-300, 300], [-20, 20]);

  // Stamps appear much quicker (between 10px and 100px drag) for instant feedback
  const likeOpacity = useTransform(x, [10, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-10, -100], [0, 1]);
  const likeScale = useTransform(x, [10, 100], [0.5, 1]);
  const nopeScale = useTransform(x, [-10, -100], [0.5, 1]);

  const [profiles, setProfiles] = useState<TravelProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatch, setLastMatch] = useState<TravelProfile | null>(null);

  // Debug: Log when showMatch or lastMatch changes
  useEffect(() => {
    console.log('showMatch changed:', showMatch);
    console.log('lastMatch changed:', lastMatch);
  }, [showMatch, lastMatch]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // FIX: Separate past session IDs from current session tracking
  const [pastInteractedIds, setPastInteractedIds] = useState<string[]>([]);
  const [currentSessionInteractions, setCurrentSessionInteractions] = useState<string[]>([]);

  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [locationRange, setLocationRange] = useState<number>(500);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    let isMounted = true;

    const initializePage = async () => {
      try {
        // Load all data in parallel
        const [profileResult, profilesResult, interactedResult] = await Promise.all([
          userAPI.getProfile().catch(() => null),
          userAPI.getAllUsers().catch(() => []),
          matchAPI.getInteractedUsers().catch(() => ({ interactedUserIds: [] }))
        ]);

        if (!isMounted) return;

        // Batch all state updates together
        const updates = () => {
          // Set profile data
          if (profileResult) {
            setUserProfile(profileResult);
            if (profileResult.matchPreferences) {
              setAgeRange(profileResult.matchPreferences.ageRange || [18, 60]);
              setSelectedTravelStyles(profileResult.matchPreferences.travelStyles || []);
              setSelectedInterests(profileResult.matchPreferences.interests || []);
              setSelectedGenders(profileResult.matchPreferences.genders || []);
              setLocationRange(profileResult.matchPreferences.locationRange || 500);
            }
            setProfileComplete(!!(profileResult.name && profileResult.profilePicture && profileResult.username));
          } else {
            setProfileComplete(false);
          }

          // Set profiles and interactions
          setProfiles(profilesResult);
          setPastInteractedIds(interactedResult.interactedUserIds || []);
          
          // Mark initialization complete
          setIsInitializing(false);
        };

        updates();
      } catch (error) {
        console.error('Failed to initialize page:', error);
        if (isMounted) {
          setProfileComplete(false);
          setIsInitializing(false);
        }
      }
    };

    initializePage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Programmatic physical swipe out animation
  const swipeOut = async (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? window.innerWidth : -window.innerWidth;

    // Fast, springy physical exit
    await animate(x, targetX, {
      type: "spring",
      stiffness: 400,
      damping: 25,
      restDelta: 1
    });

    // Reset position before updating index to prevent flicker
    x.set(0);
    // Small delay to ensure smooth transition
    await new Promise(resolve => setTimeout(resolve, 50));
    setCurrentIndex(prev => prev + 1);
  };

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const swipeThreshold = 100;

    if (info.offset.x > swipeThreshold) {
      handleLike();
    } else if (info.offset.x < -swipeThreshold) {
      handlePass();
    } else {
      // User let go before threshold. Spring back to center.
      animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
    }
  };

  const handleLike = async () => {
    if (currentIndex >= filteredProfiles.length) return;
    const likedProfile = filteredProfiles[currentIndex];
    const profileId = likedProfile._id || likedProfile.id;
    if (!profileId) return;

    try {
      // Start animation and API call simultaneously
      const animationPromise = swipeOut('right');
      const apiPromise = matchAPI.likeUser(profileId);

      // Wait for API response
      const result = await apiPromise;
      console.log('Like result:', result);

      // Wait for animation to complete
      await animationPromise;

      // Check for match and show modal
      if (result.matched && result.matchedUser) {
        console.log('Match detected! Showing modal with:', result.matchedUser);
        // Use setTimeout to ensure state updates happen after animation completes
        setTimeout(() => {
          setLastMatch(result.matchedUser);
          setShowMatch(true);
        }, 100);
      } else {
        console.log('No match - result.matched:', result.matched, 'result.matchedUser:', result.matchedUser);
      }
      setCurrentSessionInteractions(prev => [...prev, profileId]);
    } catch (error) {
      console.error('Error in handleLike:', error);
    }
  };

  const handlePass = async () => {
    if (currentIndex >= filteredProfiles.length) return;
    const passedProfile = filteredProfiles[currentIndex];
    const profileId = passedProfile._id || passedProfile.id;
    if (!profileId) return;

    // Animate instantly
    swipeOut('left');

    try {
      await matchAPI.passUser(profileId);
      setCurrentSessionInteractions(prev => [...prev, profileId]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUndo = async () => {
    if (currentIndex > 0) {
      const previousProfile = filteredProfiles[currentIndex - 1];
      setCurrentSessionInteractions(prev => prev.filter(id => id !== previousProfile._id));

      // Setup the card far left, then spring it into the center
      x.set(-window.innerWidth);
      setCurrentIndex(prev => prev - 1);

      animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (ageRange[0] !== 18 || ageRange[1] !== 60) count++;
    if (selectedGenders.length > 0 && !selectedGenders.includes('Any')) count++;
    if (selectedTravelStyles.length > 0) count++;
    if (selectedInterests.length > 0) count++;
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
    setCurrentIndex(0);
  };

  const handleRefreshMatches = async () => {
    try {
      await matchAPI.resetInteractions();
      setPastInteractedIds([]);
      setCurrentSessionInteractions([]);
      setCurrentIndex(0);
      const users = await userAPI.getAllUsers();
      setProfiles(users);
    } catch (error) {
      console.error('Failed to refresh matches:', error);
    }
  };

  const NavigationBar = () => (
    <div className={`relative max-w-md mx-auto px-4 py-6 ${showFilterModal || showMatch ? 'z-0' : 'z-20'}`}>
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40 dark:border-slate-700/50 p-2">
        <div className="flex items-center justify-between gap-1">
          <button onClick={() => setShowFilterModal(true)} className="relative w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#059467]/10 transition-colors group">
            <Filter className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-[#059467]" />
            {activeFilterCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button onClick={() => router.push('/match/likes')} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#059467]/10 transition-colors group">
            <Heart className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-[#059467]" />
          </button>
          <button onClick={() => router.push('/map?tab=friends')} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#059467]/10 transition-colors group">
            <MapPin className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-[#059467]" />
          </button>
          <button onClick={() => router.push('/match/discover')} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#059467]/10 transition-colors group">
            <Users className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-[#059467]" />
          </button>
          <button onClick={() => router.push('/messages')} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#059467]/10 transition-colors group">
            <MessageCircle className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-[#059467]" />
          </button>
        </div>
      </div>
    </div>
  );

  const PageLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#f8faf9] dark:bg-[#0b1713] text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
      <Header />
      <main className="w-full flex-grow relative overflow-hidden flex flex-col pb-20 md:pb-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent z-0 pointer-events-none"></div>
        <div className="absolute inset-0 opacity-30 z-0 pointer-events-none mix-blend-multiply dark:mix-blend-screen" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23059467' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
        <NavigationBar />
        <div className="relative z-10 flex-grow max-w-md w-full mx-auto px-4 pb-8 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );

  // Show skeleton while loading
  if (isInitializing) {
    return (
      <div className="bg-[#f8faf9] dark:bg-[#0b1713] text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
        <Header />
        <main className="w-full flex-grow relative overflow-hidden flex flex-col pb-20 md:pb-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent z-0 pointer-events-none"></div>
          <div className="absolute inset-0 opacity-30 z-0 pointer-events-none mix-blend-multiply dark:mix-blend-screen" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23059467' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
          
          {/* Navigation Bar Skeleton */}
          <div className="relative max-w-md mx-auto px-4 py-6 z-20">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40 dark:border-slate-700/50 p-2">
              <div className="flex items-center justify-between gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-slate-200/50 dark:bg-slate-700/50 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex-grow max-w-md w-full mx-auto px-4 pb-8 flex flex-col">
            <div className="relative flex-grow min-h-[500px] mb-8 flex flex-col justify-center">
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 rounded-[2rem] scale-90 translate-y-6" />
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 rounded-[2rem] scale-95 translate-y-3" />
              <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 dark:border-slate-700/50">
                <div className="w-full h-full bg-slate-100 dark:bg-slate-700/50 animate-pulse relative">
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/20 to-transparent h-48 flex flex-col justify-end">
                    <div className="h-8 w-48 bg-white/30 rounded-lg mb-3"></div>
                    <div className="h-5 w-32 bg-white/30 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profileComplete) {
    return (
      <PageLayout>
        <motion.div 
          key="profile-incomplete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-grow flex items-center justify-center"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-xl p-8 border border-white/60 dark:border-slate-700/50 w-full">
            <div className="text-center mb-10">
              <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-[#059467] dark:text-emerald-400" />
              </div>
              <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight mb-3">Let's Get Ready</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Complete your profile to start finding your perfect travel buddies.</p>
            </div>
            <div className="space-y-3 mb-10">
              {[
                { icon: Camera, label: "Profile Picture", done: !!userProfile?.profilePicture },
                { icon: UserIcon, label: "Full Name", done: !!userProfile?.name },
                { icon: Sparkles, label: "Username", done: !!userProfile?.username }
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${item.done ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.done ? 'bg-[#059467] text-white shadow-md shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${item.done ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{item.label}</p>
                  </div>
                  {item.done ? <CheckCircle2 className="w-6 h-6 text-[#059467]" /> : <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200/50 dark:bg-slate-700 px-2 py-1 rounded-md">Required</span>}
                </div>
              ))}
            </div>
            <button onClick={() => router.push('/account')} className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group">
              Complete Profile <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </PageLayout>
    );
  }

  // Notice we use pastInteractedIds here! This prevents the array from shrinking when we swipe.
  const filteredProfiles = profiles.filter(profile => {
    const profileId = profile._id || profile.id;
    if (profileId === userProfile?._id) return false;
    if (profileId && pastInteractedIds.includes(profileId)) return false;
    if (!hasActiveFilters) return true;

    if (ageRange[0] !== 18 || ageRange[1] !== 60) {
      if (profile.age) {
        const profileAge = parseInt(profile.age);
        if (!isNaN(profileAge) && (profileAge < ageRange[0] || profileAge > ageRange[1])) return false;
      }
    }
    if (selectedGenders.length > 0 && !selectedGenders.includes('Any') && profile.gender && !selectedGenders.includes(profile.gender)) return false;
    if (selectedTravelStyles.length > 0 && profile.travelStyle && !selectedTravelStyles.includes(profile.travelStyle)) return false;
    if (selectedInterests.length > 0 && profile.interests && profile.interests.length > 0) {
      if (!profile.interests.some(interest => selectedInterests.includes(interest))) return false;
    }
    if (locationRange < 500 && userProfile?.coordinates?.lat && userProfile?.coordinates?.lng && profile.coordinates?.lat && profile.coordinates?.lng) {
      const distance = calculateDistance(userProfile.coordinates.lat, userProfile.coordinates.lng, profile.coordinates.lat, profile.coordinates.lng);
      if (distance > locationRange) return false;
    }
    return true;
  });

  const currentProfile = filteredProfiles[currentIndex];
  // Calculate if we've seen everyone based on array length
  const hasSeenAll = currentIndex >= filteredProfiles.length;

  return (
    <PageLayout>
      <motion.div 
        key="match-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative flex-grow flex flex-col justify-center h-[calc(100vh-280px)] min-h-[450px]"
      >
        {hasSeenAll ? (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full h-full flex flex-col items-center justify-center bg-white/50 dark:bg-slate-800/30 backdrop-blur-md rounded-[2rem] border border-slate-200 dark:border-slate-700/50 text-center p-8 shadow-sm">
            <div className="size-24 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-[#059467] dark:text-emerald-400" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              {filteredProfiles.length === 0 ? "No Matches Found" : "You're All Caught Up!"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">
              {filteredProfiles.length === 0 ? "Try adjusting your filters to discover more travelers." : "You've seen everyone nearby. Check back later for new buddies."}
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
              {filteredProfiles.length > 0 && (
                <button onClick={handleRefreshMatches} className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  <RotateCcw className="w-5 h-5" /> Start Over Again
                </button>
              )}
              <button onClick={() => setShowFilterModal(true)} className="w-full h-14 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <Filter className="w-5 h-5" /> Adjust Filters
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="relative w-full h-full">
            {/* Static Background Stack Cards - No animation, just visual depth */}
            {currentIndex + 2 < filteredProfiles.length && (
              <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[2rem] shadow-md border border-slate-200 dark:border-slate-700/50 scale-90 translate-y-6 opacity-40" />
            )}
            {currentIndex + 1 < filteredProfiles.length && (
              <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg border border-slate-200 dark:border-slate-700/50 scale-95 translate-y-3 opacity-80" />
            )}

            <AnimatePresence initial={false}>
              {/* Main Active Card */}
              <motion.div
                key={currentProfile._id || currentProfile.id}
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden cursor-grab active:cursor-grabbing border-2 border-white/50 dark:border-slate-700/50"
              >
                <img 
                  src={currentProfile.profilePicture || `https://i.pravatar.cc/800?img=${Math.abs((currentProfile._id || currentProfile.id || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 70}`} 
                  alt={currentProfile.name} 
                  className="w-full h-full object-cover pointer-events-none" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

                {/* Physical Stamps */}
                <motion.div style={{ opacity: likeOpacity, scale: likeScale }} className="absolute top-10 right-8 transform rotate-[15deg] pointer-events-none">
                  <div className="text-emerald-500 px-6 py-2 rounded-xl font-black text-4xl border-[4px] border-emerald-500 uppercase tracking-widest backdrop-blur-sm bg-white/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]">LIKE</div>
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity, scale: nopeScale }} className="absolute top-10 left-8 transform -rotate-[15deg] pointer-events-none">
                  <div className="text-rose-500 px-6 py-2 rounded-xl font-black text-4xl border-[4px] border-rose-500 uppercase tracking-widest backdrop-blur-sm bg-white/10 shadow-[0_0_20px_rgba(244,63,94,0.3)]">NOPE</div>
                </motion.div>

                <button onClick={() => currentProfile.username && router.push(`/profile/${currentProfile.username}`)} className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-black/40 transition-colors z-50">
                  <Info className="w-5 h-5 text-white" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-6 pt-20 text-white pointer-events-none">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black drop-shadow-md tracking-tight leading-none">
                      {currentProfile.name}
                      {currentProfile.age && <span className="font-medium text-3xl opacity-90 ml-3">{currentProfile.age}</span>}
                    </h2>
                    {userProfile?.coordinates?.lat && currentProfile.coordinates?.lat && (
                      <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-max text-sm font-medium border border-white/30 shadow-sm">
                        <MapPin size={16} />
                        {calculateDistance(userProfile.coordinates.lat, userProfile.coordinates.lng, currentProfile.coordinates.lat, currentProfile.coordinates.lng) < 1
                          ? `${Math.round(calculateDistance(userProfile.coordinates.lat, userProfile.coordinates.lng, currentProfile.coordinates.lat, currentProfile.coordinates.lng) * 1000)}m away`
                          : `${Math.round(calculateDistance(userProfile.coordinates.lat, userProfile.coordinates.lng, currentProfile.coordinates.lat, currentProfile.coordinates.lng))}km away`}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <div className="mt-8 mb-4">
        <div className={`flex items-center justify-center gap-4 transition-opacity duration-300 ${hasSeenAll ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleUndo} disabled={currentIndex === 0} className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-700 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50 transition-colors">
            <RotateCcw size={22} strokeWidth={2.5} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePass} className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(244,63,94,0.4)] border border-rose-100 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            <X size={32} strokeWidth={3} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLike} className="w-20 h-20 rounded-full bg-[#059467] flex items-center justify-center shadow-[0_10px_35px_-10px_rgba(5,148,103,0.6)] border-4 border-white dark:border-slate-900 text-white transition-transform">
            <Heart size={36} fill="currentColor" strokeWidth={0} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-700 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
            <Star size={22} fill="currentColor" />
          </motion.button>
        </div>
      </div>

      {(() => {
        const shouldShow = showMatch && lastMatch && userProfile;
        console.log('MatchSuccess render check:', { showMatch, hasLastMatch: !!lastMatch, hasUserProfile: !!userProfile, shouldShow });
        return shouldShow ? (
          <MatchSuccess
            key={lastMatch._id || lastMatch.id}
            isOpen={showMatch}
            onClose={() => { 
              console.log('Closing match modal');
              setShowMatch(false); 
              setLastMatch(null); 
            }}
            onSendMessage={() => { 
              console.log('Sending message to:', lastMatch);
              setShowMatch(false); 
              setLastMatch(null); 
              router.push(`/messages?user=${lastMatch._id || lastMatch.id}`); 
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
        ) : null;
      })()}

      <MatchFilterModal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} onApply={handleApplyFilters} initialFilters={{ ageRange, selectedGenders, selectedTravelStyles, selectedInterests, locationRange }} />
    </PageLayout>
  );
};

export default function ProtectedTravelMatch() {
  return (
    <ProtectedRoute>
      <TravelMatch />
    </ProtectedRoute>
  );
}