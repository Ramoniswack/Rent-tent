'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Search,
  Sparkles
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

  const fetchLikes = useCallback(async () => {
    try {
      setLoading(true);
      const [likedYouData, sentLikesData] = await Promise.all([
        matchAPI.getLikes(),
        matchAPI.getSentLikes()
      ]);
      setLikedYou(likedYouData);
      setSentLikes(sentLikesData);
    } catch (error) {
      console.error('Failed to load nomad connection data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const handleLikeBack = async (userId: string) => {
    try {
      const result = await matchAPI.likeUser(userId);
      if (result.matched) {
        // Remove from current list locally for instant feedback
        setLikedYou(prev => prev.filter(item => item.user._id !== userId));
        router.push('/match/discover');
      }
    } catch (error) {
      console.error('Failed to finalize match:', error);
    }
  };

  const handlePass = async (userId: string) => {
    try {
      await matchAPI.passUser(userId);
      setLikedYou(prev => prev.filter(item => item.user._id !== userId));
    } catch (error) {
      console.error('Failed to pass:', error);
    }
  };

  const handleCancelLike = async (userId: string) => {
    try {
      await matchAPI.cancelConnection(userId);
      setSentLikes(prev => prev.filter(item => item.user._id !== userId));
    } catch (error) {
      console.error('Failed to retract interest:', error);
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

  const UserCard: React.FC<{ item: LikeItem; type: TabType }> = ({ item, type }) => {
    const { user, likedAt } = item;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden transition-all duration-500 flex flex-col"
      >
        <div className="relative h-72 overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img
            src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059467&color=fff&size=400`}
            alt={user.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/10 to-transparent" />
          
          <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/30 shadow-lg">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-white text-[10px] font-black uppercase tracking-widest">{formatTimeAgo(likedAt)}</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-3xl font-black tracking-tight mb-1">
              {user.name}{user.age && <span className="text-xl font-medium opacity-80 ml-2">, {user.age}</span>}
            </h3>
            {user.location && (
              <div className="flex items-center gap-2 text-sm font-bold opacity-90 text-emerald-400">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {user.bio ? `"${user.bio}"` : "This traveler prefers to keep things mysterious."}
          </p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {user.interests?.slice(0, 3).map((interest, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-[#059467] rounded-xl text-[10px] font-black uppercase tracking-tighter border border-emerald-100 dark:border-emerald-500/20">
                #{interest}
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            {type === 'liked-you' ? (
              <>
                <button
                  onClick={() => handlePass(user._id)}
                  className="w-14 h-14 bg-slate-100 dark:bg-slate-700/50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all flex items-center justify-center border border-transparent hover:border-rose-100"
                >
                  <X className="w-7 h-7 stroke-[3px]" />
                </button>
                <button
                  onClick={() => handleLikeBack(user._id)}
                  className="flex-1 h-14 bg-[#059467] hover:bg-[#06ac77] text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <Sparkles className="w-5 h-5" />
                  Match Instantly
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleCancelLike(user._id)}
                  className="w-14 h-14 bg-white dark:bg-slate-700/50 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-2xl transition-all flex items-center justify-center border border-slate-100 dark:border-slate-600"
                >
                  <X className="w-6 h-6 stroke-[3px]" />
                </button>
                <button
                  onClick={() => router.push(`/profile/${user.username}`)}
                  className="flex-1 h-14 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
                >
                  <UserIcon className="w-5 h-5" />
                  Profile Details
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const EmptyState: React.FC<{ type: TabType }> = ({ type }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-32 px-6 flex flex-col items-center"
    >
      <div className="w-24 h-24 bg-white dark:bg-slate-800 shadow-2xl rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-700 rotate-3">
        {type === 'liked-you' ? <Heart className="w-12 h-12 text-rose-500 fill-rose-500" /> : <Send className="w-12 h-12 text-emerald-500" />}
      </div>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
        {type === 'liked-you' ? "Radio Silence..." : "A Clean Slate."}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm font-medium">
        {type === 'liked-you' 
          ? 'Your profile is currently circulating the globe. New likes will land here shortly!'
          : 'Fortune favors the bold! Start discovering nomads and send out some likes.'}
      </p>
      <button
        onClick={() => router.push('/match')}
        className="px-10 py-4 bg-[#059467] hover:bg-[#06ac77] text-white rounded-2xl font-black text-lg shadow-2xl shadow-emerald-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
      >
        <Search className="w-6 h-6 stroke-[3px]" />
        Discovery Mode
      </button>
    </motion.div>
  );

  return (
    <ProtectedRoute>
      <div className="bg-[#f5f8f7] dark:bg-[#0b1713] min-h-screen selection:bg-emerald-500 selection:text-white">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#059467]/10 text-[#059467] px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                <Heart size={14} className="fill-current" /> Connection Hub
              </div>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Interest Log</h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Manage the nomads who have crossed your path.</p>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex min-w-[320px]">
              <button
                onClick={() => setActiveTab('liked-you')}
                className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'liked-you' ? 'bg-[#059467] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Inbound <span className="opacity-50">({likedYou.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'sent' ? 'bg-[#059467] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Outbound <span className="opacity-50">({sentLikes.length})</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[500px] bg-white dark:bg-slate-800/50 rounded-[2.5rem] animate-pulse border border-slate-100 dark:border-white/5" />
              ))}
            </div>
          ) : (activeTab === 'liked-you' ? likedYou : sentLikes).length === 0 ? (
            <EmptyState type={activeTab} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {(activeTab === 'liked-you' ? likedYou : sentLikes).map((item) => (
                  <UserCard key={item.user._id} item={item} type={activeTab} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LikesPage;