'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const router = useRouter();
  const firstName = userName?.split(' ')[0] || 'Traveler';

  return (
    <>
      {/* Mobile Hero Section */}
      <div className="md:hidden mb-6">
        <h1 className="text-2xl font-black text-[#0f172a] dark:text-white mb-1">
          Where to next, {firstName}?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Manage your itineraries across Nepal
        </p>
      </div>

      {/* Desktop Hero Title Section */}
      <div className="hidden md:flex mb-6 md:mb-12 flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl lg:text-[48px] font-black text-[#0f172a] dark:text-white mb-1 md:mb-2">
            Your Journeys.
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium">
            Manage your itineraries across Nepal
          </p>
        </div>
        <button 
          onClick={() => router.push('/trips/new')}
          className="bg-[#059467] hover:bg-[#047853] text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-sm md:text-base shadow-lg shadow-[#059467]/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Start New Trip
        </button>
      </div>
    </>
  );
}
