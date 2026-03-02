'use client';

export default function DashboardSkeleton() {
  return (
    <>
      {/* Skeleton Mobile Hero Section */}
      <div className="md:hidden mb-6 space-y-2">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-48 animate-pulse" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 animate-pulse" />
      </div>

      {/* Skeleton Desktop Hero */}
      <div className="hidden md:flex mb-6 md:mb-12 flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="space-y-3 animate-pulse">
          <div className="h-12 md:h-14 bg-slate-200 dark:bg-slate-700 rounded-xl w-64 md:w-80" />
          <div className="h-4 md:h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-48 md:w-96" />
        </div>
        <div className="h-12 md:h-14 bg-slate-200 dark:bg-slate-700 rounded-full w-40 md:w-48 animate-pulse" />
      </div>

      {/* Navigation & Search Skeleton */}
      <div className="flex flex-col gap-4 mb-6 md:mb-10">
        {/* Search Bar Skeleton */}
        <div className="w-full lg:max-w-xl">
          <div className="h-12 md:h-14 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>

        {/* Filter Chips Skeleton */}
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Trips Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i}
            className="bg-white dark:bg-slate-800 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-900/5 dark:shadow-black/20 overflow-hidden flex flex-col animate-pulse"
          >
            <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
              <div className="absolute top-3 md:top-6 left-3 md:left-6 w-20 md:w-24 h-6 md:h-7 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-full" />
              {/* Glassmorphic Delete Skeleton */}
              <div className="absolute top-3 md:top-6 right-3 md:right-6 w-8 h-8 md:w-10 md:h-10 bg-white/30 backdrop-blur-md rounded-full" />
            </div>
            <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col">
              <div className="space-y-2 mb-3 md:mb-4">
                <div className="h-6 md:h-7 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
                <div className="h-6 md:h-7 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
              </div>
              <div className="flex flex-col gap-2 mb-4 md:mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 md:w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40 md:w-48" />
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4 md:pt-6">
                <div className="flex -space-x-2 md:-space-x-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800" />
                  ))}
                </div>
                <div className="h-4 md:h-5 w-16 md:w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
