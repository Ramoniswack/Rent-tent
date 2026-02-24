'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: () => void;
  matchedUser: {
    name: string;
    profilePicture?: string;
  };
  currentUser: {
    name: string;
    profilePicture?: string;
  };
}

const MatchSuccess: React.FC<MatchSuccessProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  matchedUser,
  currentUser,
}) => {
  // 1. Setup mounting state for React Portal (prevents Next.js hydration errors)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      // Trigger confetti burst on mount
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      // 2. Bumped confetti z-index so it renders OVER the portal modal
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999999 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#059467', '#ff6b9d', '#ffd93d', '#6bcf7f', '#ff8c42'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#059467', '#ff6b9d', '#ffd93d', '#6bcf7f', '#ff8c42'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, mounted]);

  // Don't attempt to render the portal until the component has mounted on the client
  if (!mounted) return null;

  // 3. Wrap the return in createPortal to force it to the absolute top of the DOM
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // 4. Boosted modal z-index to 100,000 to clear any navigation bars
          className="fixed inset-0 z-[100000] flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Blurred background overlay */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 bg-black/60 pointer-events-none"
          />

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700/50">
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Top section with gradient background */}
              <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 pt-12 pb-8 px-6">
                {/* Animated particles background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white/30 rounded-full"
                      initial={{
                        x: Math.random() * 400,
                        y: Math.random() * 200,
                        scale: Math.random() * 0.5 + 0.5,
                      }}
                      animate={{
                        y: [null, Math.random() * 200 - 100],
                        x: [null, Math.random() * 400 - 200],
                        scale: [null, Math.random() * 0.5 + 0.5],
                      }}
                      transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    />
                  ))}
                </div>

                {/* Profile avatars with animated heart */}
                <div className="relative flex items-center justify-center mb-6">
                  {/* Left avatar (current user) */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="relative z-10"
                  >
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-200">
                      <img
                        src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&size=200&background=059467&color=fff`}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>

                  {/* Animated heart icon at intersection */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 10 }}
                    className="absolute z-20"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                      className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl"
                    >
                      <Heart className="w-8 h-8 text-rose-500" fill="currentColor" />
                    </motion.div>
                  </motion.div>

                  {/* Right avatar (matched user) */}
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="relative z-10"
                  >
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-200">
                      <img
                        src={matchedUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser.name)}&size=200&background=059467&color=fff`}
                        alt={matchedUser.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* "It's a Match!" heading with gradient text */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center relative z-20"
                >
                  <h2 className="text-5xl font-black text-white mb-2 drop-shadow-lg tracking-tight">
                    It's a Match!
                  </h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-white/90 text-lg font-medium"
                  >
                    You and <span className="font-bold">{matchedUser.name}</span> both want to connect
                  </motion.p>
                </motion.div>
              </div>

              {/* Bottom section with action buttons */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="p-6 space-y-3 relative z-30"
              >
                {/* Send Message button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSendMessage}
                  className="w-full h-14 bg-gradient-to-r from-[#059467] to-[#047a55] hover:from-[#047a55] hover:to-[#036644] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#059467]/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send a Message
                </motion.button>

                {/* Keep Exploring button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full h-14 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-lg border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center gap-3 transition-all cursor-pointer"
                >
                  Keep Exploring
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body // Forces the modal to mount directly to the HTML Body
  );
};

export default MatchSuccess;