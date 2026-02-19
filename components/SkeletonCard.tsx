export const GearCardSkeleton = () => (
  <div className="group bg-white dark:bg-[#1a2c26] rounded-xl overflow-hidden border border-gray-100 dark:border-[#059467]/5 animate-pulse">
    <div className="p-3 md:p-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:rounded-[32px] bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 space-y-3">
      <div className="flex justify-between items-start">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
      <div className="flex items-end justify-between border-t border-gray-50 dark:border-white/5 pt-3 mt-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
      </div>
    </div>
  </div>
);

export const BookingCardSkeleton = () => (
  <div className="bg-white dark:bg-white/5 rounded-[24px] p-5 shadow-sm border border-[#e7f4f0]/60 dark:border-white/5 animate-pulse">
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
      <div className="shrink-0 w-full md:w-[120px] aspect-square rounded-2xl bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 min-w-0 flex flex-col gap-3 w-full">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
        </div>
      </div>
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-2">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
      </div>
    </div>
  </div>
);

export const MatchCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full animate-pulse">
    <div className="relative aspect-[3/4] bg-slate-200 dark:bg-slate-700" />
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
      </div>
    </div>
  </div>
);

export const MessageListSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors animate-pulse">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export const TripCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
    <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      </div>
      <div className="flex items-center gap-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
      </div>
    </div>
  </div>
);

export const DashboardStatSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
  </div>
);
