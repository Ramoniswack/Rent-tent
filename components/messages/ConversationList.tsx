'use client';

import { Search } from 'lucide-react';
import { MessageListSkeleton } from '../SkeletonCard';

interface Match {
  _id: string;
  id: string;
  name: string;
  username?: string;
  profilePicture?: string;
  imageUrl: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  source?: 'match' | 'connection' | 'marketplace';
}

interface ConversationListProps {
  activeTab: 'match' | 'marketplace';
  setActiveTab: (tab: 'match' | 'marketplace') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  error: string;
  filteredMatches: Match[];
  selectedMatch: Match | null;
  setSelectedMatch: (match: Match) => void;
  setShowSidebar: (show: boolean) => void;
  formatTime: (timestamp: string) => string;
  showSidebar: boolean;
}

export default function ConversationList({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  loading,
  error,
  filteredMatches,
  selectedMatch,
  setSelectedMatch,
  setShowSidebar,
  formatTime,
  showSidebar
}: ConversationListProps) {
  return (
    <aside 
      className={`w-full md:w-[380px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132a24] z-10 md:h-full h-[calc(100vh-64px)] fixed md:relative transform transition-transform duration-300 ease-in-out ${
        showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Tabs */}
      <div className="px-4 md:px-5 py-3 md:py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex gap-2 bg-slate-50 dark:bg-[#1a2c26] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('match')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'match'
                ? 'bg-white dark:bg-[#132a24] text-[#059467] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#059467]'
            }`}
          >
            Match
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'marketplace'
                ? 'bg-white dark:bg-[#132a24] text-[#059467] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#059467]'
            }`}
          >
            Marketplace
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 md:px-5 py-3 md:py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex w-full items-center rounded-2xl bg-slate-50 dark:bg-[#1a2c26] px-3 md:px-4 py-2.5 md:py-3 transition-all focus-within:ring-2 focus-within:ring-[#059467]/30 focus-within:bg-white dark:focus-within:bg-[#1f3630]">
          <Search className="w-4 h-4 md:w-5 md:h-5 text-[#059467] dark:text-[#059467]/80 mr-2 md:mr-3" />
          <input
            className="w-full bg-transparent border-none text-xs md:text-sm text-[#0d1c17] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-0 p-0"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-4">
            <MessageListSkeleton />
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-500 dark:text-red-400 mb-3 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#059467] text-sm font-semibold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {searchQuery 
                ? 'No matches found' 
                : activeTab === 'match' 
                  ? 'No match conversations yet' 
                  : 'No marketplace conversations yet'}
            </p>
            {activeTab === 'marketplace' && !searchQuery && (
              <p className="text-xs text-slate-400 mt-2">
                Marketplace conversations appear when you rent or list gear
              </p>
            )}
          </div>
        ) : (
          filteredMatches.map((match) => (
            <div
              key={match._id || match.id}
              onClick={() => {
                setSelectedMatch(match);
                setShowSidebar(false);
              }}
              className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 cursor-pointer transition-all duration-200 border-l-4 active:scale-[0.98] ${
                selectedMatch?._id === match._id || selectedMatch?.id === match.id
                  ? 'bg-[#059467]/10 border-[#059467] shadow-sm'
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-[#1a2c26]/50'
              }`}
            >
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-cover bg-center shadow-md ring-2 ring-white dark:ring-[#132a24]"
                  style={{ backgroundImage: `url(${match.imageUrl})` }}
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white dark:border-[#132a24] transition-colors ${
                  match.online ? 'bg-[#059467]' : 'bg-slate-300'
                }`} />
                {/* Source indicator badge */}
                {(match as any).source === 'marketplace' && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md" title="Marketplace conversation">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <p className="text-xs md:text-sm font-bold truncate text-[#0d1c17] dark:text-white">
                    {match.name}
                  </p>
                  <span className={`text-[10px] md:text-xs font-medium ml-2 ${
                    selectedMatch?._id === match._id || selectedMatch?.id === match.id ? 'text-[#059467]' : 'text-slate-400'
                  }`}>
                    {formatTime(match.timestamp)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-xs md:text-sm truncate ${
                    selectedMatch?._id === match._id || selectedMatch?.id === match.id
                      ? 'text-[#059467] dark:text-[#059467]/90 font-medium'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {match.lastMessage}
                  </p>
                  {match.unread > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] md:min-w-[20px] h-4 md:h-5 px-1 md:px-1.5 bg-[#059467] text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg">
                      {match.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
