'use client';

import { useRouter } from 'next/navigation';
import { Calendar, ArrowRight, Loader2, Edit2, Trash2 } from 'lucide-react';

interface Trip {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  country: string;
  status: string;
  imageUrl?: string;
  isPublic: boolean;
  lat?: number;
  lng?: number;
  collaborators: Array<{
    userId: {
      _id: string;
      name: string;
      profilePicture?: string;
    };
    role: string;
    status: string;
  }>;
  userId: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
}

interface TripCardProps {
  trip: Trip;
  isNearby: boolean;
  currentUserId?: string;
  deletingId: string | null;
  onDelete: (e: React.MouseEvent, tripId: string) => void;
  activeTab: string;
}

export default function TripCard({
  trip,
  isNearby,
  currentUserId,
  deletingId,
  onDelete,
  activeTab
}: TripCardProps) {
  const router = useRouter();

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      planning: { label: 'Planning', color: 'bg-blue-600' },
      traveling: { label: 'Active', color: 'bg-slate-900/60' },
      completed: { label: 'Completed', color: 'bg-green-600' }
    };
    return statusMap[status] || { label: status, color: 'bg-slate-900/60' };
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const getDefaultImage = (destination: string) => {
    const images: Record<string, string> = {
      japan: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
      iceland: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&q=80',
      patagonia: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
      'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
      bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
      switzerland: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&q=80',
      nepal: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80'
    };
    
    const key = Object.keys(images).find(k => 
      destination.toLowerCase().includes(k)
    );
    return key ? images[key] : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
  };

  const statusDisplay = getStatusDisplay(trip.status);
  const acceptedCollaborators = trip.collaborators.filter(c => c.status === 'accepted');
  const allMembers = [trip.userId, ...acceptedCollaborators.map(c => c.userId)];
  const displayMembers = allMembers.slice(0, 4);
  const remainingCount = allMembers.length - 4;

  return (
    <div 
      className={`trip-card group bg-white dark:bg-slate-800 rounded-3xl md:rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl cursor-pointer ${
        isNearby 
          ? 'ring-4 ring-[#059467] ring-offset-2 dark:ring-offset-slate-900 shadow-[#059467]/30 animate-pulse-slow' 
          : 'shadow-slate-900/5 dark:shadow-black/20 hover:shadow-[#059467]/10'
      }`}
      onClick={() => router.push(`/trips/${trip._id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          alt={trip.destination}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={trip.imageUrl || getDefaultImage(trip.destination)}
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 md:top-6 left-3 md:left-6 flex flex-col gap-2">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 md:px-4 py-1 md:py-1.5 rounded-full flex items-center gap-1.5 md:gap-2">
            {trip.status === 'traveling' && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            )}
            {trip.status === 'completed' && (
              <svg className="w-4 h-4 text-[#059467]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {trip.status === 'planning' && (
              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-[10px] md:text-xs font-bold text-[#0f172a] dark:text-white">
              {statusDisplay.label}
            </span>
          </div>
          
          {/* Nearby Badge */}
          {isNearby && (
            <div className="bg-[#059467] backdrop-blur-md px-3 md:px-4 py-1 md:py-1.5 rounded-full flex items-center gap-1.5 md:gap-2 animate-in slide-in-from-left duration-500">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] md:text-xs font-black text-white">
                You're Here!
              </span>
            </div>
          )}
        </div>

        {/* Touch-Friendly Action Buttons */}
        {activeTab !== 'public' && currentUserId && (
          <div className="absolute top-3 md:top-6 right-3 md:right-6 flex gap-2">
            {/* Edit Button - Only show for trip owner */}
            {trip.userId._id === currentUserId && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/trips/${trip._id}/edit`);
                }}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md text-white hover:bg-blue-500 hover:text-white shadow-sm ring-1 ring-white/30 transition-all flex items-center justify-center z-10"
                aria-label="Edit Trip"
              >
                <Edit2 className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
              </button>
            )}
            
            {/* Delete Button - Only show for trip owner */}
            {trip.userId._id === currentUserId && (
              <button 
                onClick={(e) => onDelete(e, trip._id)}
                disabled={deletingId === trip._id}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md text-white hover:bg-red-500 hover:text-white shadow-sm ring-1 ring-white/30 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed z-10"
                aria-label="Delete Trip"
              >
                {deletingId === trip._id ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col">
        <h3 className="text-lg md:text-xl lg:text-2xl font-black text-[#0f172a] dark:text-white mb-3 md:mb-4 group-hover:text-[#059467] transition-colors line-clamp-2">
          {trip.title}
        </h3>
        <div className="flex flex-col gap-1.5 md:gap-2 mb-4 md:mb-8">
          <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 dark:text-slate-400">
            <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs md:text-sm font-medium truncate">{trip.destination}, {trip.country}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="text-xs md:text-sm font-medium truncate">{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[#059467]/5 dark:border-slate-700 pt-4 md:pt-6">
          <div className="flex -space-x-2 md:-space-x-3">
            {displayMembers.map((member, idx) => (
              <div key={`${trip._id}-member-${member._id}-${idx}`} className="relative">
                {member.profilePicture ? (
                  <img
                    alt={member.name}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-slate-800 ring-1 ring-[#059467]/20 object-cover"
                    src={member.profilePicture}
                  />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-slate-800 ring-1 ring-[#059467]/20 bg-gradient-to-br from-[#059467] to-[#047853] flex items-center justify-center">
                    <span className="text-white font-bold text-[10px] md:text-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#059467]/10 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] md:text-[10px] font-bold text-[#059467] dark:text-white ring-1 ring-[#059467]/20">
                +{remainingCount}
              </div>
            )}
          </div>
          <div className="text-[#059467] font-bold text-xs md:text-sm flex items-center gap-1 group/link">
            Details
            <ArrowRight className="w-4 h-4 md:w-[18px] md:h-[18px] group-hover/link:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
