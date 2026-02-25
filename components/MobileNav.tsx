'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, MessageCircle, Package, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null);
  const svgPathRef = useRef(null);

  const navItems = [
    { icon: Users, label: 'Match', path: '/match', size: 'small' },
    { icon: MessageCircle, label: 'Chat', path: '/messages', size: 'small' },
    { icon: Home, label: 'Home', path: '/dashboard', size: 'big' },
    { icon: Package, label: 'Gear', path: '/gear', size: 'small' },
    { icon: Map, label: 'Map', path: '/map', size: 'small' }
  ];

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  // GSAP: Elastic Entrance and Magnetic Interaction
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance animation for the whole bar
      gsap.from(".nav-container", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.8)",
      });

      // 2. Staggered icon "pop"
      gsap.from(".nav-item-inner", {
        scale: 0,
        rotation: -45,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.4
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  const handleNavigate = (path: string, isBig: boolean) => {
    // Creative Transition: "Magnetic" pulse on click
    gsap.to(isBig ? ".big-btn" : ".active-glow", {
      scaleX: 1.5,
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });

    router.push(path);
  };

  if (['/login', '/register', '/'].includes(pathname)) return null;

  return (
    <nav ref={navRef} className="md:hidden fixed bottom-0 left-0 right-0 z-50 nav-container bg-white dark:bg-[#05110e]">
      <div className="relative">
        {/* DYNAMIC SVG BRIDGE */}
        <svg
          viewBox="0 0 400 60"
          className="absolute -top-7 w-full h-[90px] fill-white dark:fill-[#05110e] drop-shadow-[0_-12px_20px_rgba(0,0,0,0.06)] pointer-events-none"
          preserveAspectRatio="none"
        >
        <path 
  ref={svgPathRef}
  // Peak lowered to 10, curve widened to 120-280 for a "softer" bridge
  d="M0 20 L120 20 C155 20 165 10 200 10 C235 10 245 20 280 20 L400 20 L400 80 L0 80 Z" 
/>
        </svg>

        {/* NAV CONTENT */}
        <div className="relative bg-white dark:bg-[#05110e] px-4 pb-4 h-20 flex items-center justify-between">
          {navItems.map((item, index) => {
            const active = isActive(item.path);
            const isBig = item.size === 'big';

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path, isBig)}
                className={`nav-item relative flex flex-col items-center justify-center ${
                  isBig ? 'w-20' : 'flex-1 h-full pt-4'
                }`}
              >
                <div className="nav-item-inner flex flex-col items-center">
                  {isBig ? (
                    <div className="absolute -top-11 flex flex-col items-center big-btn">
                      <motion.div
                        animate={{ 
                          scale: active ? 1.1 : 1,
                          backgroundColor: active ? '#059467' : '#ffffff',
                          boxShadow: active ? '0 15px 30px -5px rgba(5,148,103,0.4)' : '0 10px 20px -5px rgba(0,0,0,0.1)'
                        }}
                        className={`size-16 rounded-3xl flex items-center justify-center border-4 border-[#f8faf9] dark:border-[#0b1713] ${
                          active ? 'text-white' : 'text-slate-400 dark:bg-[#0a221c] dark:text-emerald-500'
                        }`}
                      >
                        <item.icon size={32} strokeWidth={2.5} />
                      </motion.div>
                      <span className={`text-[10px] font-black mt-1 uppercase tracking-tighter ${active ? 'text-[#059467]' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 group">
                      <motion.div
                        animate={{ 
                          y: active ? -5 : 0,
                          color: active ? '#059467' : '#94a3b8'
                        }}
                        className="transition-colors group-active:scale-75"
                      >
                        <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                      </motion.div>
                      <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'text-[#059467] opacity-100' : 'text-slate-400 opacity-60'}`}>
                        {item.label}
                      </span>
                      
                      <AnimatePresence>
                        {active && (
                          <motion.div 
                            layoutId="nav-glow"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="active-glow absolute -bottom-1 w-8 h-1 bg-[#059467] rounded-full blur-[1px]"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}