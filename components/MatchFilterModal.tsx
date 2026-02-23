'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Mountain, Heart, MapPin, Filter, RotateCcw } from 'lucide-react';

interface MatchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  ageRange: [number, number];
  selectedGenders: string[];
  selectedTravelStyles: string[];
  selectedInterests: string[];
  locationRange: number;
}

const TRAVEL_STYLES = ['Adventure', 'Relaxed', 'Cultural', 'Extreme', 'Slow Travel', 'Luxury', 'Budget'];
const COMMON_INTERESTS = [
  'Trekking', 'Photography', 'Culture', 'Food', 'Hiking', 'Yoga', 
  'Meditation', 'Local Cuisine', 'Mountaineering', 'Rock Climbing', 
  'Camping', 'Coworking', 'Cafes', 'History', 'Language Exchange'
];

const MatchFilterModal: React.FC<MatchFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Update local state when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleReset = () => {
    const defaultFilters: FilterState = {
      ageRange: [18, 60],
      selectedGenders: [],
      selectedTravelStyles: [],
      selectedInterests: [],
      locationRange: 500,
    };
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60) count++;
    if (filters.selectedGenders.length > 0 && !filters.selectedGenders.includes('Any')) count++;
    if (filters.selectedTravelStyles.length > 0) count++;
    if (filters.selectedInterests.length > 0) count++;
    if (filters.locationRange !== 500) count++;
    return count;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
          style={{ paddingTop: '80px', paddingBottom: '80px' }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col" style={{ maxHeight: 'calc(100vh - 160px)' }}>
              {/* Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-[#059467] to-[#047a55] px-4 md:px-6 py-4 md:py-5 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Filter className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white">Match Filters</h2>
                    <p className="text-xs md:text-sm text-white/80">
                      {getActiveFilterCount()} {getActiveFilterCount() === 1 ? 'filter' : 'filters'} active
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
                {/* Age Range */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Age Range:
                    </label>
                    <span className="text-sm font-bold text-[#059467]">{filters.ageRange[0]} - {filters.ageRange[1]} years</span>
                  </div>
                  
                  {/* Single row with both sliders */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-2 font-semibold">Min: {filters.ageRange[0]}</div>
                      <input
                        type="range"
                        min="18"
                        max="100"
                        value={filters.ageRange[0]}
                        onChange={(e) => {
                          const minAge = parseInt(e.target.value);
                          const maxAge = filters.ageRange[1];
                          if (minAge <= maxAge) {
                            setFilters({ ...filters, ageRange: [minAge, maxAge] });
                          }
                        }}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#059467]"
                      />
                    </div>
                    <div className="text-slate-400 text-sm font-bold">to</div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-2 font-semibold">Max: {filters.ageRange[1]}</div>
                      <input
                        type="range"
                        min="18"
                        max="100"
                        value={filters.ageRange[1]}
                        onChange={(e) => {
                          const maxAge = parseInt(e.target.value);
                          const minAge = filters.ageRange[0];
                          if (maxAge >= minAge) {
                            setFilters({ ...filters, ageRange: [minAge, maxAge] });
                          }
                        }}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#059467]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>18</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Gender Preference */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 md:p-5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Preferred Gender
                    </span>
                    {filters.selectedGenders.length > 0 && (
                      <span className="text-xs text-[#059467]">({filters.selectedGenders.length} selected)</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Male', 'Female', 'Non-binary', 'Any'].map(gender => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => {
                          const genders = filters.selectedGenders;
                          if (gender === 'Any') {
                            setFilters({
                              ...filters,
                              selectedGenders: genders.includes('Any') ? [] : ['Any']
                            });
                          } else {
                            const newGenders = genders.filter(g => g !== 'Any');
                            setFilters({
                              ...filters,
                              selectedGenders: newGenders.includes(gender)
                                ? newGenders.filter(g => g !== gender)
                                : [...newGenders, gender]
                            });
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          filters.selectedGenders.includes(gender)
                            ? 'bg-[#059467] text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Select "Any" to see all genders</p>
                </div>

                {/* Travel Style */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 md:p-5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-2">
                      <Mountain className="w-4 h-4" />
                      Preferred Travel Styles
                    </span>
                    {filters.selectedTravelStyles.length > 0 && (
                      <span className="text-xs text-[#059467]">({filters.selectedTravelStyles.length} selected)</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLES.map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          const styles = filters.selectedTravelStyles;
                          setFilters({
                            ...filters,
                            selectedTravelStyles: styles.includes(style)
                              ? styles.filter(s => s !== style)
                              : [...styles, style]
                          });
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          filters.selectedTravelStyles.includes(style)
                            ? 'bg-[#059467] text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Select multiple styles to find similar travelers</p>
                </div>

                {/* Interests */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 md:p-5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Preferred Interests
                    </span>
                    {filters.selectedInterests.length > 0 && (
                      <span className="text-xs text-[#059467]">({filters.selectedInterests.length} selected)</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_INTERESTS.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => {
                          const interests = filters.selectedInterests;
                          setFilters({
                            ...filters,
                            selectedInterests: interests.includes(interest)
                              ? interests.filter(i => i !== interest)
                              : [...interests, interest]
                          });
                        }}
                        className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                          filters.selectedInterests.includes(interest)
                            ? 'bg-pink-500 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">More interests = better matches!</p>
                </div>

                {/* Location Range */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 md:p-5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Search Radius:
                    </span>
                    <span className="text-[#059467] whitespace-nowrap">
                      {filters.locationRange === 0 ? 'Nearby only (< 10 km)' : 
                       filters.locationRange >= 500 ? 'Worldwide (500+ km)' : 
                       `Within ${filters.locationRange} km`}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={filters.locationRange}
                    onChange={(e) => setFilters({
                      ...filters,
                      locationRange: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#059467]"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>Nearby</span>
                    <span>Regional</span>
                    <span>Worldwide</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                    {filters.locationRange < 50 ? 'Perfect for finding local travel buddies' :
                     filters.locationRange < 200 ? 'Great for regional adventures' :
                     'Ideal for international travel connections'}
                  </p>
                </div>

                {/* Preview Summary */}
                <div className="bg-gradient-to-br from-[#059467]/10 to-pink-500/10 rounded-2xl p-4 md:p-5 border-2 border-dashed border-[#059467]/30">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Filter Summary
                  </h4>
                  <div className="space-y-2 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                    <p>• Age: <strong>{filters.ageRange[0]}-{filters.ageRange[1]} years</strong></p>
                    <p>• Gender: <strong>{filters.selectedGenders.length === 0 ? 'Any' : filters.selectedGenders.join(', ')}</strong></p>
                    <p>• Travel styles: <strong>{filters.selectedTravelStyles.length === 0 ? 'Any' : filters.selectedTravelStyles.join(', ')}</strong></p>
                    <p>• Interests: <strong>{filters.selectedInterests.length === 0 ? 'Any' : filters.selectedInterests.length + ' selected'}</strong></p>
                    <p>• Range: <strong>{filters.locationRange === 0 ? '< 10' : filters.locationRange >= 500 ? '500+' : filters.locationRange} km</strong></p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 md:px-6 py-3 md:py-4 flex gap-2 md:gap-3 rounded-b-3xl">
                <button
                  onClick={handleReset}
                  className="flex-1 h-11 md:h-12 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={handleApply}
                  className="flex-[2] h-11 md:h-12 bg-gradient-to-r from-[#059467] to-[#047a55] hover:from-[#047a55] hover:to-[#036644] text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-base shadow-lg shadow-[#059467]/30 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchFilterModal;
