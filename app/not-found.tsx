'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft, Compass, Map, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0b1713] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-emerald-900/5 border border-white dark:border-white/5 text-center space-y-8 animate-fadeIn">
          
          {/* Lost Compass Icon */}
          <div className="relative inline-block">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-spin-slow">
              <Compass className="w-16 h-16 md:w-20 md:h-20 text-white" strokeWidth={2} />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-white font-black text-xl">!</span>
            </div>
          </div>

          {/* 404 Text */}
          <div className="space-y-3">
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600 tracking-tight">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white">
              Lost in the Wild
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
              Looks like you've wandered off the trail. This page doesn't exist in our adventure map.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={() => router.back()}
              className="group w-full sm:w-auto px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-2xl font-bold text-base shadow-lg transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
            
            <Link
              href="/"
              className="group w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-base shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
              Popular Destinations
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/dashboard"
                className="group px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
              >
                <Map className="w-4 h-4" />
                My Trips
              </Link>
              <Link
                href="/match/discover"
                className="group px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Discover
              </Link>
              <Link
                href="/gear"
                className="group px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                Gear Rentals
              </Link>
            </div>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            "Not all who wander are lost... but this page definitely is." 🧭
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
