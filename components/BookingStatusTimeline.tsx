'use client';

import { Check, Clock, Package, Home, ClipboardCheck, CheckCircle2 } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: string;
  statusHistory?: Array<{
    status: string;
    timestamp: Date | string;
    note?: string;
  }>;
}

const STATUSES = [
  { key: 'pending', label: 'Pending', icon: Clock, description: 'Awaiting confirmation' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, description: 'Booking confirmed' },
  { key: 'picked_up', label: 'Picked Up', icon: Package, description: 'Item collected' },
  { key: 'returned', label: 'Returned', icon: Home, description: 'Item returned' },
  { key: 'inspected', label: 'Inspected', icon: ClipboardCheck, description: 'Quality checked' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, description: 'Rental complete' }
];

export default function BookingStatusTimeline({ currentStatus, statusHistory = [] }: StatusTimelineProps) {
  const currentIndex = STATUSES.findIndex(s => s.key === currentStatus);
  
  // Helper function to get date for a status
  const getStatusDate = (statusKey: string): string | null => {
    if (!statusHistory || statusHistory.length === 0) return null;
    
    const historyEntry = statusHistory.find(h => h.status === statusKey);
    if (!historyEntry) return null;
    
    const date = new Date(historyEntry.timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="bg-white dark:bg-[#1a2c26] rounded-2xl p-6 shadow-sm border border-[#e7f4f0] dark:border-white/5">
      <h2 className="text-xl font-bold text-[#0d1c17] dark:text-white mb-6">Rental Progress</h2>
      
      {/* Desktop Timeline */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-[#059467] transition-all duration-500"
              style={{ width: `${(currentIndex / (STATUSES.length - 1)) * 100}%` }}
            />
          </div>
          
          {/* Status Steps */}
          <div className="relative flex justify-between">
            {STATUSES.map((status, index) => {
              const Icon = status.icon;
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const statusDate = getStatusDate(status.key);
              
              return (
                <div key={status.key} className="flex flex-col items-center" style={{ width: `${100 / STATUSES.length}%` }}>
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-[#059467] text-white shadow-lg shadow-[#059467]/30' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-[#059467]/20 scale-110' : ''}`}
                  >
                    {isCompleted && index < currentIndex ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-bold ${isCompleted ? 'text-[#059467]' : 'text-gray-400'}`}>
                      {status.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {status.description}
                    </p>
                    {statusDate && (
                      <p className="text-xs text-[#059467] dark:text-[#059467] font-medium mt-1">
                        {statusDate}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Mobile Timeline */}
      <div className="md:hidden space-y-4">
        {STATUSES.map((status, index) => {
          const Icon = status.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const statusDate = getStatusDate(status.key);
          
          return (
            <div key={status.key} className="flex items-start gap-4">
              <div className="relative">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-[#059467] text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-[#059467]/20' : ''}`}
                >
                  {isCompleted && index < currentIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < STATUSES.length - 1 && (
                  <div className={`absolute top-10 left-5 w-0.5 h-8 ${
                    index < currentIndex ? 'bg-[#059467]' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className={`font-bold ${isCompleted ? 'text-[#059467]' : 'text-gray-400'}`}>
                  {status.label}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {status.description}
                </p>
                {statusDate && (
                  <p className="text-xs text-[#059467] font-medium mt-1">
                    {statusDate}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
