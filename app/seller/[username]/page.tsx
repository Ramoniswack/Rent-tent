'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { gearAPI } from '../../../services/api';
import { formatNPR } from '../../../lib/currency';
import { getCityName } from '../../../lib/location';
import {
  ArrowLeft,
  MapPin,
  Star,
  Package,
  BadgeCheck,
  Loader2,
  Mail,
  User as UserIcon,
  ShoppingBag
} from 'lucide-react';

interface GearItem {
  _id: string;
  title: string;
  category: string;
  location: string;
  pricePerDay: number;
  rating: number;
  images?: string[];
  available: boolean;
  owner: {
    _id: string;
    name: string;
    profilePicture?: string;
    username: string;
  };
}

interface SellerData {
  user: {
    _id: string;
    name: string;
    username: string;
    profilePicture?: string;
    location?: string;
    bio?: string;
  };
  gear: GearItem[];
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (username) {
      fetchSellerGear();
    }
  }, [username]);

  const fetchSellerGear = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await gearAPI.getGearByUser(username);
      console.log('Seller data received:', data);
      setSellerData(data);
    } catch (err: any) {
      console.error('Error fetching seller gear:', err);
      setError(err.message || 'Failed to load seller information');
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#059467] animate-spin" />
            <p className="text-sm sm:text-base text-[#0d1c17]/60 dark:text-white/60">Loading seller dashboard...</p>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  if (error || !sellerData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center px-3 sm:px-4 py-8">
          <div className="text-center max-w-md w-full">
            <div className="mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0d1c17] dark:text-white mb-2">
                Seller Not Found
              </h2>
              <p className="text-sm sm:text-base text-[#0d1c17]/60 dark:text-white/60 mb-6 px-4">
                {error || 'This seller does not exist or has no gear listed.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
              <button
                onClick={() => router.push('/gear')}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-[#059467] text-white rounded-full text-sm sm:text-base font-medium hover:bg-[#047854] transition-colors active:scale-95 touch-manipulation"
              >
                Browse All Gear
              </button>
              <button
                onClick={() => router.back()}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-600 text-[#0d1c17] dark:text-white rounded-full text-sm sm:text-base font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors active:scale-95 touch-manipulation"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  const { user, gear } = sellerData;
  const ownerProfilePic = user.profilePicture || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059467&color=fff&size=200`;

  // Get unique categories from gear
  const categories = Array.from(new Set(gear.map(item => item.category)));

  // Filter gear by selected category
  const filteredGear = selectedCategory 
    ? gear.filter(item => item.category === selectedCategory)
    : gear;

  // Calculate average rating
  const avgRating = gear.length > 0 
    ? (gear.reduce((sum, item) => sum + (item.rating || 0), 0) / gear.length).toFixed(1)
    : '0.0';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] pb-24 md:pb-8">
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-20 py-4 sm:py-6 md:py-10">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#059467] hover:text-[#047854] font-medium mb-4 sm:mb-6 transition-colors active:scale-95 touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back</span>
          </button>

          {/* Seller Profile Header */}
          <div className="bg-white dark:bg-[#1a2c26] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-[#059467]/10 mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-2 sm:ring-4 ring-[#059467]/20 shadow-lg">
                  <img
                    src={ownerProfilePic}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059467&color=fff&size=200`;
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-white dark:bg-[#1a2c26] rounded-full p-1 sm:p-1.5 shadow-md">
                  <BadgeCheck className="w-4 h-4 sm:w-6 sm:h-6 text-[#059467]" />
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex-1 text-center md:text-left w-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0d1c17] dark:text-white mb-1 sm:mb-2">
                  {user.name}
                </h1>
                <p className="text-[#059467] font-medium text-sm sm:text-base mb-2 sm:mb-3">@{user.username}</p>
                
                {user.location && (
                  <div className="flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{getCityName(user.location)}</span>
                  </div>
                )}

                {user.bio && (
                  <p className="text-sm sm:text-base text-[#0d1c17]/70 dark:text-white/70 max-w-2xl mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#059467]/10 rounded-full w-full sm:w-auto justify-center">
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#059467]" />
                    <span className="text-xs sm:text-sm font-bold text-[#059467]">
                      {gear.length} {gear.length === 1 ? 'Item' : 'Items'} Listed
                    </span>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/profile/${user.username}`)}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-[#059467] text-[#059467] rounded-full text-xs sm:text-sm font-medium hover:bg-[#059467]/5 transition-colors active:scale-95 touch-manipulation w-full sm:w-auto"
                  >
                    <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="whitespace-nowrap">View Full Profile</span>
                  </button>

                  <button
                    onClick={() => router.push(`/messages?user=${user._id}`)}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#059467] text-white rounded-full text-xs sm:text-sm font-medium hover:bg-[#047854] transition-colors active:scale-95 touch-manipulation w-full sm:w-auto"
                  >
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="whitespace-nowrap">Message</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page Title */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0d1c17] dark:text-white flex items-center gap-2 sm:gap-3">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#059467]" />
              <span>Available Gear</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Browse all items listed by {user.name}
            </p>
          </div>

          {/* Stats and Filters */}
          {gear.length > 0 && (
            <div className="bg-white dark:bg-[#1a2c26] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100 dark:border-[#059467]/10 mb-4 sm:mb-6">
              <div className="flex flex-col gap-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:flex md:flex-wrap md:items-center md:gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#059467] flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Total Items</p>
                      <p className="text-base sm:text-lg font-bold text-[#0d1c17] dark:text-white">{gear.length}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#f59e0b] fill-[#f59e0b] flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Avg Rating</p>
                      <p className="text-base sm:text-lg font-bold text-[#0d1c17] dark:text-white">{avgRating}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2">
                    <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#059467] flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Categories</p>
                      <p className="text-base sm:text-lg font-bold text-[#0d1c17] dark:text-white">{categories.length}</p>
                    </div>
                  </div>
                </div>

                {/* Category Filter */}
                {categories.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors active:scale-95 touch-manipulation ${
                        !selectedCategory
                          ? 'bg-[#059467] text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      All ({gear.length})
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors active:scale-95 touch-manipulation ${
                          selectedCategory === category
                            ? 'bg-[#059467] text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category} ({gear.filter(g => g.category === category).length})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gear Grid */}
          {filteredGear.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
              {filteredGear.map((item) => (
                <div
                  key={item._id}
                  className="group bg-white dark:bg-[#1a2c26] rounded-xl overflow-hidden hover:shadow-xl hover:shadow-[#059467]/5 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-[#059467]/5 cursor-pointer"
                  onClick={() => router.push(`/gear/${item._id}`)}
                >
                  <div className="p-3 md:p-4">
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:rounded-[32px]">
                      <img
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'}
                      />
                      {item.available && (
                        <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-white/90 backdrop-blur-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full flex items-center gap-1 md:gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#059467] animate-pulse" />
                          <span className="text-[10px] md:text-xs font-bold text-[#059467]">Available</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4">
                        <span className={`${getCategoryColor(item.category)} px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold backdrop-blur-md border`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
                    <div className="flex justify-between items-start mb-2 md:mb-3">
                      <h3 className="text-base md:text-lg font-bold text-[#0d1c17] dark:text-white leading-tight pr-2 md:pr-4">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-0.5 md:gap-1 bg-yellow-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg flex-shrink-0">
                        <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                        <span className="text-xs md:text-sm font-bold text-[#0d1c17]">{item.rating || 4.5}</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-gray-50 dark:border-white/5 pt-3 md:pt-4 mt-2">
                      <div className="flex items-center gap-1.5 md:gap-2 text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium truncate">{getCityName(item.location)}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="block text-lg md:text-xl font-black text-[#059467]">
                          {formatNPR(item.pricePerDay, false)}
                          <span className="text-xs md:text-sm font-medium text-gray-400 dark:text-gray-500">/day</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedCategory ? (
            <div className="bg-white dark:bg-[#1a2c26] rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-gray-100 dark:border-[#059467]/10">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-[#0d1c17] dark:text-white mb-2">
                No {selectedCategory} Items
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                {user.name} doesn't have any {selectedCategory} gear listed.
              </p>
              <button
                onClick={() => setSelectedCategory('')}
                className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#059467] text-white rounded-full text-sm sm:text-base font-medium hover:bg-[#047854] transition-colors active:scale-95 touch-manipulation"
              >
                View All Items
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1a2c26] rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-gray-100 dark:border-[#059467]/10">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-[#0d1c17] dark:text-white mb-2">
                No Gear Listed Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                {user.name} hasn't listed any gear for rent yet.
              </p>
            </div>
          )}
        </main>
      </div>
      
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
