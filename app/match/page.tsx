'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
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
        
        setTimeout(() => {
          setShowMatch(false);
          setCurrentIndex(currentIndex + 1);
          x.set(0);
        }, 2000);
      } else {
        // Just liked, no match yet
        setCurrentIndex(currentIndex + 1);
        x.set(0);
      }
    } catch (error) {
      console.error('Error liking user:', error);
      setCurrentIndex(currentIndex + 1);
      x.set(0);
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
    
    setCurrentIndex(currentIndex + 1);
    x.set(0);
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

  if (loading) {
    return (
      <div className="bg-[#f5f8f7] dark:bg-[#0f231d] text-slate-900 dark:text-slate-100 antialiased flex flex-col h-screen">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Skeleton */}
          <aside className="w-[280px] bg-[#f8fcfb] dark:bg-[#132a24] border-r border-slate-100 dark:border-slate-800 flex flex-col h-full shrink-0 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#059467]/10 p-2 rounded-xl text-[#059467]">
                  <Plane className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">NomadNotes</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Travel Match</p>
                </div>
              </div>
              
              <nav className="flex flex-col gap-2">
                {/* Skeleton tabs */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </nav>
            </div>

            <div className="mt-auto p-6">
              <div className="bg-[#059467]/5 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content with Loading Spinner */}
          <main className="flex-1 overflow-y-auto bg-[#f5f8f7] dark:bg-[#0f231d] relative">
            <div className="relative w-full h-full min-h-[600px] flex items-center justify-center">
              {/* Background Gradients */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f5f8f7] to-[#f1f5f9] dark:from-[#0f231d] dark:to-[#05100d] z-0"></div>
              
              {/* Topographic Pattern */}
              <div 
                className="absolute inset-0 opacity-50 z-0 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059467' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
                }}
              ></div>
              
              <div className="relative z-10 text-center">
                <Sparkles className="w-12 h-12 animate-spin text-[#059467] mx-auto mb-4" />
                <p className="text-[#0f231d] dark:text-white font-bold text-sm uppercase tracking-widest">
                  Loading...
                </p>
              </div>
            </div>
          </main>
        </div>
        
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    );
  }

  if (!profileComplete) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col">
        <Header />
        <div className="relative flex-grow w-full flex items-center justify-center overflow-hidden py-12">
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f5f8f7] to-[#f1f5f9] dark:from-[#0f231d] dark:to-[#05100d] z-0"></div>
          
          {/* Topographic Pattern */}
          <div 
            className="absolute inset-0 opacity-50 z-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059467' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }}
          ></div>
          
          <div className="relative z-10 w-full max-w-md mx-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#152e26] rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-white/5"
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

    // 1. Age Filter
    if (profile.age) {
      const profileAge = parseInt(profile.age);
      if (!isNaN(profileAge)) {
        if (profileAge < ageRange[0] || profileAge > ageRange[1]) {
          return false;
        }
      }
    }

    // 2. Gender Filter
    if (selectedGenders.length > 0 && !selectedGenders.includes('Any')) {
      if (!profile.gender || !selectedGenders.includes(profile.gender)) {
        return false;
      }
    }

    // 3. Travel Style Filter
    if (selectedTravelStyles.length > 0) {
      if (!profile.travelStyle || !selectedTravelStyles.includes(profile.travelStyle)) {
        return false;
      }
    }

    // 4. Interests Filter (at least one common interest)
    if (selectedInterests.length > 0) {
      if (!profile.interests || profile.interests.length === 0) {
        return false;
      }
      const hasCommonInterest = profile.interests.some(interest => 
        selectedInterests.includes(interest)
      );
      if (!hasCommonInterest) {
        return false;
      }
    }

    // 5. Location Range Filter
    if (userProfile?.coordinates?.lat && userProfile?.coordinates?.lng) {
      // Skip if profile doesn't have coordinates
      if (!profile.coordinates?.lat || !profile.coordinates?.lng) {
        return false; // Don't show profiles without location
      }
      
      // Calculate distance
      const distance = calculateDistance(
        userProfile.coordinates.lat,
        userProfile.coordinates.lng,
        profile.coordinates.lat,
        profile.coordinates.lng
      );
      
      // Filter by location range
      if (distance > locationRange) {
        return false;
      }
    }

    return true;
  });

  // Log filtering results for debugging
  console.log('Match filtering:', {
    totalProfiles: profiles.length,
    filteredProfiles: filteredProfiles.length,
    interactedUsers: interactedUserIds.length,
    activeFilters: getActiveFilterCount()
  });

  const currentProfile = filteredProfiles[currentIndex];
  const activeFilterCount = getActiveFilterCount();

  if (!currentProfile && currentIndex >= filteredProfiles.length) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col">
        <Header />
        <div className="relative flex-grow w-full flex items-center justify-center overflow-hidden py-12">
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f5f8f7] to-[#f1f5f9] dark:from-[#0f231d] dark:to-[#05100d] z-0"></div>
          
          {/* Topographic Pattern */}
          <div 
            className="absolute inset-0 opacity-50 z-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059467' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }}
          ></div>
          
          <div className="relative z-10 w-full max-w-md mx-4">
            <div className="text-center">
            <Sparkles className="w-20 h-20 text-[#059467] mx-auto mb-4 animate-pulse" />
            <h3 className="text-[#0f231d] dark:text-white text-2xl font-bold mb-2">
              {filteredProfiles.length === 0 ? "No Matches Found" : "That's Everyone!"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
              {filteredProfiles.length === 0 
                ? "Try adjusting your filters to see more potential matches"
                : "Check back later for new travel buddies"
              }
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setCurrentIndex(0)}
                className="h-12 px-8 bg-[#059467] hover:bg-[#047a55] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#059467]/20 hover:shadow-[#059467]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Start Over
              </button>
              <button
                onClick={() => router.push('/account?tab=preferences')}
                className="h-12 px-8 bg-white dark:bg-[#152e26] hover:bg-slate-50 dark:hover:bg-[#1a3730] text-[#0f231d] dark:text-white rounded-2xl font-bold text-base shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Adjust Filters
              </button>
            </div>
          </div>
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
      <div className="bg-[#f5f8f7] dark:bg-[#0f231d] text-slate-900 dark:text-slate-100 antialiased overflow-hidden h-[calc(100vh-64px)]">
      {/* Main Content */}
      <main className="w-full h-full overflow-y-auto bg-[#f5f8f7] dark:bg-[#0f231d] relative">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f5f8f7] to-[#f1f5f9] dark:from-[#0f231d] dark:to-[#05100d] z-0"></div>
        
        {/* Topographic Pattern */}
        <div 
          className="absolute inset-0 opacity-50 z-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059467' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="relative z-10 max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              TravelMatch
            </h1>
            <button 
              onClick={() => router.push('/account?tab=preferences')}
              className="relative w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-110 group"
              title="Edit Match Filters"
            >
              <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-[#059467]" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#059467] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all">
              <Users className="w-5 h-5 text-slate-600" />
            </button>
            <button 
              onClick={() => router.push('/messages')}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"
            >
              <MessageCircle className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active Filters:</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {filteredProfiles.length} {filteredProfiles.length === 1 ? 'match' : 'matches'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {(ageRange[0] !== 18 || ageRange[1] !== 60) && (
                <span className="px-2 py-1 bg-[#059467]/10 text-[#059467] rounded-full font-medium">
                  Age: {ageRange[0]}-{ageRange[1]}
                </span>
              )}
              {selectedGenders.length > 0 && !selectedGenders.includes('Any') && (
                <span className="px-2 py-1 bg-[#059467]/10 text-[#059467] rounded-full font-medium">
                  Gender: {selectedGenders.join(', ')}
                </span>
              )}
              {selectedTravelStyles.length > 0 && (
                <span className="px-2 py-1 bg-[#059467]/10 text-[#059467] rounded-full font-medium">
                  Style: {selectedTravelStyles.join(', ')}
                </span>
              )}
              {selectedInterests.length > 0 && (
                <span className="px-2 py-1 bg-[#059467]/10 text-[#059467] rounded-full font-medium">
                  Interests: {selectedInterests.length}
                </span>
              )}
              {locationRange !== 500 && (
                <span className="px-2 py-1 bg-[#059467]/10 text-[#059467] rounded-full font-medium">
                  Range: {locationRange === 0 ? 'Nearby' : `${locationRange}km`}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="relative h-[calc(100vh-280px)] max-h-[650px] mb-6">
          {currentIndex >= filteredProfiles.length ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 rounded-3xl border-2 border-dashed border-pink-200">
              <Sparkles className="w-20 h-20 text-pink-400 mb-4 animate-pulse" />
              <h3 className="text-3xl font-black text-slate-900 mb-2">
                {filteredProfiles.length === 0 ? "No Matches Found" : "That's Everyone!"}
              </h3>
              <p className="text-slate-600 mb-6 text-center px-8">
                {filteredProfiles.length === 0 
                  ? "Try adjusting your filters to see more potential matches"
                  : "Check back later for new travel buddies nearby"
                }
              </p>
              <button
                onClick={() => setCurrentIndex(0)}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all transform hover:scale-105"
              >
                <RotateCcw size={20} /> Replay
              </button>
            </div>
          ) : (
            <>
              {currentIndex + 2 < filteredProfiles.length && (
                <div className="absolute inset-0 bg-white rounded-3xl shadow-xl scale-90 opacity-30 translate-y-4" />
              )}
              {currentIndex + 1 < filteredProfiles.length && (
                <div className="absolute inset-0 bg-white rounded-3xl shadow-xl scale-95 opacity-60 translate-y-2" />
              )}

              <motion.div
                key={currentProfile._id}
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
              >
                <div className="relative h-full">
                  <img
                    src={currentProfile.profilePicture || 'https://i.pravatar.cc/800?img=' + Math.floor(Math.random() * 70)}
                    alt={currentProfile.name}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
                  
                  <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute top-12 right-8 transform rotate-12"
                  >
                    <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-3xl border-4 border-white shadow-2xl">
                      LIKE
                    </div>
                  </motion.div>
                  <motion.div
                    style={{ opacity: nopeOpacity }}
                    className="absolute top-12 left-8 transform -rotate-12"
                  >
                    <div className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-3xl border-4 border-white shadow-2xl">
                      NOPE
                    </div>
                  </motion.div>

                  <button 
                    onClick={() => currentProfile.username && router.push(`/profile/${currentProfile.username}`)}
                    className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all"
                    title="View Profile"
                  >
                    <Info className="w-6 h-6 text-white" />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-end justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-4xl font-black mb-3 drop-shadow-lg">
                          {currentProfile.name}
                          {currentProfile.age && (
                            <span className="text-3xl font-normal ml-2">{currentProfile.age}</span>
                          )}
                        </h2>
                        
                        {/* Distance from user - only show if both have coordinates */}
                        {userProfile?.coordinates?.lat && userProfile?.coordinates?.lng && 
                         currentProfile.coordinates?.lat && currentProfile.coordinates?.lng && (
                          <div className="flex items-center gap-2 text-lg drop-shadow">
                            <MapPin size={20} className="flex-shrink-0" />
                            <span className="font-medium">
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
            </>
          )}
        </div>

        {currentIndex < filteredProfiles.length && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleUndo}
              disabled={currentIndex === 0}
              className="w-14 h-14 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center hover:bg-yellow-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
              title="Undo"
            >
              <RotateCcw size={22} className="text-yellow-500" />
            </button>
            
            <button
              onClick={handlePass}
              className="w-16 h-16 rounded-full bg-white border-2 border-red-500 flex items-center justify-center hover:bg-red-50 transition-all shadow-xl hover:scale-110 active:scale-95"
              title="Pass"
            >
              <X size={32} className="text-red-500" strokeWidth={3} />
            </button>

            <button
              className="w-12 h-12 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center hover:bg-blue-50 transition-all shadow-lg hover:scale-110 active:scale-95"
              title="Super Like"
            >
              <Star size={20} className="text-blue-500" fill="currentColor" />
            </button>

            <button
              onClick={handleLike}
              className="w-16 h-16 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center hover:bg-emerald-50 transition-all shadow-xl hover:scale-110 active:scale-95"
              title="Like"
            >
              <Heart size={32} className="text-emerald-500" fill="currentColor" strokeWidth={0} />
            </button>

            <button
              className="w-14 h-14 rounded-full bg-white border-2 border-purple-500 flex items-center justify-center hover:bg-purple-50 transition-all shadow-lg hover:scale-110 active:scale-95"
              title="Boost"
            >
              <Zap size={22} className="text-purple-500" fill="currentColor" />
            </button>
          </div>
        )}

        <AnimatePresence>
          {showMatch && lastMatch && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Heart className="w-10 h-10 text-white" fill="white" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  It's a Match!
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  You and {lastMatch.name} both want to connect
                </p>
                <button
                  onClick={() => router.push(`/messages?user=${lastMatch._id}`)}
                  className="w-full h-12 bg-[#059467] hover:bg-[#047a55] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#059467]/20 hover:shadow-[#059467]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mb-3"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowMatch(false)}
                  className="w-full h-12 text-[#0f231d] dark:text-white rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-[#0f231d] transition-all border border-slate-200 dark:border-[#2a453b]"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
