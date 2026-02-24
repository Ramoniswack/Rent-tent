'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Map,
  Tent,
  Users,
  Wallet,
  CheckSquare,
  CloudOff,
  Mountain,
  ArrowRight,
  PlayCircle,
  Star
} from 'lucide-react';

// Register GSAP Plugin safely for Next.js SSR
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const router = useRouter();

  // GSAP Refs
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const featuresHeaderRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Data Arrays
  const features = [
    {
      icon: Map,
      title: 'Smart Trip Management',
      description: 'Collaborate on detailed itineraries with interactive Leaflet maps, custom markers, and weather integration for high-altitude passes.',
      colSpan: 'lg:col-span-2',
      accent: 'from-emerald-500/20 to-transparent'
    },
    {
      icon: Tent,
      title: 'Gear Rental Marketplace',
      description: 'Peer-to-peer equipment rental. Find or list trekking gear with GPS coordinates, security deposits, and real-time booking tracking.',
      colSpan: 'lg:col-span-1',
      accent: 'from-teal-500/20 to-transparent'
    },
    {
      icon: Users,
      title: 'Travel Match',
      description: 'Find your perfect trekking partner. Swipe to match based on travel style, pace, and route, complete with real-time chat.',
      colSpan: 'lg:col-span-1',
      accent: 'from-rose-500/20 to-transparent'
    },
    {
      icon: Wallet,
      title: 'Multi-Currency Expenses',
      description: 'Track costs in NPR, USD, EUR and more. Real-time exchange rates and visual charts keep your Everest Base Camp budget in check.',
      colSpan: 'lg:col-span-2',
      accent: 'from-blue-500/20 to-transparent'
    },
    {
      icon: CheckSquare,
      title: 'Pro Packing Lists',
      description: 'Never forget your crampons. Use built-in templates for Trekking or City Tours, categorized by Gear, Medical, and Documents.',
      colSpan: 'lg:col-span-2',
      accent: 'from-amber-500/20 to-transparent'
    },
    {
      icon: CloudOff,
      title: 'True Offline PWA',
      description: 'Zero connectivity on the Annapurna Circuit? No problem. Access maps, bookings, and sync automatically when back in Kathmandu.',
      colSpan: 'lg:col-span-1',
      accent: 'from-indigo-500/20 to-transparent'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Mercer',
      role: 'Everest Base Camp Trekker',
      rating: 5,
      text: 'NomadNotes is a game-changer for Nepal. I rented a -20°C sleeping bag directly from a local in Thamel using the gear marketplace.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80'
    },
    {
      name: 'Priya Sharma',
      role: 'Digital Nomad',
      rating: 5,
      text: 'The offline PWA mode is flawless. I could log my daily expenses in tea houses with absolutely no cell service, and it synced perfectly later.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80'
    },
    {
      name: 'David Chen',
      role: 'Solo Traveler',
      rating: 4.5,
      text: 'Used Travel Match to find a hiking buddy for the Langtang valley trek. The whole experience from planning to packing was seamless.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
    }
  ];

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate Features Header
      gsap.fromTo(
        featuresHeaderRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresSectionRef.current,
            start: 'top 80%',
          },
        }
      );

      // Animate Features Bento Cards
      gsap.fromTo(
        featureCardsRef.current,
        { y: 100, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresSectionRef.current,
            start: 'top 65%',
          },
        }
      );
    }, featuresSectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-[#0b1713] font-sans selection:bg-[#059467] selection:text-white">
      <Header />

      {/* 1. Hero Section */}
      <header className="relative w-full min-h-[85vh] flex items-center py-24 lg:py-32 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=80"
            alt="Himalayan mountain peak at sunrise"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-[#0b1713]/60 dark:bg-[#0b1713]/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8faf9] via-transparent to-transparent dark:from-[#0b1713]"></div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-20 w-full mt-10">
          <div className="max-w-3xl flex flex-col gap-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              <span className="text-white text-xs font-bold tracking-wider uppercase">
                Now optimized for Nepal & The Himalayas
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
              Master Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                Himalayan Trek
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-200 font-medium max-w-2xl leading-relaxed">
              The ultimate full-stack companion for travelers. Plan itineraries, rent premium gear peer-to-peer, find trekking partners, and track expenses—all available offline.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => router.push('/register')}
                className="bg-[#059467] hover:bg-[#047a55] text-white text-base font-bold h-14 px-8 rounded-full transition-all duration-300 shadow-xl shadow-[#059467]/30 flex items-center justify-center gap-2 group"
              >
                Start Exploring Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white text-base font-bold h-14 px-8 rounded-full transition-all duration-300 flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" />
                See How It Works
              </button>
            </div>

            {/* Stats */}
            <div className="pt-8 mt-4 flex flex-wrap gap-8 sm:gap-12 border-t border-white/20">
              <div className="flex flex-col">
                <span className="text-white text-4xl font-black tracking-tight">50k+</span>
                <span className="text-emerald-300 text-sm font-bold uppercase tracking-wider mt-1">Active Nomads</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-4xl font-black tracking-tight">10k+</span>
                <span className="text-emerald-300 text-sm font-bold uppercase tracking-wider mt-1">Gear Listings</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-4xl font-black tracking-tight">100%</span>
                <span className="text-emerald-300 text-sm font-bold uppercase tracking-wider mt-1">Offline Capable</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. GSAP Animated Features Bento Grid */}
      <section
        ref={featuresSectionRef}
        id="features"
        className="py-24 px-6 lg:px-20 max-w-[1440px] mx-auto bg-[#f8faf9] dark:bg-[#0b1713] relative z-10 overflow-hidden"
      >
        <div ref={featuresHeaderRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[#059467] dark:text-emerald-400 font-bold mb-4 uppercase tracking-wider text-sm">
              <Mountain className="w-5 h-5" />
              Platform Features
            </div>
            <h2 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
              Built for the Rigors of Remote Travel
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Everything you need to seamlessly transition from planning in Kathmandu to trekking the high passes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              // @ts-ignore - Array ref assignment for GSAP stagger
              ref={(el) => (featureCardsRef.current[index] = el)}
              className={`group relative bg-white dark:bg-[#11241e] p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-white/5 overflow-hidden transition-colors hover:border-[#059467]/50 ${feature.colSpan}`}
            >
              {/* Ambient Glow */}
              <div
                className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${feature.accent} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
              ></div>

              <div className="relative z-10">
                <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-[#059467] dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-slate-900 dark:text-white text-2xl font-bold mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Large CTA Banner */}
      <section className="py-12 px-6 lg:px-20 max-w-[1440px] mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-[#0b1713] dark:bg-[#11241e] h-[400px] flex items-center justify-center text-center px-4 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1522199710521-72d69614c702?w=1920&q=80"
            alt="Trekker looking at map"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#059467]/20 to-transparent"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Ready to hit the trails?
            </h2>
            <p className="text-emerald-50 dark:text-slate-300 text-lg max-w-lg">
              Join thousands of adventurers using NomadNotes to plan smarter, pack lighter, and travel further.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button
                onClick={() => router.push('/register')}
                className="bg-[#059467] hover:bg-[#047a55] text-white text-base font-bold h-12 px-8 rounded-full transition-all duration-300 shadow-lg shadow-[#059467]/20"
              >
                Create Free Account
              </button>
              <button
                onClick={() => router.push('/marketplace')}
                className="bg-transparent hover:bg-white/10 backdrop-blur-sm border border-white/30 text-white text-base font-bold h-12 px-8 rounded-full transition-all duration-300"
              >
                Browse Gear
              </button>
            </div>
          </div>
        </div>
      </section>

 {/* 4. Infinite Auto-Scroll Testimonials */}
      <section className="py-24 bg-[#f8faf9] dark:bg-[#0b1713] overflow-hidden">
        <div className="text-center mb-16 max-w-2xl mx-auto px-6">
          <h2 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black mb-4">
            Trusted by the Community
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Don't just take our word for it. Here's what fellow trekkers and digital nomads have to say about NomadNotes.
          </p>
        </div>

        {/* Full-width container for the marquee */}
        <div className="relative max-w-[100vw] mx-auto">
          {/* Fading Edges (Left and Right masks for a premium look) */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-[#f8faf9] dark:from-[#0b1713] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-[#f8faf9] dark:from-[#0b1713] to-transparent z-10 pointer-events-none"></div>

          {/* Marquee Track 
            'animate-infinite-scroll' runs the keyframes.
            'hover:[animation-play-state:paused]' pauses the scroll when the user mouses over a card.
          */}
          <div className="flex w-max animate-infinite-scroll hover:[animation-play-state:paused] pt-4 pb-8">
            
            {/* We map [1, 2] to render the exact same list twice for the seamless -50% loop trick */}
            {[1, 2].map((set) => (
              <div key={set} className="flex gap-6 px-3">
                
                {/* I duplicated your 3 testimonials here [...testimonials, ...testimonials] 
                  so the row is long enough to fill wide desktop screens before looping.
                */}
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                  <div
                    key={`${set}-${index}`}
                    className="w-[85vw] md:w-[420px] flex-shrink-0 flex flex-col gap-6 bg-white dark:bg-[#11241e] p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-white/5 hover:border-[#059467]/30 transition-colors"
                  >
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(testimonial.rating)
                              ? 'fill-current'
                              : i < testimonial.rating
                              ? 'fill-current opacity-50'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 text-lg font-medium leading-relaxed italic flex-grow">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="size-12 rounded-full object-cover border-2 border-[#059467]/20"
                      />
                      <div>
                        <div className="text-slate-900 dark:text-white font-bold text-sm">{testimonial.name}</div>
                        <div className="text-[#059467] dark:text-emerald-400 text-xs font-semibold">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}