'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth'; // Added to get user name
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { gearAPI } from '../../services/api';
import { formatNPR } from '../../lib/currency';
import { getCityName } from '../../lib/location';
import { GearCardSkeleton } from '../../components/SkeletonCard';
import {
  Search,
  MapPin,
  Tag,
  ChevronDown,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  X,
  SlidersHorizontal
} from 'lucide-react';

interface GearItem {
  _id?: string;
  id?: number;
  title: string;
  category: string;
  categoryColor: string;
  location: string;
  pricePerDay: number;
  rating: number;
  images?: string[];
  image?: string;
  available: boolean;
  owner: {
    _id?: string;
    name: string;
    profilePicture?: string;
    avatar?: string;
    verified?: boolean;
  };
}

export default function GearPage() {
  const router = useRouter();
  const { user } = useAuth(); // Retrieve user for personalization
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(500);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [allGearItems, setAllGearItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const locationDropdownRef = useRef<HTMLDivElement>(null);

  const categories = ['Camping', 'Photography', 'Tech', 'Office', 'Sports', 'Audio'];
  
  const locations = Array.from(new Set(allGearItems.map(item => item.location).filter(Boolean)));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchGear();
    setCurrentPage(1);
  }, [searchQuery, priceRange, availableOnly, selectedLocation, selectedCategory]);

  useEffect(() => {
    const fetchAllGear = async () => {
      try {
        const data = await gearAPI.getAll({});
        const mappedData = data.map((item: any) => ({
          ...item,
          categoryColor: getCategoryColor(item.category),
          image: item.images?.[0] || 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
          rating: item.rating || 4.5,
          owner: {
            ...item.owner,
            avatar: item.owner?.profilePicture || 'https://i.pravatar.cc/100?img=5',
            verified: false
          }
        }));
        setAllGearItems(mappedData.length > 0 ? mappedData : fallbackGearItems);
      } catch (error) {
        console.error('Error fetching all gear:', error);
        setAllGearItems(fallbackGearItems);
      }
    };
    fetchAllGear();
  }, []);

  const fetchGear = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchQuery) filters.search = searchQuery;
      if (availableOnly) filters.available = true;
      if (priceRange < 500) filters.maxPrice = priceRange;
      if (selectedLocation) filters.location = selectedLocation;
      if (selectedCategory) filters.category = selectedCategory;

      const data = await gearAPI.getAll(filters);
      
      const mappedData = data.map((item: any) => ({
        ...item,
        categoryColor: getCategoryColor(item.category),
        image: item.images?.[0] || 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
        rating: item.rating || 4.5,
        owner: {
          ...item.owner,
          avatar: item.owner?.profilePicture || 'https://i.pravatar.cc/100?img=5',
          verified: false
        }
      }));
      
      setGearItems(mappedData.length > 0 ? mappedData : fallbackGearItems);
    } catch (error) {
      console.error('Error fetching gear:', error);
      setGearItems(fallbackGearItems);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Camping': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'Photography': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Tech': 'bg-gray-800/10 text-gray-700 dark:text-gray-300 dark:bg-gray-700/50 border-gray-800/10',
      'Office': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      'Sports': 'bg-teal-500/10 text-teal-600 border-teal-500/20',
      'Audio': 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    };
    return colors[category] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  const fallbackGearItems: GearItem[] = [
    {
      id: 1,
      title: 'Ultralight 2-Person Tent',
      category: 'Camping',
      categoryColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      location: 'Bali, Indonesia',
      pricePerDay: 25,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
      available: true,
      owner: { name: 'Sarah J.', avatar: 'https://i.pravatar.cc/100?img=5', verified: true }
    },
    {
      id: 2,
      title: 'Sony A7III Camera Kit',
      category: 'Photography',
      categoryColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      location: 'Chiang Mai, TH',
      pricePerDay: 65,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1606980707986-e660e4d1e3f7?w=800&q=80',
      available: true,
      owner: { name: 'Mike T.', avatar: 'https://i.pravatar.cc/100?img=12', verified: true }
    },
    {
      id: 3,
      title: 'Starlink Roam Dish',
      category: 'Tech',
      categoryColor: 'bg-gray-800/10 text-gray-700 dark:text-gray-300 dark:bg-gray-700/50 border-gray-800/10',
      location: 'Lisbon, PT',
      pricePerDay: 15,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      available: true,
      owner: { name: 'Elena R.', avatar: 'https://i.pravatar.cc/100?img=9', verified: false }
    },
    {
      id: 4,
      title: 'Portable Standing Desk',
      category: 'Office',
      categoryColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      location: 'Mexico City, MX',
      pricePerDay: 8,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&q=80',
      available: true,
      owner: { name: 'Juan P.', avatar: 'https://i.pravatar.cc/100?img=13', verified: true }
    },
    {
      id: 5,
      title: 'Surfboard (Longboard)',
      category: 'Sports',
      categoryColor: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
      location: 'Canggu, Bali',
      pricePerDay: 12,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&q=80',
      available: true,
      owner: { name: 'Ami L.', avatar: 'https://i.pravatar.cc/100?img=10', verified: false }
    },
    {
      id: 6,
      title: 'Noise Cancelling Headset',
      category: 'Audio',
      categoryColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      location: 'Medellin, CO',
      pricePerDay: 5,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80',
      available: true,
      owner: { name: 'Carlos M.', avatar: 'https://i.pravatar.cc/100?img=11', verified: true }
    }
  ];

  const totalPages = Math.ceil(gearItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = gearItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] pb-20 md:pb-0">
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 py-6 md:py-10">
          
          {/* Mobile Hero Section */}
          <div className="md:hidden mb-6">
            <h1 className="text-2xl font-black text-[#0f172a] dark:text-white mb-1">
              Need gear, {user?.name?.split(' ')[0] || 'Explorer'}?
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Rent high-quality equipment from trusted nomads
            </p>
          </div>

          {/* Page Title & Primary Action - Hidden on Mobile */}
          <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6 md:mb-10">
            <div>
              <h2 className="text-[#0f172a] dark:text-white text-2xl md:text-[30px] font-black leading-tight tracking-tight">
                Rent Gear
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
                High-quality gear from trusted nomads.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
              <button 
                onClick={() => router.push('/rentals/dashboard')}
                className="flex items-center justify-center gap-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-[#059467] border-2 border-[#059467] px-4 md:px-6 py-2.5 md:py-3 rounded-full font-bold transition-all transform hover:-translate-y-0.5 text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Rentals
              </button>
              <button 
                onClick={() => router.push('/gear/add')}
                className="flex items-center justify-center gap-2 bg-[#059467] hover:bg-[#047854] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full font-bold shadow-lg shadow-[#059467]/25 transition-all transform hover:-translate-y-0.5 text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                List Your Gear
              </button>
            </div>
          </div>

          {/* Navigation & Search Section */}
          <div className="flex flex-col gap-4 mb-6 md:mb-10">
            <div className="flex items-center gap-2 md:gap-3 w-full">
              {/* Search Bar */}
              <div className="relative flex-1 group lg:max-w-xl">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-[#059467] transition-colors" />
                <input
                  className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 bg-white dark:bg-[#1a2c26] border-none rounded-full shadow-sm ring-1 ring-gray-200 dark:ring-[#059467]/10 focus:ring-2 focus:ring-[#059467] outline-none text-[#0f172a] dark:text-white placeholder-gray-400 text-sm md:text-base transition-all"
                  placeholder="Search gear..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Mobile Filter Toggle */}
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="lg:hidden bg-white dark:bg-[#1a2c26] p-3 md:p-4 rounded-full shadow-sm ring-1 ring-gray-200 dark:ring-[#059467]/10 text-gray-600 dark:text-gray-300 flex-shrink-0"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Horizontal Filter Chips for Categories */}
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button
                onClick={() => setSelectedCategory('')}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                  !selectedCategory
                    ? 'bg-[#059467] text-white ring-2 ring-[#059467] ring-offset-1 dark:ring-offset-[#0f231d]'
                    : 'bg-white dark:bg-[#1a2c26] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#152e26] ring-1 ring-gray-200 dark:ring-[#059467]/20'
                }`}
              >
                All Gear
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    selectedCategory === category
                      ? 'bg-[#059467] text-white ring-2 ring-[#059467] ring-offset-1 dark:ring-offset-[#0f231d]'
                      : 'bg-white dark:bg-[#1a2c26] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#152e26] ring-1 ring-gray-200 dark:ring-[#059467]/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Advanced Filters (Location, Price, Available) */}
            <div className={`${showAdvancedFilters ? 'flex' : 'hidden lg:flex'} flex-col lg:flex-row gap-4 lg:gap-6 bg-white dark:bg-[#1a2c26] p-4 lg:p-0 lg:bg-transparent lg:dark:bg-transparent rounded-2xl lg:rounded-none shadow-sm lg:shadow-none ring-1 ring-gray-200 dark:ring-[#059467]/10 lg:ring-0 items-start lg:items-center`}>
              
              {/* Location Dropdown */}
              <div ref={locationDropdownRef} className="relative group w-full lg:w-48">
                <button 
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="w-full h-10 md:h-12 px-4 rounded-xl lg:rounded-full bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#152e26] transition-colors border border-transparent lg:border-gray-200 lg:dark:border-[#059467]/20"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-[#0f172a] dark:text-white truncate">
                    <MapPin className="text-[#059467] w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{selectedLocation || 'Any Location'}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
                {showLocationDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1a2c26] rounded-xl shadow-xl border border-gray-100 dark:border-[#059467]/10 py-2 z-50 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedLocation(''); setShowLocationDropdown(false); }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-[#0f231d] text-[#0f172a] dark:text-white ${!selectedLocation ? 'bg-gray-50 dark:bg-[#0f231d] font-bold' : ''}`}
                    >
                      Any Location
                    </button>
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => { setSelectedLocation(location); setShowLocationDropdown(false); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-[#0f231d] text-[#0f172a] dark:text-white ${selectedLocation === location ? 'bg-gray-50 dark:bg-[#0f231d] font-bold' : ''}`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="flex flex-col gap-1.5 w-full lg:w-48 lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-6">
                <div className="flex justify-between text-xs font-bold text-[#0f172a] dark:text-white">
                  <span>Max Price</span>
                  <span className="text-[#059467]">₹{priceRange}/day</span>
                </div>
                <input
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#059467]"
                  max="500"
                  min="0"
                  type="range"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                />
              </div>

              {/* Available Toggle */}
              <label className="flex items-center gap-3 cursor-pointer group lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-6 w-full lg:w-auto mt-2 lg:mt-0">
                <div className="relative">
                  <input
                    className="sr-only peer"
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059467]" />
                </div>
                <span className="text-sm font-bold text-[#0f172a] dark:text-white group-hover:text-[#059467] transition-colors">
                  Available Now
                </span>
              </label>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-16">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GearCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Gear Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-16">
              {currentItems.map((item) => (
              <div
                key={item._id || item.id}
                className="group bg-white dark:bg-[#1a2c26] rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-[#059467]/10 transition-all duration-300 transform hover:-translate-y-1 shadow-xl shadow-slate-900/5 dark:shadow-black/20 cursor-pointer flex flex-col"
                onClick={() => router.push(`/gear/${item._id || item.id}`)}
              >
                <div className="p-3 md:p-4 pb-0">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
                    <img
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={item.image}
                    />
                    {item.available && (
                      <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#059467] animate-pulse" />
                        <span className="text-[10px] md:text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-wider">Available</span>
                      </div>
                    )}
                    <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4">
                      <span className={`${item.categoryColor} px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold backdrop-blur-md border bg-white/90 dark:bg-slate-900/90 shadow-sm uppercase tracking-wider`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <h3 className="text-lg md:text-xl font-black text-[#0f172a] dark:text-white leading-tight pr-2 md:pr-4 group-hover:text-[#059467] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 bg-[#f5f8f7] dark:bg-slate-800 px-2 py-1 rounded-lg flex-shrink-0">
                      <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                      <span className="text-sm font-bold text-[#0f172a] dark:text-white">{item.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 dark:text-slate-400 mb-4 md:mb-6">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{getCityName(item.location)}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
                    {/* Owner Info */}
                    <div className="flex items-center gap-2">
                      <img
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-slate-800 ring-1 ring-[#059467]/20 object-cover flex-shrink-0"
                        alt={item.owner.name}
                        src={item.owner.avatar}
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">Listed by</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs md:text-sm font-bold text-[#0f172a] dark:text-white truncate max-w-[100px]">{item.owner.name}</span>
                          {item.owner.verified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <span className="block text-xl md:text-2xl font-black text-[#059467]">
                        {formatNPR(item.pricePerDay, false)}
                        <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">/day</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && gearItems.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-2 flex-wrap">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#1a2c26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#0f172a] dark:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="text-gray-400 px-1">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-all ${
                      currentPage === page
                        ? 'bg-[#059467] text-white shadow-md shadow-[#059467]/30'
                        : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a2c26]'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#1a2c26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#0f172a] dark:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Results info */}
          {!loading && gearItems.length > 0 && (
            <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(endIndex, gearItems.length)} of {gearItems.length} items
            </div>
          )}
        </main>
        
        {/* My Rentals Button - Mobile Only */}
        <div className="md:hidden px-4 pb-24">
          <button 
            onClick={() => router.push('/rentals/dashboard')}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#1a2c26] hover:bg-gray-50 dark:hover:bg-[#152e26] text-[#059467] border-2 border-[#059467] px-6 py-3 rounded-full font-bold transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Rentals
          </button>
        </div>
      </div>
      
      {/* Floating Action Button - Mobile Only */}
      <button
        onClick={() => router.push('/gear/add')}
        className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 bg-[#059467] hover:bg-[#047854] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="List your gear"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>
      
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}