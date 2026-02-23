'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import {
  MapPin,
  Check,
  Mail,
  UserPlus,
  Globe,
  Heart,
  Plane,
  Loader2,
  Edit,
  Settings
} from 'lucide-react';
import { userAPI, matchAPI } from '../../../services/api';

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  age?: string;
  gender?: string;
  languages?: string[];
  interests?: string[];
  travelStyle?: string;
  upcomingTrips?: any[];
  photos?: string[];
  stats?: {
    trips: number;
    connections: number;
  };
  followers?: number;
}

const LANGUAGE_FLAGS: { [key: string]: string } = {
  'English': '🇺🇸',
  'Spanish': '🇪🇸',
  'French': '🇫🇷',
  'German': '🇩🇪',
  'Italian': '🇮🇹',
  'Portuguese': '🇵🇹',
  'Mandarin': '🇨🇳',
  'Japanese': '🇯🇵',
  'Korean': '🇰🇷',
  'Hindi': '🇮🇳',
  'Arabic': '🇸🇦',
  'Russian': '🇷🇺',
  'Nepali': '🇳🇵',
  'Indonesian': '🇮🇩'
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [checkingMatch, setCheckingMatch] = useState(true);
  const [connectionCount, setConnectionCount] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkMatchStatus();
  }, [username]);

  useEffect(() => {
    // Check if viewing own profile
    if (currentUser && profile) {
      setIsOwnProfile(currentUser.username === profile.username || currentUser.username === username);
    }
  }, [currentUser, profile, username]);

  const checkMatchStatus = async () => {
    try {
      setCheckingMatch(true);
      const matches = await matchAPI.getMatches();
      const users = await userAPI.getAllUsers();
      const targetUser = users.find((u: any) => u.username === username);
      
      if (targetUser) {
        const isMatch = matches.some((match: any) => 
          match._id === targetUser._id || match.user?._id === targetUser._id
        );
        setIsMatched(isMatch);
        
        // Check connection status
        try {
          const followStatus = await userAPI.getFollowStatus(targetUser._id);
          setIsConnected(followStatus.isFollowing);
          setConnectionCount(followStatus.followerCount);
        } catch (error) {
          console.error('Error checking connection status:', error);
        }
      }
    } catch (error) {
      console.error('Error checking match status:', error);
    } finally {
      setCheckingMatch(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch user by username using the new endpoint
      try {
        const user = await userAPI.getUserByUsername(username);
        
        // Get real connection count from user data
        const realConnectionCount = user.followers?.length || 0;
        setConnectionCount(realConnectionCount);
        
        setProfile({
          ...user,
          stats: {
            trips: user.upcomingTrips?.length || 0,
            connections: realConnectionCount
          },
          followers: realConnectionCount,
          photos: []
        });
      } catch (apiError: any) {
        // If the new endpoint fails, fall back to the old method
        console.log('Falling back to getAllUsers method');
        const users = await userAPI.getAllUsers();
        const user = users.find((u: any) => u.username === username);
        
        if (user) {
          // Get real connection count from user data
          const realConnectionCount = user.followers?.length || 0;
          setConnectionCount(realConnectionCount);
          
          setProfile({
            ...user,
            stats: {
              trips: user.upcomingTrips?.length || 0,
              connections: realConnectionCount
            },
            followers: realConnectionCount,
            photos: []
          });
        } else {
          setError('User not found');
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!profile) return;
    
    try {
      console.log('Connect button clicked, current state:', isConnected);
      
      if (isConnected) {
        // Disconnect
        const result = await userAPI.unfollowUser(profile._id);
        setIsConnected(false);
        setConnectionCount(result.followerCount);
        setProfile({
          ...profile,
          stats: {
            ...profile.stats!,
            connections: result.followerCount
          },
          followers: result.followerCount
        });
      } else {
        // Connect
        const result = await userAPI.followUser(profile._id);
        setIsConnected(true);
        setConnectionCount(result.followerCount);
        setProfile({
          ...profile,
          stats: {
            ...profile.stats!,
            connections: result.followerCount
          },
          followers: result.followerCount
        });
      }
      
      console.log('Connect action completed successfully');
    } catch (error: any) {
      console.error('Error connecting/disconnecting user:', error);
      alert(error.message || 'Failed to update connection status');
    }
  };

  const handleMessage = () => {
    router.push(`/messages?user=${profile?._id}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#f5f8f7] via-white to-[#e8f5f1] dark:from-[#0f231d] dark:via-[#152e26] dark:to-[#0f231d] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#059467]" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#f5f8f7] via-white to-[#e8f5f1] dark:from-[#0f231d] dark:via-[#152e26] dark:to-[#0f231d] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Profile Not Found</h2>
            <p className="text-slate-500 dark:text-slate-400">{error || 'This user does not exist'}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-[#f5f8f7] via-white to-[#e8f5f1] dark:from-[#0f231d] dark:via-[#152e26] dark:to-[#0f231d] pb-24 md:pb-20">
        {/* Cover Photo */}
        <div className="relative h-64 md:h-80 w-full bg-gradient-to-br from-[#059467] to-[#047854]">
          {profile.coverPhoto && (
            <img
              src={profile.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Profile Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative">
          {/* Profile Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden bg-white">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center text-white text-5xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#059467] rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  {profile.name}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  {profile.location && (
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">{profile.location}</span>
                    </div>
                  )}
                  {profile.age && (
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {profile.age} years old
                    </span>
                  )}
                  {profile.gender && (
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {profile.gender}
                    </span>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {isOwnProfile ? (
                    // Show Edit Profile button for own profile
                    <button
                      onClick={() => router.push('/account?tab=profile')}
                      className="px-6 py-2.5 bg-[#059467] text-white rounded-full font-bold hover:bg-[#047a55] transition-all flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    // Show Connect button for other profiles
                    <button
                      onClick={handleConnect}
                      className={`px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
                        isConnected
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          : 'bg-[#059467] text-white hover:bg-[#047a55]'
                      }`}
                    >
                      {isConnected ? (
                        <>
                          <Check className="w-4 h-4" />
                          Connected
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                  )}
                  
                  {isOwnProfile ? (
                    // Show Settings button for own profile
                    <button
                      onClick={() => router.push('/account?tab=settings')}
                      className="px-6 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  ) : isMatched ? (
                    <button
                      onClick={handleMessage}
                      className="px-6 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Message
                    </button>
                  ) : !checkingMatch && (
                    <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full font-medium text-sm flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Match to message
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex md:flex-col gap-8 md:gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {profile.stats?.trips || 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Trips
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {profile.stats?.connections || profile.followers || 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Connections
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Travel Style */}
              {profile.travelStyle && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-[#059467]" />
                    Travel Style
                  </h3>
                  <span className="inline-block px-4 py-2 bg-[#059467]/10 text-[#059467] rounded-full text-sm font-semibold">
                    {profile.travelStyle}
                  </span>
                </div>
              )}

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#059467]" />
                    Languages
                  </h3>
                  <div className="space-y-2">
                    {profile.languages.map((language) => (
                      <div key={language} className="flex items-center gap-2">
                        <span className="text-lg">{LANGUAGE_FLAGS[language] || '🌐'}</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {language}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#059467]" />
                    Travel Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-4 py-2 bg-[#059467] text-white rounded-full text-sm font-semibold"
                      >
                        #{interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Trips */}
              {profile.upcomingTrips && profile.upcomingTrips.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-[#059467]" />
                    Upcoming Trips
                  </h3>
                  <div className="space-y-3">
                    {profile.upcomingTrips.map((trip, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#059467]/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-[#059467]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {trip.destination || trip}
                          </h4>
                          {trip.startDate && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(trip.startDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
