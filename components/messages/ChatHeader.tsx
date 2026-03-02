'use client';

import { ArrowLeft, MoreVertical, User, MapPin, Pin, PinOff, Edit3, Volume2, VolumeX, Trash2, UserMinus, UserX } from 'lucide-react';

interface Match {
  _id: string;
  id: string;
  name: string;
  username?: string;
  imageUrl: string;
  online: boolean;
}

interface ChatHeaderProps {
  selectedMatch: Match;
  isTyping: boolean;
  showOptionsMenu: boolean;
  setShowOptionsMenu: (show: boolean) => void;
  setShowSidebar: (show: boolean) => void;
  handleViewProfile: () => void;
  handleShowOnMap: () => void;
  handleTogglePin: () => void;
  handleToggleMute: () => void;
  setShowNicknameModal: (show: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  setShowUnmatchConfirm: (show: boolean) => void;
  setShowBlockConfirm: (show: boolean) => void;
}

export default function ChatHeader({
  selectedMatch,
  isTyping,
  showOptionsMenu,
  setShowOptionsMenu,
  setShowSidebar,
  handleViewProfile,
  handleShowOnMap,
  handleTogglePin,
  handleToggleMute,
  setShowNicknameModal,
  setShowDeleteConfirm,
  setShowUnmatchConfirm,
  setShowBlockConfirm
}: ChatHeaderProps) {
  return (
    <div className="flex-none flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-[#132a24]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Back Button */}
        <button
          onClick={() => setShowSidebar(true)}
          className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full bg-cover bg-center shadow-md ring-2 ring-white dark:ring-[#132a24]"
            style={{ backgroundImage: `url(${selectedMatch.imageUrl})` }}
          />
          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#132a24] transition-colors ${
            selectedMatch.online ? 'bg-[#059467]' : 'bg-slate-300'
          }`} />
        </div>
        <div>
          <h3 className="text-[#0d1c17] dark:text-white text-base font-bold leading-tight">
            {selectedMatch.name}
          </h3>
          <p className={`text-xs font-semibold transition-colors ${
            isTyping ? 'text-[#059467] animate-pulse' : selectedMatch.online ? 'text-[#059467]' : 'text-slate-400'
          }`}>
            {isTyping ? 'typing...' : selectedMatch.online ? 'Online now' : 'Offline'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={handleViewProfile}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all hover:scale-110 text-[#059467]"
          title="View profile"
        >
          <User className="w-5 h-5" />
        </button>
        <button 
          onClick={handleShowOnMap}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all hover:scale-110 text-[#059467]"
          title="Show on map"
        >
          <MapPin className="w-5 h-5" />
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all hover:scale-110 text-slate-500 dark:text-slate-400"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {/* Options Menu */}
          {showOptionsMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowOptionsMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#132a24] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fadeIn">
                <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                
                <button
                  onClick={handleTogglePin}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                >
                  {(selectedMatch as any)?.isPinned ? (
                    <>
                      <PinOff className="w-4 h-4" />
                      Unpin conversation
                    </>
                  ) : (
                    <>
                      <Pin className="w-4 h-4" />
                      Pin conversation
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setShowNicknameModal(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Set nickname
                </button>
                
                <button
                  onClick={handleToggleMute}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                >
                  {(selectedMatch as any)?.isMuted ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Unmute conversation
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      Mute conversation
                    </>
                  )}
                </button>
                
                <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete conversation
                </button>
                
                <button
                  onClick={() => {
                    setShowUnmatchConfirm(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                >
                  <UserMinus className="w-4 h-4" />
                  Unmatch
                </button>
                
                <button
                  onClick={() => {
                    setShowBlockConfirm(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                >
                  <UserX className="w-4 h-4" />
                  Block user
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
