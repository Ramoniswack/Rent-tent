'use client';

import { Smile, Trash2 } from 'lucide-react';

interface Message {
  _id: string;
  id: string;
  sender: string | { _id: string; name: string };
  senderId: string;
  text: string;
  image?: string;
  timestamp: string;
  createdAt: string;
  read: boolean;
  replyTo?: {
    id: string;
    text: string;
    image?: string;
    senderId: string;
  } | null;
  reactions: Array<{
    user: {
      id: string;
      name: string;
      profilePicture?: string;
    };
    emoji: string;
    createdAt: string;
  }>;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  currentUserId: string;
  selectedMatchName: string;
  selectedMatchImageUrl: string;
  formatTime: (timestamp: string) => string;
  handleReply: (message: Message) => void;
  handleAddReaction: (messageId: string, emoji: string) => void;
  handleRemoveReaction: (messageId: string, emoji: string) => void;
  setMessageToDelete: (id: string) => void;
  showReactionPicker: string | null;
  setShowReactionPicker: (id: string | null) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  currentUserId,
  selectedMatchName,
  selectedMatchImageUrl,
  formatTime,
  handleReply,
  handleAddReaction,
  handleRemoveReaction,
  setMessageToDelete,
  showReactionPicker,
  setShowReactionPicker
}: MessageBubbleProps) {
  // Group reactions by emoji
  const reactionGroups = message.reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, typeof message.reactions>);

  return (
    <div
      className={`flex gap-3 animate-fadeIn group ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && (
        <div className="flex-none self-end mb-1">
          {showAvatar ? (
            <div
              className="w-8 h-8 rounded-full bg-cover bg-center shadow-sm ring-2 ring-white dark:ring-[#0b1a16]"
              style={{ backgroundImage: `url(${selectedMatchImageUrl})` }}
            />
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}
      <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl text-sm shadow-md transition-all hover:shadow-lg relative ${
          isOwn
            ? 'bg-gradient-to-br from-[#059467] to-[#047854] text-white rounded-br-md'
            : 'bg-white dark:bg-[#1f3630] text-[#0d1c17] dark:text-slate-200 rounded-bl-md border border-slate-100 dark:border-slate-700'
        }`}>
          {/* Reply indicator */}
          {message.replyTo && (
            <div className={`px-4 pt-3 pb-2 border-l-2 ${
              isOwn ? 'border-white/30' : 'border-[#059467]/30'
            }`}>
              <div className={`text-xs ${isOwn ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'} mb-1`}>
                Replying to {message.replyTo.senderId === currentUserId ? 'yourself' : selectedMatchName}
              </div>
              <div className={`text-xs ${isOwn ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'} truncate`}>
                {message.replyTo.image ? '📷 Image' : message.replyTo.text}
              </div>
            </div>
          )}
          
          {message.image && (
            <div className="relative">
              <img 
                src={message.image} 
                alt="Shared image" 
                className="max-w-[250px] max-h-[300px] rounded-t-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image, '_blank')}
              />
            </div>
          )}
          {message.text && (
            <p className={`leading-relaxed ${message.image ? 'p-4 pt-3' : message.replyTo ? 'px-4 pb-4' : 'p-4'}`}>{message.text}</p>
          )}
          
          {/* Action buttons (Reply, React, Delete) */}
          <div className={`absolute ${isOwn ? '-left-20' : '-right-20'} top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
            {/* Reply button */}
            <button
              onClick={() => handleReply(message)}
              className="p-1.5 bg-white dark:bg-[#1f3630] text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg transition-colors"
              title="Reply"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            
            {/* Reaction button */}
            <div className="relative">
              <button
                onClick={() => setShowReactionPicker(showReactionPicker === (message._id || message.id) ? null : (message._id || message.id))}
                className="p-1.5 bg-white dark:bg-[#1f3630] text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg transition-colors"
                title="React"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
              
              {/* Reaction picker */}
              {showReactionPicker === (message._id || message.id) && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowReactionPicker(null)}
                  />
                  <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} mt-2 bg-white dark:bg-[#1f3630] rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 flex gap-1 z-50`}>
                    {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleAddReaction(message._id || message.id, emoji)}
                        className="text-xl hover:scale-125 transition-transform p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Delete button for own messages */}
            {isOwn && (
              <button
                onClick={() => setMessageToDelete(message._id || message.id)}
                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Reactions display */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className={`flex flex-wrap gap-1 ${isOwn ? 'justify-end mr-1' : 'ml-1'}`}>
            {Object.entries(reactionGroups).map(([emoji, reactions]) => {
              const hasUserReacted = reactions.some(r => r.user.id === currentUserId);
              return (
                <button
                  key={emoji}
                  onClick={() => hasUserReacted ? handleRemoveReaction(message._id || message.id, emoji) : handleAddReaction(message._id || message.id, emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                    hasUserReacted
                      ? 'bg-[#059467]/20 border border-[#059467] text-[#059467]'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={reactions.map(r => r.user.name).join(', ')}
                >
                  <span>{emoji}</span>
                  <span className="font-semibold">{reactions.length}</span>
                </button>
              );
            })}
          </div>
        )}
        
        <div className={`flex items-center gap-1.5 ${isOwn ? 'mr-1' : 'ml-1'}`}>
          <span className="text-xs text-slate-400 font-medium">
            {formatTime(message.timestamp || message.createdAt)}
          </span>
          {isOwn && message.read && (
            <svg className="w-4 h-4 text-[#059467]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" transform="translate(3, 0)" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
