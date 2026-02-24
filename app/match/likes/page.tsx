'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  Heart, 
  Send,
  MapPin, 
  ArrowLeft,
  Clock,
  X,
  User as UserIcon,
  Search
} from 'lucide-react';
import { matchAPI } from '../../../services/api';

interface User {
  _id: string;
  name: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  age?: string;
  gender?: string;
  location?: string;
  interests?: string[];
  travelStyle?: string;
  totalConnections?: number;
}

interface LikeItem {
  user: User;
  likedAt: string;
}

type TabType = 'liked-you' | 'sent';

const LikesPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('liked-you');
  const [likedYou, setLikedYou] = useState<LikeItem[]>([]);
  const [sentLikes, setSentLikes] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      setLoading(true);
      const [likedYouData, sentLikesData] = await Promise.all([
        matchAPI.getLikes(),
        matchAPI.getSentLikes()
      ]);
      
      setLikedYou(likedYouData);
      setSentLikes(sentLikesData);
    } catch (error) {
      console.error('Failed to load likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (userId: string) => {
    try {
      const result = await matchAPI.likeUser(userId);
      if (result.matched) {
        setLikedYou(prev => prev.filter(item => item.user._id !== userId));
        router.push('/match/discover');
      }
    } catch (error) {
      console.error('Failed to like user:', error);
    }
  };

  const handlePass = async (userId: string) => {
    try {
      await matchAPI.passUser(userId);
      setLikedYou(prev => prev.filter(item => item.user._id !== userId));
    } catch (error) {
      console.error('Failed to pass user:', error);
    }
  };

  const handleCancelLike = async (userId: string) => {
    try {
      await matchAPI.cancelConnection(userId);
      setSentLikes(prev => prev.filter(item => item.user._id !== userId));
    } catch (error) {
      console.error('Failed to cancel like:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const UserCard: React.FC<{ item: LikeItem; type: 'liked-you' | 'sent' }> = ({ item, type }) => {
    const { user, likedAt } = item;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-[2rem] shadow-sm hover:shadow-xl dark:shadow-none border border-slate-200/80 dark:border-slate-700/50 overflow-hidden transition-all duration-300 flex flex-col"
      >
        {/* Image Header Section */}
        <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=400`}
            alt={user.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80" />
          
          {/* Time badge */}
          <div className="absolute top-4 right-4 bg-white/20 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/30 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-[11px] font-bold tracking-wide uppercase">{formatTimeAgo(likedAt)}</span>
          </div>

          {/* User info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h3 className="text-2xl font-black tracking-tight mb-1 drop-shadow-md">
              {user.name}
              {user.age && <span className="text-xl font-medium opacity-90 ml-2">{user.age}</span>}
            </h3>
            {user.location && (
              <div className="flex items-center gap-1.5 text-sm font-medium opacity-90 drop-shadow-md">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col">
          {user.bio ? (
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
              "{user.bio}"
            </p>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-4 italic">
              No bio provided.
            </p>
          )}

          {/* Interests Pill Badges */}
          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
              {user.interests.slice(0, 3).map((interest, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-[#059467] dark:text-emerald-400 rounded-lg text-[11px] font-bold tracking-wide border border-emerald-100 dark:border-emerald-800/30"
                >
                  {interest}
                </span>
              ))}
              {user.interests.length > 3 && (
                <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[11px] font-bold tracking-wide border border-slate-200 dark:border-slate-700">
                  +{user.interests.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {type === 'liked-you' ? (
            <div className="flex gap-3 mt-auto pt-2">
              <button
                onClick={() => handlePass(user._id)}
                className="w-14 h-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-500 hover:text-rose-500 dark:text-slate-400 rounded-xl transition-all flex items-center justify-center border border-slate-200 dark:border-slate-700"
                title="Pass"
              >
                <X className="w-6 h-6" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => handleLikeBack(user._id)}
                className="flex-1 h-12 bg-gradient-to-r from-[#059467] to-[#047a55] hover:from-[#047a55] hover:to-[#036644] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(5,148,103,0.5)] hover:shadow-[0_8px_25px_-6px_rgba(5,148,103,0.6)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <Heart className="w-5 h-5" fill="currentColor" strokeWidth={0} />
                Match Now
              </button>
            </div>
          ) : (
            <div className="flex gap-3 mt-auto pt-2">
              <button
                onClick={() => handleCancelLike(user._id)}
                className="w-14 h-12 flex-shrink-0 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 rounded-xl transition-all flex items-center justify-center border border-slate-200 dark:border-slate-700"
                title="Cancel Like"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => router.push(`/profile/${user.username}`)}
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserIcon className="w-4 h-4" />
                View Profile
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const EmptyState: React.FC<{ type: TabType }> = ({ type }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-24 px-6 relative"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative">
        <div className="w-24 h-24 bg-white dark:bg-slate-800 shadow-xl rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-slate-50 dark:border-slate-900/50">
          {type === 'liked-you' ? (
            <Heart className="w-10 h-10 text-rose-400" fill="currentColor" />
          ) : (
            <Send className="w-10 h-10 text-emerald-500" />
          )}
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
          {type === 'liked-you' ? "It's quiet... too quiet." : "You haven't liked anyone yet."}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">
          {type === 'liked-you' 
            ? 'Your profile is out there! Keep swiping and matching to increase your visibility.'
            : 'Don\'t be shy. Head over to the match screen and find your perfect travel buddy.'
          }
        </p>
        <button
          onClick={() => router.push('/match')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#059467] to-[#047a55] hover:from-[#047a55] hover:to-[#036644] text-white rounded-xl font-bold text-base shadow-lg shadow-[#059467]/30 hover:shadow-xl hover:shadow-[#059467]/40 transition-all hover:-translate-y-0.5"
        >
          <Search className="w-5 h-5" />
          Start Discovering
        </button>
      </div>
    </motion.div>
  );

  const currentList = activeTab === 'liked-you' ? likedYou : sentLikes;

  return (
    <>
      <Header />
      <div className="bg-[#f8faf9] dark:bg-[#0b1713] min-h-screen">
        <main className="w-full min-h-[calc(100vh-64px)] relative">
          {/* Subtle Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent z-0 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-6 font-semibold text-sm bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#059467] to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3">
                  <Heart className="w-7 h-7 text-white" fill="currentColor" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Connections
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                    See who likes you and manage your sent likes
                  </p>
                </div>
              </div>

              {/* Premium Glassmorphism Tabs */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-2 border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
                <div className="flex relative">
                  {/* Sliding Indicator */}
                  <div 
                    className="absolute top-0 bottom-0 w-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-md transition-transform duration-300 ease-out border border-slate-100 dark:border-slate-700"
                    style={{ transform: activeTab === 'liked-you' ? 'translateX(0%)' : 'translateX(100%)' }}
                  />
                  
                  <button
                    onClick={() => setActiveTab('liked-you')}
                    className={`relative flex-1 h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-colors z-10 ${
                      activeTab === 'liked-you' ? 'text-[#059467] dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={activeTab === 'liked-you' ? 'currentColor' : 'none'} />
                    Liked You
                    {likedYou.length > 0 && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${
                        activeTab === 'liked-you' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-[#059467] dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {likedYou.length}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('sent')}
                    className={`relative flex-1 h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-colors z-10 ${
                      activeTab === 'sent' ? 'text-[#059467] dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    Sent Likes
                    {sentLikes.length > 0 && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${
                        activeTab === 'sent' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-[#059467] dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {sentLikes.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            {loading ? (
              // Realistic Skeleton Loader
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-[2rem] overflow-hidden">
                    <div className="h-64 bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="p-5">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2 animate-pulse" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-6 animate-pulse" />
                      <div className="flex gap-3">
                        <div className="w-14 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                        <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentList.length === 0 ? (
              <EmptyState type={activeTab} />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {currentList.map((item) => (
                    <UserCard key={item.user._id} item={item} type={activeTab} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </main>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
};

export default function ProtectedLikesPage() {
  return (
    <ProtectedRoute>
      <LikesPage />
    </ProtectedRoute>
  );
}