'use client';

import { useRef } from 'react';
import { Send, Smile, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sending: boolean;
  selectedImage: File | null;
  imagePreview: string;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  replyingTo: any;
  selectedMatchName: string;
  currentUserId: string;
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  handleTyping: () => void;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  handleCancelReply: () => void;
  handleEmojiSelect: (emoji: string) => void;
  emojis: string[];
}

export default function MessageInput({
  newMessage,
  setNewMessage,
  sending,
  selectedImage,
  imagePreview,
  showEmojiPicker,
  setShowEmojiPicker,
  replyingTo,
  selectedMatchName,
  currentUserId,
  handleSendMessage,
  handleTyping,
  handleImageSelect,
  handleRemoveImage,
  handleCancelReply,
  handleEmojiSelect,
  emojis
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-none p-4 md:p-6 bg-white dark:bg-[#132a24] border-t border-slate-200 dark:border-slate-800 shadow-lg">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-3 p-3 bg-slate-50 dark:bg-[#1a2c26] rounded-lg border-l-4 border-[#059467] flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#059467] font-semibold mb-1">
              Replying to {replyingTo.senderId === currentUserId ? 'yourself' : selectedMatchName}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 truncate">
              {replyingTo.image ? '📷 Image' : replyingTo.text}
            </div>
          </div>
          <button
            onClick={handleCancelReply}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-w-[150px] max-h-[150px] rounded-lg object-cover border-2 border-[#059467]"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-3 p-3 bg-slate-50 dark:bg-[#1a2c26] rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-2xl hover:scale-125 transition-transform p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <form className="flex items-end gap-3" onSubmit={handleSendMessage}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          className="p-3 text-slate-400 hover:text-[#059467] transition-all rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-110"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-6 h-6" />
        </button>
        <div className="flex-1 bg-slate-50 dark:bg-[#1a2c26] rounded-[24px] flex items-center px-5 py-3.5 focus-within:ring-2 focus-within:ring-[#059467]/30 transition-all shadow-sm hover:shadow-md">
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none p-0 text-[#0d1c17] dark:text-white placeholder:text-slate-400 text-sm"
            placeholder={replyingTo ? `Replying to ${replyingTo.senderId === currentUserId ? 'yourself' : selectedMatchName}...` : "Type your message..."}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            disabled={sending}
            autoComplete="off"
          />
          <button
            className="ml-2 text-slate-400 hover:text-[#059467] transition-all hover:scale-110"
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="w-6 h-6" />
          </button>
        </div>
        <button
          className="p-3.5 bg-gradient-to-br from-[#059467] to-[#047854] hover:from-[#047854] hover:to-[#036543] transition-all rounded-full text-white shadow-lg shadow-[#059467]/30 hover:shadow-xl hover:shadow-[#059467]/40 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          type="submit"
          disabled={(!newMessage.trim() && !selectedImage) || sending}
        >
          {sending ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : (
            <Send className="w-6 h-6" />
          )}
        </button>
      </form>
    </div>
  );
}
