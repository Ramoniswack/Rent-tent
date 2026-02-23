'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MatchSuccess from '../../components/MatchSuccess';
import { Sparkles } from 'lucide-react';

export default function TestMatchSuccess() {
  const [showMatch, setShowMatch] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
            MatchSuccess Component
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Test the high-energy match celebration overlay with confetti effects and smooth animations.
          </p>

          <button
            onClick={() => setShowMatch(true)}
            className="w-full h-14 bg-gradient-to-r from-[#059467] to-[#047a55] hover:from-[#047a55] hover:to-[#036644] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#059467]/30 transition-all hover:scale-105 active:scale-95"
          >
            Trigger Match Success
          </button>

          <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl text-left">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2">Features:</h3>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>✨ Blurred background overlay</li>
              <li>🎭 Overlapping profile avatars</li>
              <li>💖 Animated heart icon</li>
              <li>🎨 Gradient heading</li>
              <li>🎉 Canvas confetti burst</li>
              <li>🎯 Interactive buttons</li>
              <li>🌙 Dark mode support</li>
            </ul>
          </div>

          <div className="mt-4">
            <button
              onClick={() => router.push('/match')}
              className="text-sm text-[#059467] hover:underline font-medium"
            >
              ← Back to Match Page
            </button>
          </div>
        </div>
      </div>

      {/* MatchSuccess Component */}
      <MatchSuccess
        isOpen={showMatch}
        onClose={() => setShowMatch(false)}
        onSendMessage={() => {
          alert('Send Message clicked!');
          setShowMatch(false);
        }}
        matchedUser={{
          name: 'Sarah Johnson',
          profilePicture: 'https://i.pravatar.cc/400?img=45',
        }}
        currentUser={{
          name: 'Alex Smith',
          profilePicture: 'https://i.pravatar.cc/400?img=12',
        }}
      />
    </div>
  );
}
