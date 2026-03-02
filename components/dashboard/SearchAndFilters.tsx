'use client';

import { Search, X } from 'lucide-react';

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  filterOptions: string[];
}

export default function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  filterOptions
}: SearchAndFiltersProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 md:mb-10">
      {/* Search Bar */}
      <div className="flex items-center w-full lg:max-w-xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-[#059467] transition-colors" />
          <input
            className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 bg-white dark:bg-slate-800 border-none rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#059467] outline-none transition-all placeholder:text-slate-400 dark:text-white text-sm md:text-base"
            placeholder="Search trips..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Filter Chips */}
      <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mt-4">
        {filterOptions.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
              statusFilter === status
                ? 'bg-[#059467] text-white ring-2 ring-[#059467] ring-offset-1 dark:ring-offset-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 ring-1 ring-slate-200 dark:ring-slate-700'
            }`}
          >
            {status === 'all' ? 'All Trips' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
