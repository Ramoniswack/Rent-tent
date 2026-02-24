'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Settings,
  MessageSquare,
  Compass
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
  followers?: string[];
}

const LANGUAGE_FLAGS: Record<string, string> = {
  'English': '🇺🇸', 'Spanish': '🇪🇸', 'French': '🇫🇷', 'German': '🇩🇪',
  'Italian': '🇮🇹', 'Portuguese': '🇵🇹', 'Mandarin': '🇨🇳', 'Japanese': '🇯🇵',
  'Korean': '🇰🇷', 'Hindi': '🇮🇳', 'Arabic': '🇸🇦', 'Russian': '🇷🇺',
  'Nepali': '🇳🇵', 'Indonesian': '🇮🇩'
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

  const isOwnProfile = useMemo(() => {
    return currentUser?.username === username || currentUser?.username === profile?.username;
  }, [currentUser, username, profile]);

  const checkStatus = useCallback(async (targetId: string) => {
    try {
      setCheckingMatch(true);
      const [matches, followStatus] = await Promise.all([
        matchAPI.getMatches(),
        userAPI.getFollowStatus(targetId)
      ]);
      
      const matched = matches.some((m: any) => m._id === targetId || m.user?._id === targetId);
      setIsMatched(matched);
      setIsConnected(followStatus.isFollowing);
      setConnectionCount(followStatus.followerCount);
    } catch (err) {
      console.error('Status check failed:', err);
    } finally {
      setCheckingMatch(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const user = await userAPI.getUserByUsername(username);
      setProfile(user);
      setConnectionCount(user.followers?.length || 0);
      await checkStatus(user._id);
    } catch (err: any) {
      setError(err.message || 'User not found');
    } finally {
      setLoading(false);
    }
  }, [username, checkStatus]);

  useEffect(() => {
    if (username) fetchProfile();
  }, [fetchProfile]);

  const handleConnect = async () => {
    if (!profile) return;
    try {
      const result = isConnected 
        ? await userAPI.unfollowUser(profile._id) 
        : await userAPI.followUser(profile._id);
      
      setIsConnected(!isConnected);
      setConnectionCount(result.followerCount);
    } catch (err: any) {
      alert(err.message || 'Connection update failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900 dark:text-[#059467]" />
        <p className="font-black text-[#059467] animate-pulse text-xs tracking-widest uppercase">Syncing Explorer Profile...</p>
      </div>
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <Compass className="w-16 h-16 mx-auto text-slate-300 animate-bounce" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Profile Lost at Sea</h2>
          <p className="text-slate-500">{error || 'This explorer has vanished from our logs.'}</p>
          <button onClick={() => router.push('/home')} className="px-8 py-3 bg-[#059467] text-white rounded-2xl font-black">Return Home</button>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f8f7] to-white dark:from-[#0f231d] dark:to-[#0d1c17] selection:bg-[#059467] selection:text-white">
      <Header />
      
      <main className="pb-20 animate-fadeIn">
        {/* Cover Hero */}
        <div className="relative h-72 md:h-96 w-full overflow-hidden">
          {profile.coverPhoto ? (
            <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#059467] to-[#047854] opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Profile Identity Card */}
        <div className="max-w-5xl mx-auto px-4 relative -mt-24 md:-mt-32">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-white/5">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar Section */}
              <div className="relative group shrink-0">
                <div className="w-36 h-36 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl bg-slate-100 transition-transform duration-500 group-hover:scale-105">
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#059467] flex items-center justify-center text-white text-6xl font-black">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#059467] rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                  <Check className="w-5 h-5 text-white stroke-[4px]" />
                </div>
              </div>

              {/* Info & Actions */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{profile.name}</h1>
                  <p className="text-[#059467] font-black uppercase tracking-[0.2em] text-sm">@{profile.username}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 dark:text-slate-400 font-bold text-sm">
                  {profile.location && <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl"><MapPin size={14} className="text-[#059467]" />{profile.location}</div>}
                  {profile.age && <span>• {profile.age} Yrs</span>}
                  {profile.gender && <span>• {profile.gender}</span>}
                </div>

                <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed italic">"{profile.bio || 'Adventure is out there, just waiting to be logged.'}"</p>

                <div className="flex flex-wrap gap-3 pt-4 justify-center md:justify-start">
                  {isOwnProfile ? (
                    <button onClick={() => router.push('/account?tab=profile')} className="px-8 py-3.5 bg-[#059467] text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:bg-[#06ac77] transition-all active:scale-95">
                      <Edit size={18} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button onClick={handleConnect} className={`px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg ${isConnected ? 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white' : 'bg-[#059467] text-white shadow-emerald-500/20'}`}>
                        {isConnected ? <><Check size={18} /> Following</> : <><UserPlus size={18} /> Connect</>}
                      </button>
                      {isMatched && (
                        <button onClick={() => router.push(`/messages?user=${profile._id}`)} className="px-8 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 text-slate-700 dark:text-white rounded-2xl font-black flex items-center gap-2 hover:bg-slate-50 transition-all">
                          <MessageSquare size={18} /> Message
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex md:flex-col gap-10 md:gap-6 text-center md:border-l border-slate-100 dark:border-white/5 md:pl-10">
                <div className="group cursor-pointer">
                  <div className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-[#059467] transition-colors">{profile.stats?.trips || 0}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trips</div>
                </div>
                <div className="group cursor-pointer">
                  <div className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-[#059467] transition-colors">{connectionCount}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Connections</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
            {/* Sidebar Info */}
            <div className="lg:col-span-4 space-y-8">
              <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-white/5">
                <h3 className="text-xl font-black dark:text-white mb-6 flex items-center gap-3"><Compass className="text-[#059467]" /> Explorer DNA</h3>
                <div className="space-y-6">
                  {profile.travelStyle && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Primary Style</span>
                      <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-[#059467] rounded-xl text-sm font-black">{profile.travelStyle}</span>
                    </div>
                  )}
                  {profile.languages && profile.languages.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Communication</span>
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map(lang => (
                          <div key={lang} className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-white/5">
                            <span className="text-base">{LANGUAGE_FLAGS[lang] || '🌐'}</span>
                            <span className="text-xs font-bold dark:text-white">{lang}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">
              {/* Interests Pill Box */}
              {profile.interests && profile.interests.length > 0 && (
                <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-white/5">
                  <h3 className="text-xl font-black dark:text-white mb-6 flex items-center gap-3"><Heart className="text-[#059467]" /> Passions</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.interests.map(interest => (
                      <span key={interest} className="px-5 py-2.5 bg-[#059467] text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/10 hover:scale-105 transition-transform cursor-default">
                        #{interest.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Expedition Log (Upcoming Trips) */}
              {profile.upcomingTrips && profile.upcomingTrips.length > 0 && (
                <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-white/5">
                  <h3 className="text-xl font-black dark:text-white mb-6 flex items-center gap-3"><Plane className="text-[#059467]" /> Next Expeditions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.upcomingTrips.map((trip, idx) => (
                      <div key={idx} className="group p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-emerald-500/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                            <MapPin className="text-[#059467]" size={20} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 dark:text-white truncate max-w-[150px]">{trip.destination || trip}</h4>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              {trip.startDate ? new Date(trip.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Setting Dates...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}