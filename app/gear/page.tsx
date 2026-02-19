'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { gearAPI } from '../../services/api';
import {
  Search,
  MapPin,
  Tag,
  ChevronDown,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  BadgeCheck
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
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(500);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [allGearItems, setAllGearItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);

  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const categories = ['Camping', 'Photography', 'Tech', 'Office', 'Sports', 'Audio'];
  
  // Extract unique locations from all gear items
  const locations = Array.from(new Set(allGearItems.map(item => item.location).filter(Boolean)));

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchGear();
  }, [searchQuery, priceRange, availableOnly, selectedLocation, selectedCategory]);

  // Fetch all gear items once to populate location dropdown
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
      
      // Map backend data to frontend format
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
      // Use fallback data on error
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
      owner: {
        name: 'Sarah J.',
        avatar: 'https://i.pravatar.cc/100?img=5',
        verified: true
      }
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
      owner: {
        name: 'Mike T.',
        avatar: 'https://i.pravatar.cc/100?img=12',
        verified: true
      }
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
      owner: {
        name: 'Elena R.',
        avatar: 'https://i.pravatar.cc/100?img=9',
        verified: false
      }
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
      owner: {
        name: 'Juan P.',
        avatar: 'https://i.pravatar.cc/100?img=13',
        verified: true
      }
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
      owner: {
        name: 'Ami L.',
        avatar: 'https://i.pravatar.cc/100?img=10',
        verified: false
      }
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
      owner: {
        name: 'Carlos M.',
        avatar: 'https://i.pravatar.cc/100?img=11',
        verified: true
      }
    }
  ];

  return (
    <>
      {/* Header - Hidden on mobile */}
      <div className="hidden md:block">
        <Header />
      </div>
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] pb-20 md:pb-0">
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 py-6 md:py-10">
          {/* Page Title & Primary Action */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6 md:mb-10">
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

          {/* Advanced Filter Bar */}
          <div className="bg-white dark:bg-[#1a2c26] p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#059467]/10 mb-6 md:mb-12">
            <div className="flex flex-col xl:flex-row gap-3 md:gap-4 items-center justify-between">
              {/* Search & Dropdowns Group */}
              <div className="flex flex-col lg:flex-row gap-2 md:gap-3 w-full xl:w-auto flex-1">
                {/* Search Input */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[#059467] w-4 h-4 md:w-5 md:h-5" />
                  <input
                    className="w-full h-10 md:h-12 pl-10 md:pl-12 pr-3 md:pr-4 rounded-xl bg-[#f5f8f7] dark:bg-[#0f231d] border-transparent focus:border-[#059467] focus:ring-0 text-[#0f172a] dark:text-white placeholder-gray-400 text-sm md:text-base"
                    placeholder="Search gear..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Location Dropdown */}
                <div ref={locationDropdownRef} className="relative group w-full lg:w-auto lg:min-w-[180px]">
                  <button 
                    onClick={() => {
                      setShowLocationDropdown(!showLocationDropdown);
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full h-10 md:h-12 px-3 md:px-4 rounded-full bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#152e26] transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs md:text-sm font-medium text-[#0f172a] dark:text-white truncate">
                      <MapPin className="text-[#059467] w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">{selectedLocation || 'Anywhere'}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                  </button>
                  {showLocationDropdown && (
                    <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1a2c26] rounded-xl shadow-lg border border-gray-100 dark:border-[#059467]/10 py-2 z-50 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedLocation('');
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-[#0f231d] text-[#0f172a] dark:text-white ${!selectedLocation ? 'bg-gray-50 dark:bg-[#0f231d] font-bold' : ''}`}
                      >
                        Anywhere
                      </button>
                      {locations.map((location) => (
                        <button
                          key={location}
                          onClick={() => {
                            setSelectedLocation(location);
                            setShowLocationDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-[#0f231d] text-[#0f172a] dark:text-white ${selectedLocation === location ? 'bg-gray-50 dark:bg-[#0f231d] font-bold' : ''}`}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Dropdown */}
                <div ref={categoryDropdownRef} className="relative group w-full lg:w-auto lg:min-w-[180px]">
                  <button 
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                      setShowLocationDropdown(false);
                    }}
                    className="w-full h-10 md:h-12 px-3 md:px-4 rounded-full bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#152e26] transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs md:text-sm font-medium text-[#0f172a] dark:text-white truncate">
                      <Tag className="text-[#059467] w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">{selectedCategory || 'All Categories'}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1a2c26] rounded-xl shadow-lg border border-gray-100 dark:border-[#059467]/10 py-2 z-50">
                      <button
                        onClick={() => {
                          setSelectedCategory('');
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-[#0f231d] text-[#0f172a] dark:text-white ${!selectedCategory ? 'bg-gray-50 dark:bg-[#0f231d] font-bold' : ''}`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-[#0f231d] text-[#0f172a] dark:text-white ${selectedCategory === category ? 'bg-gray-50 dark:bg-[#0f231d] font-bold' : ''}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Toggle Group */}
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full xl:w-auto items-center xl:border-l xl:border-gray-100 dark:xl:border-gray-800 xl:pl-6">
                {/* Price Range */}
                <div className="flex flex-col gap-1 w-full sm:w-40 md:w-48">
                  <div className="flex justify-between text-xs font-bold text-[#0f172a] dark:text-white">
                    <span>Price</span>
                    <span className="text-[#059467]">${0} - ${priceRange}</span>
                  </div>
                  <input
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    max="500"
                    min="0"
                    type="range"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                  />
                </div>

                {/* Available Toggle */}
                <label className="flex items-center gap-2 md:gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      className="sr-only peer"
                      type="checkbox"
                      checked={availableOnly}
                      onChange={(e) => setAvailableOnly(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#059467]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059467]" />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-[#0f172a] dark:text-white whitespace-nowrap group-hover:text-[#059467] transition-colors">
                    Available Now
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-[#059467] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Gear Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-16">
              {gearItems.map((item) => (
              <div
                key={item._id || item.id}
                className="group bg-white dark:bg-[#1a2c26] rounded-xl overflow-hidden hover:shadow-xl hover:shadow-[#059467]/5 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-[#059467]/5 cursor-pointer"
                onClick={() => router.push(`/gear/${item._id || item.id}`)}
              >
                <div className="p-3 md:p-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:rounded-[32px]">
                    <img
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={item.image}
                    />
                    {item.available && (
                      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-white/90 backdrop-blur-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full flex items-center gap-1 md:gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#059467] animate-pulse" />
                        <span className="text-[10px] md:text-xs font-bold text-[#059467]">Available</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4">
                      <span className={`${item.categoryColor} px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold backdrop-blur-md border`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <h3 className="text-base md:text-lg font-bold text-[#0f172a] dark:text-white leading-tight pr-2 md:pr-4">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-0.5 md:gap-1 bg-yellow-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg flex-shrink-0">
                      <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                      <span className="text-xs md:text-sm font-bold text-[#0f172a]">{item.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-gray-50 dark:border-white/5 pt-3 md:pt-4 mt-2">
                    <div className="flex items-center gap-1.5 md:gap-2 text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="text-xs md:text-sm font-medium truncate">{item.location}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-lg md:text-xl font-black text-[#059467]">
                        ${item.pricePerDay}
                        <span className="text-xs md:text-sm font-medium text-gray-400 dark:text-gray-500">/day</span>
                      </span>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="mt-3 md:mt-4 flex items-center gap-1.5 md:gap-2 pt-2 md:pt-3">
                    <img
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-gray-200 flex-shrink-0"
                      alt={item.owner.name}
                      src={item.owner.avatar}
                    />
                    <span className="text-[10px] md:text-xs text-gray-400 truncate">Listed by {item.owner.name}</span>
                    {item.owner.verified && (
                      <BadgeCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-10 h-10 rounded-full bg-[#059467] text-white font-bold flex items-center justify-center shadow-md shadow-[#059467]/30">
              1
            </button>
            <button className="w-10 h-10 rounded-full text-gray-500 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center">
              2
            </button>
            <button className="w-10 h-10 rounded-full text-gray-500 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center">
              3
            </button>
            <span className="text-gray-400 px-1">...</span>
            <button className="w-10 h-10 rounded-full text-gray-500 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center">
              12
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            </button>
          </div>
        </main>
      </div>
      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
