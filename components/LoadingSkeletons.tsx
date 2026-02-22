import React from 'react';
import { Loader2, MapPin, Calendar, DollarSign, Package } from 'lucide-react';

// Gear Listing Page Skeleton
export const GearListingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
        <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
        <div className="p-4 space-y-3">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Gear Detail Page Skeleton
export const GearDetailSkeleton = () => (
  <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Skeleton */}
        <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-3xl animate-pulse" />
        
        {/* Details Skeleton */}
        <div className="space-y-6">
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-3/4" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2" />
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
              </div>
            ))}
          </div>
          
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// Map Page Skeleton
export const MapPageSkeleton = () => (
  <div className="h-[calc(100vh-64px)] bg-[#f5f8f7] dark:bg-[#0f231d] relative">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 animate-pulse" />
    <div className="absolute top-4 left-4 right-4 md:left-auto md:w-96 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl animate-pulse">
      <div className="space-y-3">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-[#059467] mx-auto mb-4 animate-bounce" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading map...</p>
      </div>
    </div>
  </div>
);

// Rentals Dashboard Skeleton
export const RentalsDashboardSkeleton = () => (
  <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      {/* Tabs Skeleton */}
      <div className="flex gap-4 mb-8 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-full w-32" />
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-full w-32" />
      </div>
      
      {/* Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Booking Page Skeleton
export const BookingPageSkeleton = () => (
  <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/2" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
        
        <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
    </div>
  </div>
);

// Trip Details Skeleton
export const TripDetailsSkeleton = () => (
  <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-2/3" />
        <div className="flex gap-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
        </div>
      </div>
      
      {/* Tabs Skeleton */}
      <div className="flex gap-4 mb-8 overflow-x-auto animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-full w-32 flex-shrink-0" />
        ))}
      </div>
      
      {/* Content Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/4 mb-3" />
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Account Page Skeleton
export const AccountPageSkeleton = () => (
  <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
      {/* Profile Header Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 mb-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-4 text-center md:text-left w-full">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-48 mx-auto md:mx-0" />
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 mx-auto md:mx-0" />
            <div className="flex gap-4 justify-center md:justify-start">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-8 overflow-x-auto animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded-full w-24 flex-shrink-0" />
        ))}
      </div>
      
      {/* Content Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 mb-2" />
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Generic Loading Overlay
export const LoadingOverlay = ({ message = "Loading..." }: { message?: string }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl text-center">
      <Loader2 className="w-12 h-12 text-[#059467] mx-auto mb-4 animate-spin" />
      <p className="text-slate-900 dark:text-white font-bold text-lg">{message}</p>
    </div>
  </div>
);
