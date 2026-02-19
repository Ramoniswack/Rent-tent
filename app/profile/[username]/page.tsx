'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import {
  MapPin,
  Check,
  Mail,
  UserPlus,
  User,
  Luggage,
  Globe,
  Heart,
  Calendar,
  Camera,
  Loader2
} from 'lucide-react';
import { userAPI } from '../../../services/api';

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
  upcomingTrips?: string[];
  photos?: string[];
  stats?: {
    countries: number;
    checkIns: number;
  };
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

const LANGUAGE_LEVELS: { [key: string]: string } = {
  'English': 'Fluent',
  'Spanish': 'Conversational',
  'French': 'Basic',
  'German': 'Learning',
  'Italian': 'Learning',
  'Portuguese': 'Basic',
  'Mandarin': 'Learning',
  'Japanese': 'Basic',
  'Korean': 'Learning',
  'Hindi': 'Conversational',
  'Arabic': 'Learning',
  'Russian': 'Basic',
  'Nepali': 'Conversational',
  'Indonesian': 'Learning'
};

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      // TODO: Replace with actual API call to get user by username
      const users = await userAPI.getAllUsers();
      const user = users.find((u: any) => u.username === username);
      
      if (user) {
        setProfile({
          ...user,
          stats: {
            countries: 24,
            checkIns: 112
          },
          photos: []
        });
      } else {
        setError('User not found');
      }
    } catch (err: any) {
      // Silently handle all profile fetch errors
      const errorMessage = err?.message || 'Failed to load profile';
      setError(errorMessage);
      // Don't re-throw - just set error state
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow/unfollow API call
  };

  const handleMessage = () => {
    // TODO: Navigate to messages with this user
    window.location.href = `/messages?user=${profile?._id}`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#059467]" />
            <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">Loading Profile...</p>
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
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
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
      
      <main className="bg-[#f5f8f7] dark:bg-[#0f231d] pb-20">
        {/* Hero Section with Cover Photo */}
        <div className="relative h-[450px] w-full px-4 pt-4">
          <div className="w-full h-full rounded-b-[40px] overflow-hidden relative shadow-2xl">
            <img
              src={profile.coverPhoto || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=450&fit=crop"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f231d]/60 to-transparent"></div>
          </div>

          {/* Profile Info Overlay */}
          <div className="max-w-7xl mx-auto px-8 relative">
            <div className="absolute -bottom-16 flex items-end gap-8">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-[6px] border-[#059467] shadow-xl overflow-hidden bg-white">
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
                {/* Verified Badge */}
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#059467] rounded-full border-4 border-white flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Name and Location */}
              <div className="mb-4">
                <h2 className="text-4xl font-extrabold text-white drop-shadow-md">{profile.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  {profile.location && (
                    <div className="flex items-center gap-1 text-white/90 font-medium text-lg">
                      <MapPin className="w-5 h-5 text-[#059467] bg-white rounded-full p-0.5" />
                      {profile.location}
                    </div>
                  )}
                  {(profile.gender || profile.age) && (
                    <span className="text-white/70 font-medium">
                      {profile.gender && profile.age ? `${profile.gender}, ${profile.age}` : profile.gender || profile.age}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute -bottom-12 right-8 flex gap-3">
              <button
                onClick={handleFollow}
                className={`px-6 py-2.5 font-bold rounded-full shadow-lg transition-all flex items-center gap-2 ${
                  isFollowing
                    ? 'bg-white text-[#0f231d] hover:bg-slate-100'
                    : 'bg-[#059467] text-white shadow-[#059467]/30 hover:bg-[#047854]'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={handleMessage}
                className="px-6 py-2.5 bg-white text-[#0f231d] font-bold rounded-full shadow-lg hover:bg-[#f5f8f7] transition-all flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#059467]" />
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-8 mt-28 grid grid-cols-12 gap-8">
          {/* Sidebar (Left, 30%) */}
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Bio and Details Card */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-[#059467]/5">
              {/* Bio Section */}
              <section className="mb-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                  <User className="w-5 h-5 text-[#059467]" />
                  Bio
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {profile.bio || 'No bio available'}
                </p>
              </section>

              {/* Travel Style Section */}
              {profile.travelStyle && (
                <section className="mb-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <Luggage className="w-5 h-5 text-[#059467]" />
                    Travel Style
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 bg-[#059467]/10 text-[#059467] text-xs font-bold rounded-full border border-[#059467]/20">
                      {profile.travelStyle}
                    </span>
                  </div>
                </section>
              )}

              {/* Languages Section */}
              {profile.languages && profile.languages.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <Globe className="w-5 h-5 text-[#059467]" />
                    Languages
                  </h3>
                  <ul className="space-y-3">
                    {profile.languages.map((language) => (
                      <li key={language} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-4 bg-slate-200 dark:bg-slate-700 rounded-sm overflow-hidden flex items-center justify-center text-[10px] font-bold">
                            {LANGUAGE_FLAGS[language] || '🌐'}
                          </span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{language}</span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                          {LANGUAGE_LEVELS[language] || 'Learning'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Travel Stats Card */}
            <div className="bg-[#059467] p-8 rounded-[40px] text-white shadow-lg shadow-[#059467]/20">
              <h3 className="text-lg font-bold mb-4">Travel Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-2xl font-black">{profile.stats?.countries || 0}</p>
                  <p className="text-xs font-medium text-white/70">Countries</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-2xl font-black">{profile.stats?.checkIns || 0}</p>
                  <p className="text-xs font-medium text-white/70">Check-ins</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content (Right, 70%) */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Travel Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Heart className="w-6 h-6 text-[#059467]" />
                    Travel Interests
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-6 py-2 bg-[#059467] text-white rounded-full text-sm font-bold shadow-sm"
                    >
                      #{interest}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Trips */}
            {profile.upcomingTrips && profile.upcomingTrips.length > 0 && (
              <section>
                <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Calendar className="w-6 h-6 text-[#059467]" />
                  Upcoming Trips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.upcomingTrips.map((trip, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-[#059467]/5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-[#059467]/10 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-[#059467]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0f231d] dark:text-white">{trip}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Upcoming</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Travel Moments Gallery */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Camera className="w-6 h-6 text-[#059467]" />
                  Travel Moments
                </h3>
              </div>
              
              {profile.photos && profile.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.photos.map((photo, index) => (
                    <div key={index} className="aspect-square rounded-[24px] overflow-hidden shadow-sm">
                      <img
                        src={photo}
                        alt={`Travel moment ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-[#059467]/5">
                  <Camera className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No photos shared yet</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
